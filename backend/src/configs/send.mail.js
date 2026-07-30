const nodemailer = require('nodemailer');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const createTransporter = () => {
  const port = Number(process.env.BREVO_SMTP_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
    port,
    secure: port === 465,
    auth: {
      user: process.env.BREVO_SMTP_LOGIN,
      pass: process.env.BREVO_SMTP_KEY
    }
  });
};

const sendEmail = async (res, user, url, subject, message, title, options = {}) => {
  try {
    if ((process.env.BREVO_EMAIL_TRANSPORT || 'smtp').toLowerCase() !== 'smtp') {
      throw new Error('BREVO_EMAIL_TRANSPORT must be set to smtp');
    }

    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message);
    const safeUrl = escapeHtml(url);
    const senderName = process.env.BREVO_SENDER_NAME || 'LuxeStay';
    const senderEmail = process.env.BREVO_SENDER_EMAIL;

    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: user.email,
      replyTo: process.env.SUPPORT_EMAIL || senderEmail,
      subject,
      text: `${title}\n\n${message}\n\n${url}\n\nIf you did not request this email, you can safely ignore it.`,
      html: `
        <div style="background:#f5f5f5;padding:32px 16px;font-family:Arial,sans-serif;color:#222;">
          <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 4px 18px rgba(0,0,0,.08);">
            <h1 style="font-size:24px;margin:0 0 16px;">${safeTitle}</h1>
            <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">${safeMessage}</p>
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:8px;">${safeTitle}</a>
            <p style="font-size:13px;line-height:1.5;color:#6b7280;margin:24px 0 0;">If the button does not work, copy and paste this link into your browser:<br><a href="${safeUrl}" style="color:#2563eb;word-break:break-all;">${safeUrl}</a></p>
            <p style="font-size:13px;line-height:1.5;color:#6b7280;margin:16px 0 0;">If you did not request this email, you can safely ignore it.</p>
          </div>
        </div>
      `
    });

    if (!options.noResponse && res) {
      return res.status(200).json({
        status: 'success',
        message: `Email sent to ${user.email} successfully`
      });
    }

    return undefined;
  } catch (error) {
    if (user.resetPasswordToken) user.resetPasswordToken = undefined;
    if (user.resetPasswordExpire) user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false }).catch(() => {});

    if (res && !options.noResponse) {
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Unable to send email'
      });
    }

    throw error;
  }
};

const sendOtpEmail = async ({ email, code, purpose }) => {
  const labels = {
    verify_email: 'Verify your LuxeStay email',
    change_email: 'Confirm your new LuxeStay email',
    change_password: 'Confirm your LuxeStay password change'
  };
  const subject = labels[purpose] || 'Your LuxeStay verification code';
  const senderName = process.env.BREVO_SENDER_NAME || 'LuxeStay';
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  await createTransporter().sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to: email,
    replyTo: process.env.SUPPORT_EMAIL || senderEmail,
    subject,
    text: `${subject}\n\nYour six-digit code is ${code}. It expires in 10 minutes. Never share this code.`,
    html: `<div style="background:#f5f5f5;padding:32px 16px;font-family:Arial,sans-serif;color:#222"><div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;padding:32px;text-align:center"><h1>${escapeHtml(subject)}</h1><p>Enter this code in LuxeStay. It expires in 10 minutes.</p><div style="display:inline-block;background:#111827;color:#fff;font-size:30px;font-weight:700;letter-spacing:8px;padding:16px 22px;border-radius:8px">${escapeHtml(code)}</div><p style="font-size:13px;color:#6b7280;margin-top:24px">Never share this code. If you did not request it, ignore this email.</p></div></div>`
  });
};
module.exports = sendEmail;
module.exports.sendOtpEmail = sendOtpEmail;