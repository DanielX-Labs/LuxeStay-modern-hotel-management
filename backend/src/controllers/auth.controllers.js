const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const logger = require('../middleware/winston.logger');
const { errorResponse, successResponse } = require('../configs/app.response');
const loginResponse = require('../configs/login.response');
const sendEmail = require('../configs/send.mail');
const { sendOtpEmail } = require('../configs/send.mail');
const { OTP_MAX_ATTEMPTS, OTP_RESEND_MS, clearOtp, createOtp, verifyOtp } = require('../configs/otp');
const publicAssetUrl = require('../lib/public.asset.url');
const cloudinary = require('cloudinary').v2;

const deleteAvatarFile = async (file) => {
  if (file?.filename) await cloudinary.uploader.destroy(file.filename).catch((error) => logger.error(`Avatar cleanup failed: ${error.message}`));
};
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const clientOrigin = () => String(process.env.CLIENT_URL || '').split(',')[0].trim().replace(/\/$/, '');
const verificationTokenFor = (user) => jwt.sign(
  { id: user._id, purpose: 'email_verification' },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '15m' }
);
const passwordResetTokenFor = (user) => jwt.sign(
  { id: user._id, purpose: 'password_reset' },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '10m' }
);
const readVerificationUser = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  if (decoded.purpose !== 'email_verification') throw new Error('Invalid verification session');
  return User.findById(decoded.id).select('+otpHash +otpAttempts');
};
const canSendOtp = (user) => !user.otpLastSentAt || Date.now() - user.otpLastSentAt.getTime() >= OTP_RESEND_MS;
const issueOtp = async (user, purpose, destination) => {
  if (!canSendOtp(user)) {
    const error = new Error('Please wait 60 seconds before requesting another code');
    error.statusCode = 429;
    throw error;
  }
  if (purpose === 'reset_password') {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  }
  const code = createOtp(user, purpose);
  await user.save({ validateBeforeSave: false });
  try {
    await sendOtpEmail({ email: destination || user.email, code, purpose });
  } catch (error) {
    clearOtp(user);
    await user.save({ validateBeforeSave: false }).catch(() => {});
    throw error;
  }
};
const rejectBadOtp = async (res, user, purpose, code) => {
  if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
    clearOtp(user);
    await user.save({ validateBeforeSave: false });
    res.status(429).json(errorResponse(1, 'FAILED', 'Too many attempts. Request a new code.'));
    return true;
  }
  if (!user.otpHash || user.otpPurpose !== purpose) {
    res.status(400).json(errorResponse(1, 'FAILED', 'Verification code is invalid or has already been used'));
    return true;
  }
  if (!user.otpExpires || user.otpExpires <= new Date()) {
    clearOtp(user);
    await user.save({ validateBeforeSave: false });
    res.status(400).json(errorResponse(1, 'FAILED', 'Verification code has expired. Request a new code.'));
    return true;
  }
  if (!verifyOtp(user, purpose, code)) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    res.status(400).json(errorResponse(1, 'FAILED', 'Verification code is invalid'));
    return true;
  }
  return false;
};

exports.register = async (req, res) => {
  try {
    const { userName, fullName, phone, password, dob, address, gender } = req.body;
    const email = normalizeEmail(req.body.email);
    if (!userName || !fullName || !email || !password || !dob || !address) {
      await deleteAvatarFile(req.file);
      return res.status(400).json(errorResponse(1, 'FAILED', 'Please enter all required fields'));
    }
    const duplicate = await User.findOne({ $or: [{ userName }, { email }, ...(phone ? [{ phone }] : [])] });
    if (duplicate) {
      await deleteAvatarFile(req.file);
      return res.status(409).json(errorResponse(9, 'ALREADY EXIST', 'Username, email, or phone already exists'));
    }
    const user = await User.create({ userName, fullName, email, phone, password, avatar: req.file?.path || publicAssetUrl('/avatar.png'), gender, dob, address, role: 'user', verified: false });
    return res.status(201).json(successResponse(0, 'SUCCESS', 'Registration successful. Verify your email on first login.', { email: user.email, role: user.role, verified: false }));
  } catch (error) {
    await deleteAvatarFile(req.file);
    logger.error(`Register error: ${error.message}`);
    return res.status(500).json(errorResponse(2, 'SERVER SIDE ERROR', error.message));
  }
};

exports.registerByAdmin = async (req, res) => {
  try {
    const { userName, fullName, phone, password, dob, address, gender } = req.body;
    const email = normalizeEmail(req.body.email);
    const role = req.body.role === 'admin' ? 'admin' : 'user';
    if (!userName || !fullName || !email || !password || !dob || !address) {
      return res.status(400).json(errorResponse(1, 'FAILED', 'Please enter all required fields'));
    }
    const duplicate = await User.findOne({ $or: [{ userName }, { email }, ...(phone ? [{ phone }] : [])] });
    if (duplicate) return res.status(409).json(errorResponse(9, 'ALREADY EXIST', 'Username, email, or phone already exists'));
    const user = await User.create({ userName, fullName, email, phone, password, avatar: publicAssetUrl('/avatar.png'), gender, dob, address, role, verified: false });
    return res.status(201).json(successResponse(0, 'SUCCESS', 'User created. They must verify their email on first login.', { email: user.email, role: user.role, verified: false }));
  } catch (error) {
    logger.error(`Admin register error: ${error.message}`);
    return res.status(500).json(errorResponse(2, 'SERVER SIDE ERROR', error.message));
  }
};

