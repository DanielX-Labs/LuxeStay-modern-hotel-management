import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Alert, Button, Checkbox, Form, Input, Modal } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';
import MainLayout from '../../components/layout';
import PublicRoute from '../../components/routes/PublicRoute';
import ApiService from '../../utils/apiService';
import { setSessionUserAndToken } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';

function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [resendAfter, setResendAfter] = useState(0);
  const [resending, setResending] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    if (router.isReady && router.query.forgot === '1') setForgotPasswordOpen(true);
  }, [router.isReady, router.query.forgot]);
  useEffect(() => {
    if (!verificationToken || resendAfter <= 0) return undefined;
    const timer = setTimeout(() => setResendAfter((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => clearTimeout(timer);
  }, [verificationToken, resendAfter]);
  const finishLogin = (response) => {
    const remember = Boolean(form.getFieldValue('remember'));
    setSessionUserAndToken(response?.result?.data, response?.access_token, response?.refresh_token, remember);
    window.location.assign('/profile?tab=my-profile');
  };
  const onFinish = async (values) => {
    setLoading(true);
    try { finishLogin(await ApiService.post('/api/v1/auth/login', values, { noAuth: true })); }
    catch (error) {
      const data = error?.response?.data;
      if (data?.verification_required && data.verification_token) {
        setVerificationToken(data.verification_token);
        setMaskedEmail(data.email);
        setCode('');
        setCodeSent(data.code_sent !== false);
        setResendAfter(data.resend_after ?? 60);
        setVerificationError(data.code_sent === false ? data?.result?.error || 'We could not send your code. Please try sending it again.' : '');
      } else {
        notificationWithIcon('error', 'SIGN IN FAILED', data?.result?.error?.message || data?.result?.error || 'Unable to sign in');
      }
    }
    finally { setLoading(false); }
  };
  const verify = async () => {
    if (!/^\d{6}$/.test(code)) return notificationWithIcon('error', 'CODE REQUIRED', 'Enter the complete six-digit code');
    setLoading(true);
    setVerificationError('');
    try {
      finishLogin(await ApiService.post('/api/v1/auth/login/verify-email', { verificationToken, code }, { noAuth: true }));
    } catch (error) {
      setVerificationError(error?.response?.data?.result?.error?.message || error?.response?.data?.result?.error || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
    return undefined;
  };
  const resend = async () => {
    if (resending || loading || resendAfter > 0) return;
    setResending(true);
    setVerificationError('');
    try {
      const response = await ApiService.post('/api/v1/auth/login/resend-code', { verificationToken }, { noAuth: true });
      setCode('');
      setCodeSent(true);
      setResendAfter(response.resend_after ?? 60);
      notificationWithIcon('success', 'CODE SENT', 'A fresh verification code is on its way. Check your inbox and spam folder.');
    } catch (error) {
      const data = error?.response?.data;
      if (data?.resend_after !== undefined) setResendAfter(data.resend_after);
      if (data?.code_sent === false) {
        setCodeSent(false);
        setCode('');
      }
      setVerificationError(data?.result?.error?.message || data?.result?.error || 'Could not send your code. Please try again.');
    } finally {
      setResending(false);
    }
  };
  return <PublicRoute><MainLayout title='Sign in - LuxeStay'><main className='ls-auth-page'>
    <section className='ls-auth-visual ls-auth-login-visual'><div className='ls-auth-visual-shade' /><div className='ls-auth-visual-copy'><span>Welcome back</span><h1>Your next stay is closer than you think.</h1><p>Sign in to manage bookings, update your preferences, and continue planning with ease.</p><div><SafetyCertificateOutlined /> Secure account access</div></div></section>
    <section className='ls-auth-panel'><div className='ls-auth-card'><div className='ls-auth-heading'><span className='ls-auth-kicker'>Guest access</span><h2>Sign in to LuxeStay</h2><p>Enter the details you used when creating your account.</p></div>
      <Form form={form} onFinish={onFinish} layout='vertical' requiredMark={false} size='large' className='ls-auth-form'>
        <Form.Item name='email' label='Email address' rules={[{ type: 'email', required: true, message: 'Enter a valid email address' }]}><Input prefix={<MailOutlined />} placeholder='you@example.com' autoComplete='email' /></Form.Item>
        <Form.Item name='password' label='Password' rules={[{ required: true, message: 'Enter your password' }]}><Input.Password prefix={<LockOutlined />} placeholder='Your password' autoComplete='current-password' /></Form.Item>
        <div className='ls-auth-options'><Form.Item name='remember' valuePropName='checked' noStyle><Checkbox>Keep me signed in</Checkbox></Form.Item><button type='button' onClick={() => setForgotPasswordOpen(true)}>Forgot password?</button></div>
        <Button htmlType='submit' className='ls-auth-submit' loading={loading} block>Sign in <span>&rarr;</span></Button>
      </Form>
      <div className='ls-auth-switch'><span>New to LuxeStay?</span><Link href='/auth/registration'>Create your account</Link></div>
      <p className='ls-auth-security'><SafetyCertificateOutlined /> Protected with secure authentication</p>
    </div></section>
    <Modal className='ls-verify-modal' title={null} open={Boolean(verificationToken)} onCancel={() => setVerificationToken('')} closable={!loading && !resending} mask={{ closable: !loading && !resending }} keyboard={!loading && !resending} footer={null} centered>
      <div className='ls-code-icon'><MailOutlined /></div><span className='ls-auth-kicker'>One final step</span><h2>Verify your email</h2>
      <p>{codeSent ? <>We sent a six-digit code to <strong>{maskedEmail}</strong>. It expires in 10 minutes. Check your inbox and spam folder.</> : <>Your account has been created. Send a verification code to <strong>{maskedEmail}</strong> to finish signing in.</>}</p>
      {verificationError && <Alert type='warning' title={verificationError} showIcon />}
      <Input className='ls-code-input' aria-label='Six-digit email verification code' value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} onPressEnter={() => { if (codeSent && !loading && !resending && code.length === 6) verify(); }} maxLength={6} inputMode='numeric' autoComplete='one-time-code' placeholder='000000' autoFocus disabled={loading || resending} />
      <Button className='ls-auth-submit' onClick={verify} loading={loading} disabled={!codeSent || code.length !== 6 || resending} block>Verify and continue</Button>
      <button className='ls-resend-code' type='button' onClick={resend} disabled={resending || loading || resendAfter > 0}>
        {resending ? 'Sending code...' : resendAfter > 0 ? `Send a new code in ${resendAfter}s` : <b>{codeSent ? 'Send a new code' : 'Send verification code'}</b>}
      </button>
    </Modal>
    <ForgotPasswordModal open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} />
  </main></MainLayout></PublicRoute>;
}
export default Login;
