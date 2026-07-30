import { LoadingOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Alert, Button, Divider, Form, Input, Modal } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../utils/apiService';
import { setSessionUserAndToken } from '../utils/authentication';

function Login() {
  window.document.title = 'LuxeStay - Login';
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [code, setCode] = useState('');

  const finishLogin = (response) => {
    setSessionUserAndToken(response?.result?.data, response?.access_token, response?.refresh_token);
    window.location.href = '/main/dashboard';
  };
  const onFinish = async (values) => {
    setLoading(true); setErrMsg('');
    try {
      finishLogin(await ApiService.post('/api/v1/auth/login?loginType=admin', values));
    } catch (error) {
      const data = error?.response?.data;
      if (data?.verification_required) {
        setVerificationToken(data.verification_token); setMaskedEmail(data.email); setCode('');
      } else setErrMsg(data?.result?.error || 'Unable to sign in');
    } finally { setLoading(false); }
  };
  const verify = async () => {
    setLoading(true); setErrMsg('');
    try { finishLogin(await ApiService.post('/api/v1/auth/login/verify-email', { verificationToken, code }, { noAuth: true })); }
    catch (error) { setErrMsg(error?.response?.data?.result?.error || 'Invalid or expired code'); }
    finally { setLoading(false); }
  };
  const resend = async () => {
    setLoading(true);
    try { await ApiService.post('/api/v1/auth/login/resend-code', { verificationToken }, { noAuth: true }); setErrMsg('A new code was sent.'); }
    catch (error) { setErrMsg(error?.response?.data?.result?.error || 'Could not resend code'); }
    finally { setLoading(false); }
  };
  return <section className='flex flex-col h-screen items-center justify-center'><div className='w-[90%] md:w-[450px]'>
    <Link to='/'><img className='w-[220px] h-[65px] object-contain mx-auto' alt='LuxeStay logo' src='/brand/luxestay-logo.svg' /></Link>
    <Divider className='!mb-10'>ADMIN LOGIN</Divider>{errMsg && <Alert message={errMsg} type={errMsg.includes('sent') ? 'success' : 'error'} className='!text-center !mb-4' />}
    <Form name='luxestay-admin-login' onFinish={onFinish} size='large'>
      <Form.Item name='email' rules={[{ type: 'email', required: true, message: 'Enter your email' }]}><Input prefix={<MailOutlined />} placeholder='Email' /></Form.Item>
      <Form.Item name='password' rules={[{ required: true, message: 'Enter your password' }]}><Input.Password prefix={<LockOutlined />} placeholder='Password' /></Form.Item>
      <Button loading={loading} htmlType='submit' type='primary' block>{loading ? <LoadingOutlined /> : 'Login'}</Button>
    </Form>
    <Modal title='Verify your email' open={Boolean(verificationToken)} onCancel={() => setVerificationToken('')} onOk={verify} confirmLoading={loading} okText='Verify and login'>
      <p>Enter the six-digit code sent to {maskedEmail}.</p><Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} inputMode='numeric' placeholder='000000' size='large' />
      <Button type='link' onClick={resend} disabled={loading}>Resend code</Button>
    </Modal>
  </div></section>;
}
export default React.memo(Login);