exports.loginUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    if (!email || !password) return res.status(400).json(errorResponse(1, 'FAILED', 'Please enter email and password'));
    const user = await User.findOne({ email }).select('+password +otpHash +otpAttempts');
    if (!user || !(await user.comparePassword(password))) return res.status(400).json(errorResponse(1, 'FAILED', 'User credentials are incorrect'));
    if (req.query.loginType === 'admin' && user.role !== 'admin') return res.status(403).json(errorResponse(6, 'UNABLE TO ACCESS', 'Admin access required'));
    if (user.status === 'blocked') return res.status(403).json(errorResponse(6, 'UNABLE TO ACCESS', 'User is blocked'));
    if (!user.verified) {
      if (canSendOtp(user)) await issueOtp(user, 'verify_email');
      return res.status(403).json({
        ...errorResponse(12, 'EMAIL VERIFICATION REQUIRED', 'Enter the six-digit code sent to your email'),
        verification_required: true,
        verification_token: verificationTokenFor(user),
        email: user.email.replace(/(^.).*(@.*$)/, '$1***$2')
      });
    }
    user.status = 'login';
    user.updatedAt = new Date();
    await user.save({ validateBeforeSave: false });
    return loginResponse(res, user);
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    const databaseUnavailable = error.name === 'MongooseServerSelectionError';
    return res.status(databaseUnavailable ? 503 : 500).json(errorResponse(2, databaseUnavailable ? 'DATABASE UNAVAILABLE' : 'SERVER SIDE ERROR', databaseUnavailable ? 'Database connection failed. Check MongoDB Atlas Network Access.' : error.message));
  }
};

exports.resendLoginVerificationCode = async (req, res) => {
  try {
    const user = await readVerificationUser(req.body.verificationToken);
    if (!user) return res.status(404).json(errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist'));
    if (user.verified) return res.status(400).json(errorResponse(1, 'FAILED', 'Email is already verified'));
    await issueOtp(user, 'verify_email');
    return res.status(200).json(successResponse(0, 'SUCCESS', 'A new verification code was sent'));
  } catch (error) {
    return res.status(error.statusCode || 400).json(errorResponse(1, 'FAILED', error.message));
  }
};

exports.verifyLoginEmail = async (req, res) => {
  try {
    const user = await readVerificationUser(req.body.verificationToken);
    if (!user) return res.status(404).json(errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist'));
    if (await rejectBadOtp(res, user, 'verify_email', req.body.code)) return undefined;
    clearOtp(user);
    user.verified = true;
    user.status = 'login';
    user.updatedAt = new Date();
    await user.save({ validateBeforeSave: false });
    return loginResponse(res, user);
  } catch (error) {
    return res.status(400).json(errorResponse(1, 'FAILED', 'Verification session is invalid or expired'));
  }
};

exports.requestEmailChange = async (req, res) => {
  try {
    const newEmail = normalizeEmail(req.body.newEmail);
    const user = await User.findById(req.user._id).select('+password +otpHash +otpAttempts');
    if (!newEmail || !req.body.password || !(await user.comparePassword(req.body.password))) return res.status(400).json(errorResponse(1, 'FAILED', 'Current password is incorrect'));
    if (newEmail === user.email || await User.exists({ email: newEmail })) return res.status(409).json(errorResponse(9, 'ALREADY EXIST', 'Email is unchanged or already in use'));
    user.pendingEmail = newEmail;
    await issueOtp(user, 'change_email', newEmail);
    return res.status(200).json(successResponse(0, 'SUCCESS', 'Verification code sent to the new email'));
  } catch (error) {
    logger.error(`Email change request error: ${error.message}`);
    return res.status(error.statusCode || 500).json(errorResponse(2, 'FAILED', error.message));
  }
};

exports.verifyEmailChange = async (req, res) => {
  const user = await User.findById(req.user._id).select('+otpHash +otpAttempts');
  if (await rejectBadOtp(res, user, 'change_email', req.body.code)) return undefined;
  const existing = await User.exists({ email: user.pendingEmail, _id: { $ne: user._id } });
  if (existing) return res.status(409).json(errorResponse(9, 'ALREADY EXIST', 'Email is already in use'));
  user.email = user.pendingEmail;
  user.pendingEmail = undefined;
  user.verified = true;
  clearOtp(user);
  await user.save();
  return res.status(200).json(successResponse(0, 'SUCCESS', 'Email changed successfully', { email: user.email }));
};

exports.requestPasswordChange = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password +otpHash +otpAttempts');
    if (!req.body.oldPassword || !(await user.comparePassword(req.body.oldPassword))) return res.status(400).json(errorResponse(1, 'FAILED', 'Current password is incorrect'));
    await issueOtp(user, 'change_password');
    return res.status(200).json(successResponse(0, 'SUCCESS', 'Verification code sent to your email'));
  } catch (error) {
    logger.error(`Password change request error: ${error.message}`);
    return res.status(error.statusCode || 500).json(errorResponse(2, 'FAILED', error.message));
  }
};

