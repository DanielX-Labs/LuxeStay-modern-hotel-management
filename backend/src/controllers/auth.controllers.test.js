/* eslint-env jest */
/* eslint-disable node/no-unpublished-require */
const crypto = require('crypto');
const express = require('express');
const request = require('supertest');
const User = require('../models/user.model');
const { sendOtpEmail } = require('../configs/send.mail');
const auth = require('./auth.controllers');

jest.mock('../models/user.model', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}));
jest.mock('../configs/send.mail', () => ({ sendOtpEmail: jest.fn() }));
jest.mock('../middleware/winston.logger', () => ({
  error: jest.fn(),
  warn: jest.fn()
}));

const app = express();
app.use(express.json());
app.post('/registration', auth.register);
app.post('/login', auth.loginUser);
app.post('/login/verify-email', auth.verifyLoginEmail);
app.post('/login/resend-code', auth.resendLoginVerificationCode);

const registration = {
  userName: 'new-guest',
  fullName: 'New Guest',
  email: 'guest@example.com',
  phone: '+2348012345678',
  dob: '1995-01-01',
  address: '1 Test Street',
  gender: 'male',
  password: 'test-password'
};
const credentials = { email: registration.email, password: registration.password };
let user;

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = 'test-only-email-verification-secret';
  process.env.JWT_ACCESS_EXPIRES = '15m';
  process.env.JWT_REFRESH_EXPIRES = '7d';
  process.env.COOKIE_EXPIRES_DAYS = '7';
});

beforeEach(() => {
  jest.clearAllMocks();
  sendOtpEmail.mockReset();
  sendOtpEmail.mockResolvedValue({ accepted: [registration.email] });
  user = {
    ...registration,
    _id: 'test-guest-id',
    role: 'user',
    verified: false,
    status: 'register',
    otpAttempts: 0,
    save: jest.fn().mockResolvedValue(undefined),
    comparePassword: jest.fn().mockResolvedValue(true),
    getJWTToken: jest.fn().mockReturnValue('test-access-token'),
    getJWTRefreshToken: jest.fn().mockReturnValue('test-refresh-token')
  };
  User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
  User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
  User.create.mockResolvedValue(user);
});

afterEach(() => jest.restoreAllMocks());

test('registration succeeds without sending email and cannot request an admin or verified account', async () => {
  User.findOne.mockResolvedValueOnce(null);
  sendOtpEmail.mockRejectedValue(new Error('Email provider unavailable'));

  const response = await request(app).post('/registration')
    .send({
      ...registration, email: ' GUEST@EXAMPLE.COM ', role: 'admin', verified: true
    });

  expect(response.status).toBe(201);
  expect(response.body.result.data).toEqual({ email: registration.email, role: 'user', verified: false });
  expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
    email: registration.email,
    role: 'user',
    verified: false
  }));
  expect(sendOtpEmail).not.toHaveBeenCalled();
  expect(response.body.access_token).toBeUndefined();
});

test('registration rejects duplicate accounts', async () => {
  User.findOne.mockResolvedValueOnce(user);
  const response = await request(app).post('/registration').send(registration);
  expect(response.status).toBe(409);
  expect(User.create).not.toHaveBeenCalled();
});

test('registration rejects missing required details', async () => {
  const response = await request(app).post('/registration').send({ email: registration.email });
  expect(response.status).toBe(400);
  expect(User.create).not.toHaveBeenCalled();
});

test('first login sends a code and returns a verification session without granting access', async () => {
  const response = await request(app).post('/login').send(credentials);
  expect(response.status).toBe(403);
  expect(response.body).toMatchObject({ verification_required: true, code_sent: true });
  expect(response.body.verification_token).toEqual(expect.any(String));
  expect(response.body.resend_after).toBeGreaterThan(0);
  expect(sendOtpEmail).toHaveBeenCalledWith({
    email: registration.email, purpose: 'verify_email', code: expect.stringMatching(/^\d{6}$/)
  });
  expect(user.verified).toBe(false);
  expect(user.getJWTToken).not.toHaveBeenCalled();
  expect(response.body.access_token).toBeUndefined();
  expect(response.headers['set-cookie']).toBeUndefined();
});

test('a correct code verifies the new account and completes login', async () => {
  const login = await request(app).post('/login').send(credentials);
  const { code } = sendOtpEmail.mock.calls[0][0];
  const response = await request(app).post('/login/verify-email')
    .send({ verificationToken: login.body.verification_token, code });
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    result: { data: { verified: true, status: 'login' } }
  });
  expect(user.otpHash).toBeUndefined();
  expect(user.save).toHaveBeenCalled();
});

test('an email delivery failure keeps the account registered and offers a retry session', async () => {
  sendOtpEmail.mockRejectedValueOnce(new Error('SMTP connection timed out'));
  const response = await request(app).post('/login').send(credentials);
  expect(response.status).toBe(403);
  expect(response.body).toMatchObject({
    verification_required: true, code_sent: false, resend_after: 0
  });
  expect(response.body.verification_token).toEqual(expect.any(String));
  expect(user.verified).toBe(false);
  expect(user.status).toBe('register');
  expect(user.otpHash).toBeUndefined();
  expect(user.getJWTToken).not.toHaveBeenCalled();
  expect(response.body.result.error).not.toContain('SMTP');
});

test('a failed email can be resent and the new code completes login', async () => {
  sendOtpEmail.mockRejectedValueOnce(new Error('SMTP connection timed out'));
  const login = await request(app).post('/login').send(credentials);
  const verificationToken = login.body.verification_token;
  const resend = await request(app).post('/login/resend-code').send({ verificationToken });
  expect(resend.status).toBe(200);
  expect(resend.body.resend_after).toBeGreaterThan(0);
  const { code } = sendOtpEmail.mock.calls[1][0];
  const response = await request(app).post('/login/verify-email').send({ verificationToken, code });
  expect(response.status).toBe(200);
  expect(user.verified).toBe(true);
});

