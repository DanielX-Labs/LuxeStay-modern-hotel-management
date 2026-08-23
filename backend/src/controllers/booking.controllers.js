const crypto = require('crypto');
/* eslint-disable max-len, no-await-in-loop */
const mongoose = require('mongoose');
const Room = require('../models/room.model');
const Booking = require('../models/booking.model');
const { errorResponse, successResponse } = require('../configs/app.response');
const { generateInvoice, createPdf } = require('../services/invoice.service');
const sendBookingEmail = require('../services/booking.email.service');
const logger = require('../middleware/winston.logger');

const ACTIVE = ['pending', 'confirmed', 'checked_in', 'approved'];
const ALIASES = {
  approved: 'confirmed', cancel: 'cancelled', 'in-reviews': 'checked_out', completed: 'checked_out'
};
const TRANSITIONS = {
  pending: ['confirmed', 'cancelled', 'no_show'], confirmed: ['checked_in', 'cancelled', 'no_show'], checked_in: ['checked_out', 'no_show'], checked_out: [], cancelled: [], no_show: []
};
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const normalized = (status) => ALIASES[status] || status;
const fail = (res, code, message) => res.status(code).json(errorResponse(1, 'FAILED', message));
const parseDate = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; };
const parseRange = (body) => {
  const values = (Array.isArray(body.booking_dates) ? body.booking_dates : []).map(parseDate).filter(Boolean).sort((a, b) => a - b);
  const checkIn = parseDate(body.check_in) || values[0];
  let checkOut = parseDate(body.check_out);
  if (!checkOut && values.length) { checkOut = new Date(values[values.length - 1]); checkOut.setUTCDate(checkOut.getUTCDate() + 1); }
  return { checkIn, checkOut };
};
const nights = (start, end) => Math.ceil((end - start) / 86400000);
const makeIds = () => { const year = new Date().getUTCFullYear(); const suffix = crypto.randomInt(1000000).toString().padStart(6, '0'); return { booking_id: `BK-${year}-${suffix}`, invoice_id: `INV-${year}-${suffix}` }; };
const stayDates = (start, count) => Array.from({ length: count }, (_, index) => { const date = new Date(start); date.setUTCDate(date.getUTCDate() + index); return date; });
const overlap = (roomId, checkIn, checkOut) => Booking.exists({ room_id: roomId, booking_status: { $in: ACTIVE }, $or: [{ check_in: { $lt: checkOut }, check_out: { $gt: checkIn } }, { check_in: { $exists: false }, booking_dates: { $elemMatch: { $gte: checkIn, $lt: checkOut } } }] });
const load = (filter) => Booking.findOne(filter).populate('room_id').populate('booking_by').populate('reviews');
const release = (booking) => Room.updateOne({ _id: booking.room_id._id || booking.room_id }, { $pull: { reservations: { booking_id: booking._id } } });
const serialize = (booking) => {
  const room = booking.room_id || {}; const user = booking.booking_by || {};
  return {
    id: booking._id,
    booking_id: booking.booking_id,
    invoice_id: booking.invoice_id,
    booking_dates: booking.booking_dates,
    check_in: booking.check_in,
    check_out: booking.check_out,
    number_of_nights: booking.number_of_nights,
    room_rate: booking.room_rate,
    total_amount: booking.total_amount,
    booking_status: normalized(booking.booking_status),
    payment_method: 'pay_at_hotel',
    payment_status: booking.payment_status,
    invoice_available: Boolean(booking.invoice_url),
    cancellation_reason: booking.cancellation_reason,
    cancelled_at: booking.cancelled_at,
    cancelled_by: booking.cancelled_by,
    reviews: booking.reviews || null,
    booking_by: {
      id: user._id, fullName: user.fullName, email: user.email, phone: user.phone
    },
    room: {
      id: room._id, room_name: room.room_name, room_number: room.room_name, room_slug: room.room_slug, room_type: room.room_type, room_price: room.room_price, room_status: room.room_status
    },
    created_at: booking.createdAt,
    updated_at: booking.updatedAt
  };
};

exports.checkRoomAvailability = async (req, res) => {
  try {
    const { checkIn, checkOut } = parseRange(req.query);
    if (!validId(req.params.id) || !checkIn || !checkOut || checkOut <= checkIn) return fail(res, 400, 'Valid check-in and check-out dates are required.');
    const room = await Room.findById(req.params.id);
    if (!room || room.room_status === 'unavailable') return fail(res, 404, 'Room does not exist or is unavailable.');
    const unavailable = await overlap(room._id, checkIn, checkOut);
    return res.status(200).json(successResponse(0, 'SUCCESS', unavailable ? 'Room is unavailable for the selected dates.' : 'Room is available for the selected dates.', { available: !unavailable }));
  } catch (error) { return fail(res, 500, error.message); }
};