exports.verifyPasswordChange = async (req, res) => {
  const { code, newPassword, confirmPassword } = req.body;
  if (!newPassword || newPassword.length < 6 || newPassword !== confirmPassword) return res.status(400).json(errorResponse(1, 'FAILED', 'Passwords must match and contain at least 6 characters'));
  const user = await User.findById(req.user._id).select('+password +otpHash +otpAttempts');
  if (await rejectBadOtp(res, user, 'change_password', code)) return undefined;
  clearOtp(user);
  user.password = newPassword;
  await user.save();
  return res.status(200).json(successResponse(0, 'SUCCESS', 'Password changed successfully'));
};

exports.logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { status: 'logout', updatedAt: new Date() });
  res.clearCookie('AccessToken');
  return res.status(200).json(successResponse(0, 'SUCCESS', 'User logged out successfully'));
};
exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json(errorResponse(1, 'FAILED', 'Email is required'));
    const user = await User.findOne({ email }).select('+otpHash +otpAttempts');
    if (!user) return res.status(404).json(errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist'));
    await issueOtp(user, 'reset_password');
    return res.status(200).json({
      ...successResponse(0, 'SUCCESS', 'A six-digit password reset code was sent to your email'),
      reset_token: passwordResetTokenFor(user),
      email: user.email.replace(/(^.).*(@.*$)/, '$1***$2')
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    return res.status(error.statusCode || 500).json(errorResponse(2, 'FAILED', error.message));
  }
};
const readPasswordResetUser = async (token, purpose = 'password_reset') => {
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  if (decoded.purpose !== purpose) throw new Error('Invalid password reset session');
  return User.findById(decoded.id).select('+otpHash +otpAttempts');
};
exports.resendForgotPasswordCode = async (req, res) => {
  try {
    const user = await readPasswordResetUser(req.body.resetToken);
    if (!user) return res.status(404).json(errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist'));
    await issueOtp(user, 'reset_password');
    return res.status(200).json(successResponse(0, 'SUCCESS', 'A new password reset code was sent'));
  } catch (error) {
    return res.status(error.statusCode || 400).json(errorResponse(1, 'FAILED', error.message));
  }
};
exports.verifyForgotPasswordCode = async (req, res) => {
  try {
    const user = await readPasswordResetUser(req.body.resetToken);
    if (!user) return res.status(404).json(errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist'));
    if (await rejectBadOtp(res, user, 'reset_password', req.body.code)) return undefined;
    clearOtp(user);
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    return res.status(200).json({
      ...successResponse(0, 'SUCCESS', 'Code verified. You can now set a new password.'),
      reset_token: resetToken
    });
  } catch (error) {
    return res.status(400).json(errorResponse(1, 'FAILED', 'Password reset session is invalid or expired'));
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || password.length < 6 || password !== confirmPassword) {
      return res.status(400).json(errorResponse(1, 'FAILED', 'Passwords must match and contain at least 6 characters'));
    }

    const resetPasswordToken = crypto.createHash('sha256').update(String(req.params.token || '')).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: new Date() } });
    if (!user) return res.status(400).json(errorResponse(1, 'FAILED', 'Reset session is invalid, expired, or already used'));

    user.password = password;
    user.status = 'logout';
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    clearOtp(user);
    user.updatedAt = new Date();
    await user.save();
    return res.status(200).json(successResponse(0, 'SUCCESS', 'Password reset successfully. Sign in with your new password.'));
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    if (error.name === 'ValidationError') return res.status(400).json(errorResponse(1, 'FAILED', error.message));
    return res.status(500).json(errorResponse(2, 'SERVER SIDE ERROR', 'Unable to reset password'));
  }
};
exports.changePassword = exports.requestPasswordChange;
exports.sendEmailVerificationLink = async (req, res) => {
  const user = await User.findById(req.user._id).select('+otpHash +otpAttempts');
  if (user.verified) return res.status(400).json(errorResponse(1, 'FAILED', 'Email is already verified'));
  await issueOtp(user, 'verify_email');
  return res.status(200).json(successResponse(0, 'SUCCESS', 'Verification code sent'));
};
exports.emailVerification = async (req, res) => res.status(410).json(errorResponse(1, 'REMOVED', 'Link verification was replaced by six-digit codes'));
exports.refreshToken = async (req, res) => loginResponse(res, req.user);
