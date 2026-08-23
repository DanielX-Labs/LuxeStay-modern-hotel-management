const nodemailer = require('nodemailer');
const { Env } = require('./env.config');

if (Env.BREVO_EMAIL_TRANSPORT.toLowerCase() !== 'smtp') {
  throw new Error('BREVO_EMAIL_TRANSPORT must be smtp');
}

const brevoTransporter = nodemailer.createTransport({
  host: Env.BREVO_SMTP_HOST,
  port: Env.BREVO_SMTP_PORT,
  secure: Env.BREVO_SMTP_PORT === 465,
  requireTLS: Env.BREVO_SMTP_PORT === 587,
  auth: {
    user: Env.BREVO_SMTP_LOGIN,
    pass: Env.BREVO_SMTP_KEY
  }
});

module.exports = { brevoTransporter };
