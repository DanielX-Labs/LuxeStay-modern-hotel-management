const { sendTransactionalEmail } = require('../configs/send.mail');
/* eslint-disable max-len */

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
const displayDate = (value) => new Date(value).toLocaleDateString('en-NG', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
});
const money = (value) => new Intl.NumberFormat('en-NG', {
  style: 'currency', currency: 'NGN', maximumFractionDigits: 0
}).format(Number(value || 0));
const label = (value) => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const detailRow = (name, value) => `<tr><td style="padding:11px 0;color:#697386;font-size:13px;border-bottom:1px solid #ece8e0">${escapeHtml(name)}</td><td style="padding:11px 0;text-align:right;color:#101828;font-size:13px;font-weight:700;border-bottom:1px solid #ece8e0">${escapeHtml(value)}</td></tr>`;

const confirmationTemplate = (booking, user, room) => {
  const hotel = process.env.HOTEL_NAME || 'LuxeStay Hotel';
  const invoiceUrl = booking.invoice_url || process.env.FRONTEND_URL || '';
  const text = `Dear ${user.fullName},\n\nYour stay at ${hotel} is confirmed. We are delighted to welcome you.\n\nBooking ID: ${booking.booking_id}\nRoom: ${room.room_name} (${room.room_type})\nCheck-in: ${displayDate(booking.check_in)}\nCheck-out: ${displayDate(booking.check_out)}\nNights: ${booking.number_of_nights}\nTotal: ${money(booking.total_amount)}\nPayment: Pending — Pay at Hotel\n\nNo online payment is required. Please present your booking ID when you arrive.\n\nInvoice: ${invoiceUrl}\n\nWarm regards,\nThe ${hotel} Guest Experience Team`;
  const html = `<!doctype html><html><body style="margin:0;background:#f2f0eb;font-family:Arial,Helvetica,sans-serif;color:#101828"><div style="display:none;max-height:0;overflow:hidden">Your LuxeStay reservation ${escapeHtml(booking.booking_id)} is confirmed.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f0eb"><tr><td style="padding:38px 14px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 14px 45px rgba(16,24,40,.10)"><tr><td style="padding:34px 38px;background:#071426;color:#fff"><div style="color:#d6b56d;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase">${escapeHtml(hotel)}</div><h1 style="margin:15px 0 8px;font-family:Georgia,serif;font-size:34px;font-weight:400;line-height:1.15">Your stay is confirmed.</h1><p style="margin:0;color:#ced5df;font-size:14px;line-height:1.7">Everything is ready for your arrival. We look forward to welcoming you.</p></td></tr><tr><td style="padding:34px 38px"><p style="margin:0 0 16px;font-size:16px;line-height:1.7">Dear <strong>${escapeHtml(user.fullName)}</strong>,</p><p style="margin:0 0 26px;color:#52606f;font-size:14px;line-height:1.75">Thank you for choosing ${escapeHtml(hotel)}. Your reservation has been secured for the dates below. No online payment is required; payment will be made at the hotel when you arrive.</p><div style="padding:17px 20px;border:1px solid #dfd5bf;border-radius:12px;background:#fbf8f1"><span style="display:block;color:#8a6c31;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Booking reference</span><strong style="display:block;margin-top:6px;color:#071426;font-size:23px;letter-spacing:1px">${escapeHtml(booking.booking_id)}</strong></div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px">${detailRow('Hotel', hotel)}${detailRow('Room', `${room.room_name} · ${label(room.room_type)}`)}${detailRow('Check-in', displayDate(booking.check_in))}${detailRow('Check-out', displayDate(booking.check_out))}${detailRow('Length of stay', `${booking.number_of_nights} night${booking.number_of_nights === 1 ? '' : 's'}`)}${detailRow('Total amount', money(booking.total_amount))}${detailRow('Booking status', label(booking.booking_status))}${detailRow('Payment status', booking.payment_status === 'paid' ? 'Paid' : 'Payment Pending')}${detailRow('Payment method', 'Pay at Hotel')}</table>${invoiceUrl ? `<div style="padding-top:28px;text-align:center"><a href="${escapeHtml(invoiceUrl)}" style="display:inline-block;padding:14px 24px;border-radius:9px;background:#071426;color:#fff;font-size:13px;font-weight:700;text-decoration:none">View booking invoice</a></div>` : ''}<div style="margin-top:30px;padding:18px;border-radius:10px;background:#f5f7fa;color:#52606f;font-size:12px;line-height:1.65"><strong style="color:#101828">On arrival</strong><br>Present your booking ID at reception. Our team will confirm your reservation and assist with payment and check-in.</div><p style="margin:30px 0 0;color:#52606f;font-size:13px;line-height:1.7">Warm regards,<br><strong style="color:#101828">The ${escapeHtml(hotel)} Guest Experience Team</strong></p></td></tr><tr><td style="padding:20px 38px;background:#071426;color:#9fa9b7;font-size:11px;line-height:1.6;text-align:center">This is a transactional message about your reservation. Please keep your booking ID private.</td></tr></table></td></tr></table></body></html>`;
  return { text, html };
};

const cancellationTemplate = (booking, user, room) => {
  const hotel = process.env.HOTEL_NAME || 'LuxeStay Hotel';
  const text = `Dear ${user.fullName},\n\nYour reservation ${booking.booking_id} for ${room.room_name} has been cancelled.\nReason: ${booking.cancellation_reason || 'Not provided'}\n\nThe room has been released. Your original invoice remains available in your dashboard.\n\nThe ${hotel} Guest Experience Team`;
  const html = `<div style="margin:0;padding:36px 16px;background:#f2f0eb;font-family:Arial,sans-serif;color:#101828"><div style="max-width:620px;margin:auto;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 14px 45px rgba(16,24,40,.10)"><div style="padding:32px 36px;background:#071426;color:#fff"><div style="color:#d6b56d;font-size:11px;letter-spacing:2px;text-transform:uppercase">${escapeHtml(hotel)}</div><h1 style="margin:14px 0 7px;font-family:Georgia,serif;font-size:30px;font-weight:400">Cancellation confirmed</h1><p style="margin:0;color:#ced5df">Your reservation has been updated successfully.</p></div><div style="padding:32px 36px"><p>Dear <strong>${escapeHtml(user.fullName)}</strong>,</p><p style="color:#52606f;line-height:1.7">Booking <strong>${escapeHtml(booking.booking_id)}</strong> for ${escapeHtml(room.room_name)} has been cancelled and the room has been released.</p><div style="margin:22px 0;padding:16px;border-left:4px solid #b78535;background:#fbf8f1"><small style="color:#697386;text-transform:uppercase">Cancellation reason</small><p style="margin:7px 0 0;font-weight:700">${escapeHtml(booking.cancellation_reason || 'Not provided')}</p></div><p style="color:#52606f;line-height:1.7">Your original invoice and booking record will remain available in your LuxeStay dashboard.</p><p style="margin-top:28px">Warm regards,<br><strong>The ${escapeHtml(hotel)} Guest Experience Team</strong></p></div></div></div>`;
  return { text, html };
};

const sendBookingEmail = async (booking, user, room, type = 'confirmation') => {
  const cancelled = type === 'cancellation';
  const subject = cancelled
    ? `Cancellation confirmed · ${booking.booking_id}`
    : `Your LuxeStay reservation is confirmed · ${booking.booking_id}`;
  const template = cancelled ? cancellationTemplate(booking, user, room) : confirmationTemplate(booking, user, room);
  return sendTransactionalEmail({ to: user.email, subject, ...template });
};

module.exports = sendBookingEmail;