exports.placedBookingOrder = async (req, res) => {
  let bookingObjectId;
  try {
    const { checkIn, checkOut } = parseRange(req.body); const count = checkIn && checkOut ? nights(checkIn, checkOut) : 0;
    if (!validId(req.params.id) || !checkIn || !checkOut || count < 1) return fail(res, 400, 'Valid check-in and check-out dates are required.');
    if (checkIn < new Date(new Date().toISOString().slice(0, 10))) return fail(res, 400, 'Check-in cannot be in the past.');
    const room = await Room.findById(req.params.id);
    if (!room || room.room_status === 'unavailable') return fail(res, 404, 'Room does not exist or is unavailable.');
    if (await overlap(room._id, checkIn, checkOut)) return fail(res, 409, 'This room is already booked for the selected dates. Please choose another room or different dates.');
    bookingObjectId = new mongoose.Types.ObjectId();
    const locked = await Room.findOneAndUpdate({ _id: room._id, room_status: { $ne: 'unavailable' }, reservations: { $not: { $elemMatch: { check_in: { $lt: checkOut }, check_out: { $gt: checkIn } } } } }, { $push: { reservations: { booking_id: bookingObjectId, check_in: checkIn, check_out: checkOut } } }, { new: true });
    if (!locked) return fail(res, 409, 'This room is already booked for the selected dates. Please choose another room or different dates.');
    let booking;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        booking = await Booking.create({
          _id: bookingObjectId, room_id: room._id, booking_by: req.user.id, ...makeIds(), check_in: checkIn, check_out: checkOut, number_of_nights: count, booking_dates: stayDates(checkIn, count), room_rate: room.room_price, total_amount: Number(room.room_price) * count, booking_status: 'confirmed', payment_method: 'pay_at_hotel', payment_status: 'pending'
        }); break;
      } catch (error) { if (error.code !== 11000 || attempt === 4) throw error; }
    }
    let emailSent = false; let invoiceError = null;
    try { const invoice = await generateInvoice(booking, req.user, room); booking.invoice_url = invoice.url; booking.invoice_public_id = invoice.publicId; booking.invoice_generated_at = new Date(); await booking.save({ validateBeforeSave: false }); try { await sendBookingEmail(booking, req.user, room); emailSent = true; } catch (_) { emailSent = false; } } catch (error) { invoiceError = error.message; }
    const populated = await load({ _id: booking._id });
    return res.status(201).json(successResponse(0, 'SUCCESS', 'Your reservation has been confirmed. Payment will be made at the hotel upon arrival.', { ...serialize(populated), email_sent: emailSent, invoice_error: invoiceError }));
  } catch (error) {
    if (bookingObjectId) await Room.updateOne({ _id: req.params.id }, { $pull: { reservations: { booking_id: bookingObjectId } } }).catch(() => {});
    return fail(res, 500, error.message);
  }
};

