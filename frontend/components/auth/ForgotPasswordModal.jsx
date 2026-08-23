import {
  CheckCircleOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined
} from '@ant-design/icons';
import { Button, Form, Input, Modal } from 'antd';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';

const errorMessage = (error, fallback) => error?.response?.data?.result?.error?.message
  || error?.response?.data?.result?.error
  || fallback;

function ForgotPasswordModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [otpFormKey, setOtpFormKey] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const resetModal = () => {
    setStep(1);
    setResetToken('');
    setMaskedEmail('');
    setCooldown(0);
    setOtpFormKey(0);
  };

  const close = () => {
    if (loading) return;
    resetModal();
    onClose();
  };

  const sendOtp = async ({ email }) => {
    setLoading(true);
    try {
      const response = await ApiService.post('/api/v1/auth/forgot-password', { email }, { noAuth: true });
      setResetToken(response?.reset_token);
      setMaskedEmail(response?.email);
      setCooldown(60);
      setStep(2);
      notificationWithIcon('success', 'OTP SENT', response?.result?.message || 'Check your email for the six-digit code.');
    } catch (error) {
      notificationWithIcon('error', 'UNABLE TO SEND OTP', errorMessage(error, 'Unable to start password recovery.'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async ({ code }) => {
    setLoading(true);
    try {
      const response = await ApiService.post('/api/v1/auth/forgot-password/verify-code', { resetToken, code }, { noAuth: true });
      setResetToken(response?.reset_token);
      setStep(3);
      notificationWithIcon('success', 'OTP VERIFIED', response?.result?.message || 'Choose your new password.');
    } catch (error) {
      notificationWithIcon('error', 'VERIFICATION FAILED', errorMessage(error, 'The code is invalid or expired.'));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      const response = await ApiService.post('/api/v1/auth/forgot-password/resend-code', { resetToken }, { noAuth: true });
      setOtpFormKey((key) => key + 1);
      setCooldown(60);
      notificationWithIcon('success', 'OTP SENT', response?.result?.message || 'A new code was sent.');
    } catch (error) {
      notificationWithIcon('error', 'UNABLE TO RESEND', errorMessage(error, 'Unable to send another code.'));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ password, confirmPassword }) => {
    setLoading(true);
    try {
      const response = await ApiService.post(`/api/v1/auth/reset-password/${encodeURIComponent(resetToken)}`, { password, confirmPassword }, { noAuth: true });
      setResetToken('');
      setStep(4);
      notificationWithIcon('success', 'PASSWORD RESET', response?.result?.message || 'Your password was reset successfully.');
    } catch (error) {
      notificationWithIcon('error', 'RESET FAILED', errorMessage(error, 'Unable to reset your password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal className='ls-verify-modal ls-forgot-modal' title={null} open={open} onCancel={close} footer={null} centered mask={{ closable: !loading }}>
      {step < 4 && <div className='ls-forgot-progress' aria-label={`Password recovery step ${step} of 3`}><span className={step >= 1 ? 'is-active' : ''} /><span className={step >= 2 ? 'is-active' : ''} /><span className={step >= 3 ? 'is-active' : ''} /></div>}

      {step === 1 && <><div className='ls-code-icon'><MailOutlined /></div><span className='ls-auth-kicker'>Password recovery</span><h2>Forgot your password?</h2><p>Enter your registered email address and we will send you a secure, six-digit code.</p><Form onFinish={sendOtp} layout='vertical' requiredMark={false} className='ls-auth-form'><Form.Item name='email' label='Email address' rules={[{ type: 'email', required: true, message: 'Enter a valid email address' }]}><Input prefix={<MailOutlined />} placeholder='you@example.com' autoComplete='email' size='large' /></Form.Item><Button className='ls-auth-submit' htmlType='submit' loading={loading} block>Send OTP</Button></Form></>}

      {step === 2 && <><div className='ls-code-icon'><SafetyCertificateOutlined /></div><span className='ls-auth-kicker'>Verify your identity</span><h2>Enter your OTP</h2><p>We sent a six-digit code to <strong>{maskedEmail}</strong>. It expires in 10 minutes.</p><Form key={otpFormKey} onFinish={verifyOtp}><Form.Item name='code' normalize={(value) => String(value || '').replace(/\D/g, '').slice(0, 6)} rules={[{ required: true, pattern: /^\d{6}$/, message: 'Enter the complete six-digit code' }]}><Input className='ls-code-input' maxLength={6} inputMode='numeric' placeholder='000000' autoComplete='one-time-code' /></Form.Item><Button className='ls-auth-submit' htmlType='submit' loading={loading} block>Verify OTP</Button></Form><button className='ls-resend-code' type='button' onClick={resendOtp} disabled={cooldown > 0 || loading}>{cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Did not receive it? Send a new code'}</button></>}

      {step === 3 && <><div className='ls-code-icon'><LockOutlined /></div><span className='ls-auth-kicker'>Secure your account</span><h2>Set a new password</h2><p>Use at least six characters and choose a password you do not use elsewhere.</p><Form onFinish={resetPassword} layout='vertical' requiredMark={false} className='ls-auth-form'><Form.Item name='password' label='New password' rules={[{ required: true, min: 6, message: 'Use at least six characters' }]}><Input.Password prefix={<LockOutlined />} autoComplete='new-password' size='large' /></Form.Item><Form.Item name='confirmPassword' label='Confirm new password' dependencies={['password']} rules={[{ required: true, message: 'Confirm your new password' }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Passwords do not match')); } })]}><Input.Password prefix={<LockOutlined />} autoComplete='new-password' size='large' /></Form.Item><Button className='ls-auth-submit' htmlType='submit' loading={loading} block>Reset Password</Button></Form></>}

      {step === 4 && <><div className='ls-code-icon ls-success-icon'><CheckCircleOutlined /></div><span className='ls-auth-kicker'>All done</span><h2>Password Reset Successfully</h2><p>Your new password is ready. You can now sign in to your LuxeStay account.</p><Button className='ls-auth-submit' onClick={close} block>Continue to Login</Button></>}
    </Modal>
  );
}

ForgotPasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ForgotPasswordModal;
