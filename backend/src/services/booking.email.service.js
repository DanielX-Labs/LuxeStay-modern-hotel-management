const { sendTransactionalEmail } = require('../configs/send.mail');
/* eslint-disable max-len */

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');
const displayDate = (value) => new Date(value).toLocaleDateString('en-NG', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
});
const money = (value) => new Intl.NumberFormat('en-NG', {
  style: 'currency', currency: 'NGN', maximumFractionDigits: 0
}).format(Number(value || 0));
const titleCase = (value) => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const row = (name, value, strong = false) => `<tr><td style="padding:13px 0;border-bottom:1px solid #ebe7df;color:#6d7480;font-size:13px">${escapeHtml(name)}</td><td style="padding:13px 0;border-bottom:1px solid #ebe7df;color:#0b1729;font-size:${strong ? '16px' : '13px'};font-weight:700;text-align:right">${escapeHtml(value)}</td></tr>`;

const emailShell = ({
  hotel, preheader, heading, intro, body, footerNote
}) => `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body style="margin:0;background:#efede8;font-family:Arial,Helvetica,sans-serif;color:#0b1729"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#efede8"><tr><td style="padding:42px 14px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:650px;margin:0 auto;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 18px 50px rgba(11,23,41,.10)"><tr><td style="padding:38px 42px;background:#071426"><p style="margin:0;color:#d4b36b;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase">${escapeHtml(hotel)}</p><h1 style="margin:17px 0 10px;color:#fff;font-family:Georgia,Times,serif;font-size:36px;font-weight:400;line-height:1.12">${escapeHtml(heading)}</h1><p style="max-width:510px;margin:0;color:#cbd2dc;font-size:14px;line-height:1.7">${escapeHtml(intro)}</p></td></tr><tr><td style="padding:38px 42px">${body}</td></tr><tr><td style="padding:21px 42px;background:#071426;color:#98a3b2;font-size:11px;line-height:1.65;text-align:center">${escapeHtml(footerNote)}</td></tr></table></td></tr></table></body></html>`;

const confirmationTemplate = (booking, user, room) => {
  const hotel = process.env.HOTEL_NAME || 'LuxeStay Hotel';
  const invoiceUrl = booking.invoice_url || '';
  const nights = `${booking.number_of_nights} night${booking.number_of_nights === 1 ? '' : 's'}`;
  const payment = booking.payment_status === 'paid' ? 'Paid' : 'Payment Pending';
  const text = `Dear ${user.fullName},

It is our pleasure to confirm your upcoming stay at ${hotel}.

Your reservation
Booking ID: ${booking.booking_id}
Invoice ID: ${booking.invoice_id || 'Available on your invoice'}
Room: ${room.room_name} — ${titleCase(room.room_type)}
Check-in: ${displayDate(booking.check_in)}
Check-out: ${displayDate(booking.check_out)}
Length of stay: ${nights}
Total: ${money(booking.total_amount)}
Payment method: Pay at Hotel
Payment status: ${payment}

No online payment is required. On arrival, simply present your booking ID at reception. Our team will confirm your reservation, assist with payment, and make your check-in effortless.

Your invoice: ${invoiceUrl || 'Available in your LuxeStay dashboard'}

We look forward to making your time with us exceptional.

Warmly,
The ${hotel} Guest Experience Team`;

  const reference = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:26px 0 24px;border:1px solid #ded3bd;border-radius:12px;background:#fbf8f1"><tr><td style="padding:19px 21px"><span style="display:block;color:#876a32;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Your booking reference</span><strong style="display:block;margin-top:7px;color:#071426;font-size:24px;letter-spacing:1px">${escapeHtml(booking.booking_id)}</strong></td><td style="padding:19px 21px;text-align:right"><span style="display:block;color:#876a32;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Invoice</span><strong style="display:block;margin-top:7px;color:#071426;font-size:14px">${escapeHtml(booking.invoice_id || 'Issued')}</strong></td></tr></table>`;
  const details = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row('Hotel', hotel)}${row('Room', `${room.room_name} — ${titleCase(room.room_type)}`)}${row('Check-in', displayDate(booking.check_in))}${row('Check-out', displayDate(booking.check_out))}${row('Length of stay', nights)}${row('Booking status', titleCase(booking.booking_status))}${row('Payment method', 'Pay at Hotel')}${row('Payment status', payment)}${row('Total amount', money(booking.total_amount), true)}</table>`;
  const invoiceButton = invoiceUrl ? `<div style="padding:30px 0 7px;text-align:center"><a href="${escapeHtml(invoiceUrl)}" target="_blank" style="display:inline-block;padding:15px 28px;border-radius:9px;background:#071426;color:#fff;font-size:13px;font-weight:700;text-decoration:none">View your invoice</a><p style="margin:12px 0 0;color:#8a9099;font-size:11px">Keep this document for your arrival and personal records.</p></div>` : '';
  const body = `<p style="margin:0;color:#0b1729;font-family:Georgia,Times,serif;font-size:21px;line-height:1.45">Dear ${escapeHtml(user.fullName)},</p><p style="margin:13px 0 0;color:#525d6b;font-size:14px;line-height:1.8">Thank you for choosing ${escapeHtml(hotel)}. Your reservation is secured, and our team is preparing for your arrival. Below is your complete stay and invoice summary.</p>${reference}${details}${invoiceButton}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:29px;border-radius:11px;background:#f4f6f8"><tr><td style="padding:19px 20px"><strong style="display:block;margin-bottom:7px;color:#0b1729;font-size:13px">A seamless arrival</strong><span style="color:#5c6674;font-size:12px;line-height:1.7">No online payment is required. Present your booking ID at reception, settle your stay at the hotel, and our team will take care of the rest.</span></td></tr></table><p style="margin:30px 0 0;color:#525d6b;font-size:13px;line-height:1.75">We look forward to welcoming you and making every part of your stay feel considered.</p><p style="margin:18px 0 0;color:#525d6b;font-size:13px;line-height:1.7">Warmly,<br><strong style="color:#0b1729">The ${escapeHtml(hotel)} Guest Experience Team</strong></p>`;
  const html = emailShell({
    hotel,
    preheader: `Reservation ${booking.booking_id} is confirmed. Your invoice and arrival details are inside.`,
    heading: 'Your stay awaits.',
    intro: 'Your reservation is confirmed. Here is everything you need for an effortless arrival.',
    body,
    footerNote: 'This email contains private reservation information. Please keep your booking reference secure.'
  });
  return { text, html };
};

