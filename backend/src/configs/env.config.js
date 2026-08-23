require('dotenv').config();

const required = (name) => {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

const Env = {
  BREVO_EMAIL_TRANSPORT: process.env.BREVO_EMAIL_TRANSPORT || 'smtp',
  BREVO_SENDER_EMAIL: required('BREVO_SENDER_EMAIL'),
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'LuxeStay',
  BREVO_SMTP_HOST: required('BREVO_SMTP_HOST'),
  BREVO_SMTP_PORT: Number(process.env.BREVO_SMTP_PORT || 587),
  BREVO_SMTP_LOGIN: required('BREVO_SMTP_LOGIN'),
  BREVO_SMTP_KEY: required('BREVO_SMTP_KEY'),
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || process.env.BREVO_SENDER_EMAIL
};

module.exports = { Env };
