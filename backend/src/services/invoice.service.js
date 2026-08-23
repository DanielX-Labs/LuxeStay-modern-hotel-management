const cloudinary = require('../configs/cloudinary');

const escapePdf = (value) => String(value == null ? '' : value)
  .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const money = (value) => `NGN ${Number(value || 0).toLocaleString('en-NG')}`;
const date = (value) => new Date(value).toLocaleDateString('en-GB', { timeZone: 'UTC' });

// A small dependency-free PDF writer keeps invoice generation deployable with the current stack.
const createPdf = (booking, user, room) => {
  const rows = [
    ['Invoice number', booking.invoice_id], ['Booking ID', booking.booking_id],
    ['Client name', user.fullName], ['Client email', user.email],
    ['Hotel', process.env.HOTEL_NAME || 'LuxeStay Hotel'], ['Room', room.room_name],
    ['Room type', room.room_type], ['Check-in', date(booking.check_in)],
    ['Check-out', date(booking.check_out)], ['Number of nights', booking.number_of_nights],
    ['Room rate', money(booking.room_rate)], ['Total amount', money(booking.total_amount)],
    ['Booking date', date(booking.createdAt || Date.now())], ['Booking status', booking.booking_status],
    ['Payment method', 'Pay at Hotel'], ['Payment status', booking.payment_status === 'paid' ? 'Paid' : 'Payment Pending']
  ];
  const commands = ['BT', '/F1 22 Tf', '50 790 Td', '(LuxeStay - Booking Confirmation) Tj',
    '/F1 11 Tf', '0 -35 Td', `(Invoice prepared for ${escapePdf(user.fullName)}) Tj`];
  rows.forEach(([label, value]) => commands.push('0 -25 Td', `(${escapePdf(label)}: ${escapePdf(value)}) Tj`));
  commands.push('0 -35 Td', '(Payment is due at the hotel upon arrival.) Tj', 'ET');
  const stream = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf);
};

const uploadPdf = (buffer, publicId) => new Promise((resolve, reject) => {
  const upload = cloudinary.uploader.upload_stream({
    resource_type: 'raw', public_id: publicId, folder: 'luxestay/invoices', overwrite: true
  }, (error, result) => (error ? reject(error) : resolve(result)));
  upload.end(buffer);
});

exports.generateInvoice = async (booking, user, room) => {
  const buffer = createPdf(booking, user, room);
  const result = await uploadPdf(buffer, booking.invoice_id);
  return { buffer, url: result.secure_url, publicId: result.public_id };
};

exports.createPdf = createPdf;
