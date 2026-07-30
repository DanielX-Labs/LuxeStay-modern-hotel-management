import { Button, Form, Input, Modal, Space } from 'antd';
import React, { useState } from 'react';
import ApiService from '../../utils/apiService';
import { setSessionUserKeyAgainstValue } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';

export default function AccountSecurity() {
  const [flow, setFlow] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const open = (type) => { setFlow(type); setStep(1); form.resetFields(); };
  const close = () => { setFlow(''); setStep(1); form.resetFields(); };
  const submit = async (values) => {
    setLoading(true);
    try {
      if (step === 1) {
        await ApiService.post(flow === 'email' ? '/api/v1/auth/change-email' : '/api/v1/auth/change-password', flow === 'email' ? { newEmail: values.newEmail, password: values.password } : { oldPassword: values.oldPassword });
        setStep(2); form.resetFields(); notificationWithIcon('success', 'CODE SENT', 'Check your email for the six-digit code');
      } else {
        const response = await ApiService.post(flow === 'email' ? '/api/v1/auth/change-email/verify' : '/api/v1/auth/change-password/verify', values);
        if (flow === 'email') setSessionUserKeyAgainstValue('email', response?.result?.data?.email);
        notificationWithIcon('success', 'SUCCESS', response?.result?.message); close();
        if (flow === 'email') window.location.reload();
      }
    } catch (error) { notificationWithIcon('error', 'ERROR', error?.response?.data?.result?.error || 'Request failed'); }
    finally { setLoading(false); }
  };
  return <><Space><Button onClick={() => open('email')}>Change Email</Button><Button onClick={() => open('password')}>Change Password</Button></Space>
    <Modal title={`Change ${flow}`} open={Boolean(flow)} onCancel={close} footer={null} destroyOnClose>
      <Form form={form} layout='vertical' onFinish={submit}>
        {step === 1 && flow === 'email' && <><Form.Item name='newEmail' label='New email' rules={[{ type: 'email', required: true }]}><Input /></Form.Item><Form.Item name='password' label='Current password' rules={[{ required: true }]}><Input.Password /></Form.Item></>}
        {step === 1 && flow === 'password' && <Form.Item name='oldPassword' label='Current password' rules={[{ required: true }]}><Input.Password /></Form.Item>}
        {step === 2 && <><Form.Item name='code' label='Six-digit code' rules={[{ required: true, pattern: /^\d{6}$/ }]}><Input maxLength={6} inputMode='numeric' /></Form.Item>{flow === 'password' && <><Form.Item name='newPassword' label='New password' rules={[{ required: true, min: 6 }]}><Input.Password /></Form.Item><Form.Item name='confirmPassword' label='Confirm password' dependencies={['newPassword']} rules={[{ required: true }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('newPassword') === value ? Promise.resolve() : Promise.reject(new Error('Passwords do not match')); } })]}><Input.Password /></Form.Item></>}</>}
        <Button type='primary' htmlType='submit' loading={loading} block>{step === 1 ? 'Send verification code' : 'Verify and save'}</Button>
      </Form>
    </Modal></>;
}