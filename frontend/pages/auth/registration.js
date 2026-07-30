import { ArrowLeftOutlined, ArrowRightOutlined, CalendarOutlined, CheckOutlined, EnvironmentOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Select } from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import MainLayout from '../../components/layout';
import PublicRoute from '../../components/routes/PublicRoute';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';
const { TextArea } = Input;
const steps = [{ title: 'Account', note: 'How we reach you', fields: ['fullName', 'userName', 'email', 'phone'] }, { title: 'About you', note: 'Personalize your stay', fields: ['dob', 'gender', 'address'] }, { title: 'Secure', note: 'Protect your account', fields: ['password', 'confirmPassword'] }];
function Registration() {
  const [step, setStep] = useState(0); const [loading, setLoading] = useState(false); const [form] = Form.useForm(); const router = useRouter();
  const next = async () => { try { await form.validateFields(steps[step].fields); setStep((value) => value + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { /* Ant Design displays field errors */ } };
  const onFinish = async (values) => { setLoading(true); const data = { userName: values.userName, fullName: values.fullName, email: values.email, phone: values.phone, dob: dayjs(values.dob).format('YYYY-MM-DD'), gender: values.gender, address: values.address, password: values.password }; try { const response = await ApiService.post('/api/v1/auth/registration', data); notificationWithIcon('success', 'WELCOME TO LUXESTAY', response?.result?.message || 'Your account was created'); form.resetFields(); router.push('/auth/login'); } catch (error) { notificationWithIcon('error', 'REGISTRATION FAILED', error?.response?.data?.result?.error?.message || error?.response?.data?.result?.error || 'Unable to create your account'); } finally { setLoading(false); } };
  return <PublicRoute><MainLayout title='Create account - LuxeStay'><main className='ls-auth-page ls-register-page'>
    <section className='ls-auth-visual ls-auth-register-visual'><div className='ls-auth-visual-shade' /><div className='ls-auth-visual-copy'><span>Join LuxeStay</span><h1>More personal stays begin here.</h1><p>Create one account for simpler booking, organized travel, and thoughtful guest care.</p><ul><li><CheckOutlined /> Manage every reservation</li><li><CheckOutlined /> Faster, secure booking</li><li><CheckOutlined /> Personalized account support</li></ul></div></section>
    <section className='ls-auth-panel'><div className='ls-auth-card ls-register-card'><div className='ls-auth-heading'><span className='ls-auth-kicker'>Create your account</span><h2>{step === 0 ? 'Start with the essentials' : step === 1 ? 'Tell us about yourself' : 'Secure your account'}</h2><p>{step === 0 ? 'Use details you can easily recognize later.' : step === 1 ? 'These details help us personalize your experience.' : 'Choose a strong password you do not use elsewhere.'}</p></div>
      <div className='ls-stepper'>{steps.map((item, index) => <div className={index === step ? 'is-current' : index < step ? 'is-complete' : ''} key={item.title}><span>{index < step ? <CheckOutlined /> : index + 1}</span><p><b>{item.title}</b><small>{item.note}</small></p></div>)}</div>
      <Form form={form} onFinish={onFinish} layout='vertical' requiredMark={false} size='large' className='ls-auth-form' preserve>
        <div className={step === 0 ? 'ls-step-fields is-active' : 'ls-step-fields'}>
          <div className='ls-form-grid'><Form.Item name='fullName' label='Full name' rules={[{ required: true, message: 'Enter your full name' }]}><Input prefix={<UserOutlined />} placeholder='Your full name' autoComplete='name' /></Form.Item><Form.Item name='userName' label='Username' rules={[{ required: true, min: 3, message: 'Use at least 3 characters' }]}><Input prefix={<UserOutlined />} placeholder='Choose a username' autoComplete='username' /></Form.Item></div>
          <Form.Item name='email' label='Email address' rules={[{ required: true, type: 'email', message: 'Enter a valid email address' }]}><Input prefix={<MailOutlined />} placeholder='you@example.com' autoComplete='email' /></Form.Item>
          <Form.Item name='phone' label='Phone number' rules={[{ required: true, message: 'Enter your phone number' }]}><Input prefix={<PhoneOutlined />} placeholder='+234 000 000 0000' inputMode='tel' autoComplete='tel' /></Form.Item>
        </div>
        <div className={step === 1 ? 'ls-step-fields is-active' : 'ls-step-fields'}>
          <div className='ls-form-grid'><Form.Item name='dob' label='Date of birth' rules={[{ required: true, message: 'Select your date of birth' }]}><DatePicker prefix={<CalendarOutlined />} placeholder='Select date' format='DD MMM YYYY' disabledDate={(date) => date && date > dayjs().endOf('day')} /></Form.Item><Form.Item name='gender' label='Gender' rules={[{ required: true, message: 'Select your gender' }]}><Select placeholder='Select an option' options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]} /></Form.Item></div>
          <Form.Item name='address' label='Address' rules={[{ required: true, min: 5, message: 'Enter your address' }]}><TextArea prefix={<EnvironmentOutlined />} placeholder='Your home address' rows={4} /></Form.Item>
        </div>
        <div className={step === 2 ? 'ls-step-fields is-active' : 'ls-step-fields'}>
          <Form.Item name='password' label='Create password' rules={[{ required: true, min: 6, message: 'Use at least 6 characters' }]}><Input.Password prefix={<LockOutlined />} placeholder='At least 6 characters' autoComplete='new-password' /></Form.Item>
          <Form.Item name='confirmPassword' label='Confirm password' dependencies={['password']} rules={[{ required: true, message: 'Confirm your password' }, ({ getFieldValue }) => ({ validator(_, value) { return !value || getFieldValue('password') === value ? Promise.resolve() : Promise.reject(new Error('Passwords do not match')); } })]}><Input.Password prefix={<LockOutlined />} placeholder='Enter it once more' autoComplete='new-password' /></Form.Item>
          <div className='ls-register-note'><LockOutlined /><p><b>Your privacy matters</b><span>Your password is encrypted and your details are used only to manage your LuxeStay account.</span></p></div>
        </div>
        <div className='ls-step-actions'>{step > 0 && <Button className='ls-step-back' onClick={() => setStep((value) => value - 1)} icon={<ArrowLeftOutlined />}>Back</Button>}{step < steps.length - 1 ? <Button className='ls-auth-submit' onClick={next}>Continue <ArrowRightOutlined /></Button> : <Button className='ls-auth-submit' htmlType='submit' loading={loading}>Create account <ArrowRightOutlined /></Button>}</div>
      </Form><div className='ls-auth-switch'><span>Already have an account?</span><Link href='/auth/login'>Sign in instead</Link></div>
    </div></section>
  </main></MainLayout></PublicRoute>;
}
export default Registration;