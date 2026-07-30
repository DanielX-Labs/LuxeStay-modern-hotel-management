const crypto = require('crypto');

const OTP_RESEND_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const hashOtp = (userId, purpose, code) => crypto
  .createHmac('sha256', process.env.JWT_ACCESS_SECRET)
  .update(`${userId}:${purpose}:${code}`)
  .digest('hex');

const createOtp = (user, purpose) => {
  const code = crypto.randomInt(100000, 1000000).toString();
  user.otpHash = hashOtp(user._id, purpose, code);
  user.otpPurpose = purpose;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  user.otpLastSentAt = new Date();
  return code;
};

const clearOtp = (user) => {
  user.otpHash = undefined;
  user.otpPurpose = undefined;
  user.otpExpires = undefined;
  user.otpAttempts = 0;
  user.otpLastSentAt = undefined;
};

const verifyOtp = (user, purpose, code) => {
  if (!/^\d{6}$/.test(String(code || ''))) return false;
  if (user.otpPurpose !== purpose || !user.otpExpires || user.otpExpires <= new Date()) return false;
  const actual = Buffer.from(hashOtp(user._id, purpose, String(code)));
  const expected = Buffer.from(user.otpHash || '');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

module.exports = { OTP_MAX_ATTEMPTS, OTP_RESEND_MS, clearOtp, createOtp, verifyOtp };