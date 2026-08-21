
import { MailOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import MainLayout from '../../../components/layout';
import PublicRoute from '../../../components/routes/PublicRoute';
import ApiService from '../../../utils/apiService';
import notificationWithIcon from '../../../utils/notification';

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await ApiService.post('/api/v1/auth/forgot-password', values, { noAuth: true });
      notificationWithIcon('success', 'RESET EMAIL SENT', response?.result?.message || 'Check your email for a password-reset link.');
      form.resetFields();
      await router.push('/auth/login');
    } catch (err) {
      notificationWithIcon('error', 'UNABLE TO RESET PASSWORD', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Unable to send the password-reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <MainLayout title='LuxeStay ― Forgot Password'>
        <div style={{ width: '400px', height: 'calc(100vh - 205px)', margin: '0 auto' }}>
          <Form
            form={form}
            className='login-form'
            style={{ paddingTop: '200px' }}
            initialValues={{ remember: true }}
            name='beach-resort-forgot-password-form'
            onFinish={onFinish}
          >
            <Form.Item
              name='email'
              rules={[{
                required: true,
                message: 'Please input your Email!'
              }]}
            >
              <Input
                prefix={<MailOutlined className='site-form-item-icon' />}
                placeholder='Email'
                size='large'
              />
            </Form.Item>

            <Form.Item>
              <Button
                className='login-form-button'
                htmlType='submit'
                type='primary'
                size='large'
                block
                loading={loading}
                disabled={loading}
              >
                Send Reset Link
              </Button>
            </Form.Item>

            <Link
              className='btn-login-registration'
              href='/auth/login'
            >
              Or Login Here!
            </Link>
          </Form>
        </div>
      </MainLayout>
    </PublicRoute>
  );
}

export default ForgotPassword;
