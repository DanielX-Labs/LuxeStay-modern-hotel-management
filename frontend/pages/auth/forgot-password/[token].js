
import { LockOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import MainLayout from '../../../components/layout';
import PublicRoute from '../../../components/routes/PublicRoute';
import ApiService from '../../../utils/apiService';
import notificationWithIcon from '../../../utils/notification';

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = async (values) => {
    if (!router.isReady || !router.query.token) {
      notificationWithIcon('error', 'INVALID RESET LINK', 'The password-reset token is missing. Request a new link.');
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.post(`/api/v1/auth/reset-password/${encodeURIComponent(router.query.token)}`, values, { noAuth: true });
      notificationWithIcon('success', 'PASSWORD RESET', response?.result?.message || 'Your password was reset successfully.');
      form.resetFields();
      await router.push('/auth/login');
    } catch (err) {
      notificationWithIcon('error', 'RESET FAILED', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'The reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <MainLayout title='LuxeStay ― Reset Password'>
        <div style={{ width: '400px', height: 'calc(100vh - 205px)', margin: '0 auto' }}>
          <Form
            form={form}
            className='login-form'
            style={{ paddingTop: '160px' }}
            initialValues={{ remember: true }}
            name='beach-resort-login-form'
            onFinish={onFinish}
          >
            <Form.Item
              name='password'
              rules={[{ required: true, min: 6, message: 'Use at least 6 characters.' }]}
            >
              <Input.Password
                prefix={<LockOutlined className='site-form-item-icon' />}
                placeholder='Password'
                type='password'
                size='large'
              />
            </Form.Item>

            <Form.Item
              name='confirmPassword'
              dependencies={['password']}
              rules={[
                { required: true, message: 'Confirm your new password.' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    return !value || getFieldValue('password') === value
                      ? Promise.resolve()
                      : Promise.reject(new Error('Passwords do not match.'));
                  }
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className='site-form-item-icon' />}
                placeholder='Confirm Password'
                type='password'
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
                disabled={loading || !router.isReady || !router.query.token}
              >
                Reset Password
              </Button>
            </Form.Item>

            <Link
              className='btn-login-registration'
              href='/auth/login'
            >
              or Login Here!
            </Link>
          </Form>
        </div>
      </MainLayout>
    </PublicRoute>
  );
}

export default ResetPassword;