const cancellationTemplate = (booking, user, room) => {
  const hotel = process.env.HOTEL_NAME || 'LuxeStay Hotel';
  const reason = booking.cancellation_reason || 'Not provided';
  const text = `Dear ${user.fullName},

We have completed the cancellation of reservation ${booking.booking_id} for ${room.room_name}.

Cancellation reason: ${reason}

The room has been released for other guests. Your original booking record and invoice remain available in your LuxeStay dashboard for your records.

Should your plans bring you back, it would be our pleasure to welcome you.

Warmly,
The ${hotel} Guest Experience Team`;
  const body = `<p style="margin:0;color:#0b1729;font-family:Georgia,Times,serif;font-size:21px">Dear ${escapeHtml(user.fullName)},</p><p style="margin:14px 0;color:#525d6b;font-size:14px;line-height:1.8">Your request has been completed. Reservation <strong style="color:#0b1729">${escapeHtml(booking.booking_id)}</strong> for ${escapeHtml(room.room_name)} is now cancelled, and the room has been released.</p><div style="margin:24px 0;padding:18px 20px;border-left:4px solid #b78a3e;background:#fbf8f1"><span style="color:#876a32;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Cancellation reason</span><p style="margin:8px 0 0;color:#0b1729;font-size:14px;font-weight:700">${escapeHtml(reason)}</p></div><p style="color:#525d6b;font-size:13px;line-height:1.75">Your original booking record and invoice will remain safely available in your dashboard. Should your plans bring you back, it would be our pleasure to welcome you.</p><p style="margin:27px 0 0;color:#525d6b;font-size:13px;line-height:1.7">Warmly,<br><strong style="color:#0b1729">The ${escapeHtml(hotel)} Guest Experience Team</strong></p>`;
  return {
    text,
    html: emailShell({
      hotel, preheader: `Cancellation confirmed for ${booking.booking_id}.`, heading: 'Your cancellation is complete.', intro: 'Your reservation has been updated, and no further action is required.', body, footerNote: 'Your original booking record remains available in your LuxeStay dashboard.'
    })
  };
};

const sendBookingEmail = async (booking, user, room, type = 'confirmation') => {
  const cancelled = type === 'cancellation';
  const invoiceResend = type === 'invoice';
  let subject = `Your stay is confirmed — ${booking.booking_id}`;
  if (cancelled) subject = `Cancellation confirmed — ${booking.booking_id}`;
  if (invoiceResend) subject = `Your LuxeStay invoice — ${booking.invoice_id || booking.booking_id}`;
  const template = cancelled ? cancellationTemplate(booking, user, room) : confirmationTemplate(booking, user, room);
  return sendTransactionalEmail({ to: user.email, subject, ...template });
};

module.exports = sendBookingEmail;