test('resending too soon reports the remaining cooldown without sending again', async () => {
  const login = await request(app).post('/login').send(credentials);
  const response = await request(app).post('/login/resend-code')
    .send({ verificationToken: login.body.verification_token });
  expect(response.status).toBe(429);
  expect(response.body.resend_after).toBeGreaterThan(0);
  expect(sendOtpEmail).toHaveBeenCalledTimes(1);
});

test('resending after the cooldown replaces the previous code', async () => {
  jest.spyOn(crypto, 'randomInt').mockReturnValueOnce(123456).mockReturnValueOnce(654321);
  const login = await request(app).post('/login').send(credentials);
  const previousHash = user.otpHash;
  user.otpLastSentAt = new Date(Date.now() - 61000);
  const response = await request(app).post('/login/resend-code')
    .send({ verificationToken: login.body.verification_token });
  expect(response.status).toBe(200);
  expect(sendOtpEmail).toHaveBeenCalledTimes(2);
  expect(user.otpHash).not.toBe(previousHash);
});

test('resend delivery failure is retryable and does not expose the provider error', async () => {
  const login = await request(app).post('/login').send(credentials);
  user.otpLastSentAt = new Date(Date.now() - 61000);
  sendOtpEmail.mockRejectedValueOnce(new Error('SMTP authentication failed'));
  const response = await request(app).post('/login/resend-code')
    .send({ verificationToken: login.body.verification_token });
  expect(response.status).toBe(503);
  expect(response.body.code_sent).toBe(false);
  expect(response.body.resend_after).toBe(0);
  expect(response.body.result.error).not.toContain('SMTP');
  expect(user.verified).toBe(false);
});

test('a wrong code cannot verify the account or grant access', async () => {
  const login = await request(app).post('/login').send(credentials);
  const response = await request(app).post('/login/verify-email')
    .send({ verificationToken: login.body.verification_token, code: '000000' });
  expect(response.status).toBe(400);
  expect(user.verified).toBe(false);
  expect(user.otpAttempts).toBe(1);
  expect(user.getJWTToken).not.toHaveBeenCalled();
});

test('an expired code cannot verify the account', async () => {
  const login = await request(app).post('/login').send(credentials);
  const { code } = sendOtpEmail.mock.calls[0][0];
  user.otpExpires = new Date(Date.now() - 1);
  const response = await request(app).post('/login/verify-email')
    .send({ verificationToken: login.body.verification_token, code });
  expect(response.status).toBe(400);
  expect(user.verified).toBe(false);
  expect(user.getJWTToken).not.toHaveBeenCalled();
});

test('too many wrong codes require a fresh code', async () => {
  const login = await request(app).post('/login').send(credentials);
  const { code } = sendOtpEmail.mock.calls[0][0];
  user.otpAttempts = 5;
  const response = await request(app).post('/login/verify-email')
    .send({ verificationToken: login.body.verification_token, code });
  expect(response.status).toBe(429);
  expect(user.verified).toBe(false);
  expect(user.otpHash).toBeUndefined();
});

test('a repeated login within the cooldown reuses the pending verification', async () => {
  await request(app).post('/login').send(credentials);
  const response = await request(app).post('/login').send(credentials);
  expect(response.status).toBe(403);
  expect(response.body.code_sent).toBe(true);
  expect(sendOtpEmail).toHaveBeenCalledTimes(1);
});

test('a cooldown for another OTP purpose does not claim an email verification code was sent', async () => {
  user.otpLastSentAt = new Date();
  user.otpPurpose = 'reset_password';
  user.otpExpires = new Date(Date.now() + 600000);
  user.otpHash = 'password-reset-hash';
  const response = await request(app).post('/login').send(credentials);
  expect(response.status).toBe(403);
  expect(response.body.code_sent).toBe(false);
  expect(response.body.resend_after).toBeGreaterThan(0);
  expect(sendOtpEmail).not.toHaveBeenCalled();
});

test('verified clients sign in without another verification code', async () => {
  user.verified = true;
  const response = await request(app).post('/login').send(credentials);
  expect(response.status).toBe(200);
  expect(response.body.access_token).toBe('test-access-token');
  expect(sendOtpEmail).not.toHaveBeenCalled();
});

test('wrong credentials cannot send a verification code', async () => {
  user.comparePassword.mockResolvedValue(false);
  const response = await request(app).post('/login').send(credentials);
  expect(response.status).toBe(400);
  expect(sendOtpEmail).not.toHaveBeenCalled();
  expect(user.getJWTToken).not.toHaveBeenCalled();
});

test.each(['/login/verify-email', '/login/resend-code'])('a blocked account cannot use a pending verification session at %s', async (endpoint) => {
  const login = await request(app).post('/login').send(credentials);
  const { code } = sendOtpEmail.mock.calls[0][0];
  user.status = 'blocked';
  const response = await request(app).post(endpoint)
    .send({ verificationToken: login.body.verification_token, code });
  expect(response.status).toBe(403);
  expect(user.status).toBe('blocked');
  expect(user.verified).toBe(false);
  expect(user.getJWTToken).not.toHaveBeenCalled();
});

test('a forged verification session cannot verify an account', async () => {
  const response = await request(app).post('/login/verify-email')
    .send({ verificationToken: 'forged-token', code: '123456' });
  expect(response.status).toBe(400);
  expect(user.verified).toBe(false);
  expect(user.getJWTToken).not.toHaveBeenCalled();
});
