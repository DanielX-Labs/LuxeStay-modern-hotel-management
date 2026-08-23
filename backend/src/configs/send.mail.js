const { brevoTransporter } = require('./brevo.config');
const { Env } = require('./env.config');
/* eslint-disable max-len, no-param-reassign */

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const sendTransactionalEmail = ({
  to, subject, text, html, attachments
}) => brevoTransporter.sendMail({
  from: `"${Env.BREVO_SENDER_NAME}" <${Env.BREVO_SENDER_EMAIL}>`,
  to,
  replyTo: Env.SUPPORT_EMAIL,
  subject,
  text,
  html,
  attachments
});

const sendEmail = async (res, user, url, subject, message, title, options = {}) => {
  try {
    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message);
    const safeUrl = escapeHtml(url);
    await sendTransactionalEmail({
      to: user.email,
      subject,
      text: options.text || `${title}\n\n${message}\n\n${url}`,
      html: options.html || `<div style="background:#f5f5f5;padding:32px 16px;font-family:Arial,sans-serif;color:#222"><div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;padding:32px"><h1>${safeTitle}</h1><p style="line-height:1.6">${safeMessage}</p><a href="${safeUrl}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:8px">${safeTitle}</a></div></div>`,
      attachments: options.attachments
    });
    if (!options.noResponse && res) {
      return res.status(200).json({ status: 'success', message: `Email sent to ${user.email} successfully` });
    }
    return undefined;
  } catch (error) {
    if (user.resetPasswordToken) user.resetPasswordToken = undefined;
    if (user.resetPasswordExpire) user.resetPasswordExpire = undefined;
    if (typeof user.save === 'function') await user.save({ validateBeforeSave: false }).catch(() => {});
    if (res && !options.noResponse) return res.status(500).json({ status: 'error', message: error.message || 'Unable to send email' });
    throw error;
  }
};

const sendOtpEmail = async ({ email, code, purpose }) => {
  const labels = {
    verify_email: 'Verify your LuxeStay email',
    change_email: 'Confirm your new LuxeStay email',
    change_password: 'Confirm your LuxeStay password change',
    reset_password: 'Reset your LuxeStay password'
  };
  const subject = labels[purpose] || 'Your LuxeStay verification code';
  return sendTransactionalEmail({
    to: email,
    subject,
    text: `${subject}\n\nYour six-digit verification code is ${code}. It expires in 10 minutes. Never share this code.`,
    html: `<div style="background:#f2f0eb;padding:36px 16px;font-family:Arial,sans-serif;color:#101828"><div style="max-width:560px;margin:auto;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 14px 45px rgba(16,24,40,.10)"><div style="padding:30px 34px;background:#071426;color:#fff"><div style="color:#d6b56d;font-size:10px;letter-spacing:2px;text-transform:uppercase">LuxeStay</div><h1 style="margin:13px 0 0;font-family:Georgia,serif;font-size:29px;font-weight:400">${escapeHtml(subject)}</h1></div><div style="padding:32px 34px;text-align:center"><p style="margin:0;color:#5b6573;line-height:1.7">Enter this secure code to continue. It expires in 10 minutes.</p><div style="display:inline-block;margin:25px 0;padding:17px 23px;border-radius:10px;background:#071426;color:#fff;font-size:30px;font-weight:700;letter-spacing:8px">${escapeHtml(code)}</div><p style="margin:0;color:#8a9099;font-size:12px;line-height:1.6">Never share this code. LuxeStay will never ask for it by phone or message.</p></div></div></div>`
  });
};

module.exports = sendEmail;
module.exports.sendOtpEmail = sendOtpEmail;
module.exports.sendTransactionalEmail = sendTransactionalEmail;
module.exports.verifyEmailTransport = () => brevoTransporter.verify();