const list = async (req, res, filter) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1); const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100); const query = { ...filter };
  if (req.query.keyword) query.booking_id = { $regex: req.query.keyword.trim(), $options: 'i' };
  const total = await Booking.countDocuments(query); const rows = await Booking.find(query).populate('room_id').populate('booking_by').populate('reviews')
    .sort({ createdAt: req.query.sort === 'asce' ? 1 : -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return res.status(200).json(successResponse(0, 'SUCCESS', 'Booking list retrieved successfully', {
    rows: rows.map(serialize), total_rows: total, response_rows: rows.length, total_page: Math.ceil(total / limit), current_page: page
  }));
};
exports.getBookingOrderByUserId = (req, res) => list(req, res, { booking_by: req.user.id }).catch((error) => fail(res, 500, error.message));
exports.getBookingOrderForAdmin = (req, res) => list(req, res, {}).catch((error) => fail(res, 500, error.message));

const cancel = async (req, res, admin) => {
  const booking = validId(req.params.id) ? await load({ _id: req.params.id, ...(admin ? {} : { booking_by: req.user.id }) }) : null;
  if (!booking) return fail(res, 404, 'Booking not found or you are not authorized to cancel this booking.');
  if (['cancelled', 'checked_in', 'checked_out', 'no_show'].includes(normalized(booking.booking_status))) return fail(res, 400, 'This booking is no longer eligible for cancellation.');
  booking.booking_status = 'cancelled'; booking.cancellation_reason = String(req.body.cancellation_reason || 'Not provided').trim().slice(0, 500); booking.cancelled_at = new Date(); booking.cancelled_by = admin ? 'admin' : 'client';
  await booking.save({ validateBeforeSave: false }); await release(booking); sendBookingEmail(booking, booking.booking_by, booking.room_id, 'cancellation').catch(() => {});
  return res.status(200).json(successResponse(0, 'SUCCESS', 'Booking cancelled. The room is now available for other guests.', serialize(booking)));
};
exports.cancelSelfBookingOrder = (req, res) => cancel(req, res, false).catch((error) => fail(res, 500, error.message));
exports.cancelBookingByAdmin = (req, res) => cancel(req, res, true).catch((error) => fail(res, 500, error.message));

exports.updatedBookingOrderByAdmin = async (req, res) => {
  try {
    const booking = validId(req.params.id) ? await load({ _id: req.params.id }) : null;
    if (!booking) return fail(res, 404, 'Booking not found.');
    if (req.body.payment_status) { if (!['pending', 'paid'].includes(req.body.payment_status)) return fail(res, 400, 'Payment status must be pending or paid.'); booking.payment_status = req.body.payment_status; }
    if (req.body.booking_status) { const current = normalized(booking.booking_status); const next = normalized(req.body.booking_status); if (!(TRANSITIONS[current] || []).includes(next)) return fail(res, 400, `Booking cannot move from ${current} to ${next}.`); booking.booking_status = next; if (['cancelled', 'checked_out', 'no_show'].includes(next)) await release(booking); }
    await booking.save({ validateBeforeSave: false }); return res.status(200).json(successResponse(0, 'SUCCESS', 'Booking updated successfully.', serialize(booking)));
  } catch (error) { return fail(res, 500, error.message); }
};

exports.getBookingDetails = async (req, res) => {
  try { const selector = validId(req.params.id) ? { _id: req.params.id } : { booking_id: req.params.id.toUpperCase() }; if (req.user.role !== 'admin') selector.booking_by = req.user.id; const booking = await load(selector); if (!booking) return fail(res, 404, 'Booking not found or access denied.'); return res.status(200).json(successResponse(0, 'SUCCESS', 'Booking retrieved successfully.', serialize(booking))); } catch (error) { return fail(res, 500, error.message); }
};
exports.openInvoice = async (req, res) => {
  const selector = validId(req.params.id) ? { _id: req.params.id } : { booking_id: req.params.id.toUpperCase() }; if (req.user.role !== 'admin') selector.booking_by = req.user.id; const booking = await load(selector); if (!booking || !booking.invoice_url) return fail(res, 404, 'Invoice not found or access denied.');
  if (req.query.format === 'pdf') {
    const filename = `${booking.invoice_id}.pdf`;
    const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
    const pdf = createPdf(booking, booking.booking_by, booking.room_id);
    res.set({
      'Content-Type': 'application/pdf', 'Content-Disposition': `${disposition}; filename="${filename}"`, 'Content-Length': pdf.length, 'Cache-Control': 'private, no-store'
    });
    return res.status(200).send(pdf);
  }
  return res.status(200).json(successResponse(0, 'SUCCESS', 'Invoice access granted.', { url: booking.invoice_url, filename: `${booking.invoice_id}.pdf` }));
};
exports.resendInvoice = async (req, res) => {
  try {
    const booking = validId(req.params.id) ? await load({ _id: req.params.id }) : null;
    if (!booking || !booking.invoice_url) return fail(res, 404, 'Booking invoice not found.');
    res.status(202).json(successResponse(0, 'SUCCESS', `The confirmation and invoice have been queued for ${booking.booking_by.email}.`, null));
    try {
      await sendBookingEmail(booking, booking.booking_by, booking.room_id, 'invoice');
      logger.info(`Booking invoice email delivered: ${booking.booking_id}`);
    } catch (error) {
      logger.error(`Booking invoice email delivery failed for ${booking.booking_id}: ${error.code || error.message}`);
    }
    return undefined;
  } catch (error) {
    if (!res.headersSent) return fail(res, 500, 'Unable to queue the invoice email. Please try again.');
    logger.error(error);
    return undefined;
  }
};
