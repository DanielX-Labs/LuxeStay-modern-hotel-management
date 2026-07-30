import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Button, Progress, Result, Skeleton, Tag } from 'antd';
import React from 'react';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import useFetchData from '../../hooks/useFetchData';

const percent = (value, total) => (total ? Math.round((value / total) * 100) : 0);

function MetricCard({ icon, label, value, detail, accent, onClick }) {
  return (
    <button
      className='group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg'
      onClick={onClick}
      type='button'
    >
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500'>{label}</p>
          <p className='m-0 text-3xl font-bold tracking-tight text-slate-900'>
            <CountUp end={Number(value || 0)} separator=',' duration={1.1} />
          </p>
          <p className='mb-0 mt-2 text-sm text-slate-500'>{detail}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${accent}`}>
          {icon}
        </span>
      </div>
    </button>
  );
}

function StatusRow({ color, label, value, total }) {
  return (
    <div className='flex items-center gap-3 py-2.5'>
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
      <span className='min-w-0 flex-1 text-sm font-medium text-slate-600'>{label}</span>
      <span className='text-sm font-bold text-slate-900'>{value || 0}</span>
      <span className='w-10 text-right text-xs text-slate-400'>{percent(value, total)}%</span>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [loading, error, response] = useFetchData('/api/v1/dashboard');
  const users = response?.data?.users_info || {};
  const rooms = response?.data?.rooms_info || {};
  const bookings = response?.data?.booking_info || {};
  const occupancy = percent(rooms.booked_rooms, rooms.total_rooms);
  const verification = percent(users.verified_user, users.user_role_user);
  const completion = percent(bookings.completed_bookings, bookings.total_bookings);

  if (error) {
    return <Result title='Dashboard unavailable' subTitle={error} status='error' />;
  }

  return (
    <div className='min-h-full rounded-2xl bg-slate-50 p-4 sm:p-6 lg:p-8'>
      <Skeleton loading={loading} active paragraph={{ rows: 14 }}>
        <section className='mb-7 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-6 py-7 text-white shadow-xl sm:px-8 sm:py-9'>
          <div className='flex flex-col justify-between gap-6 md:flex-row md:items-end'>
            <div>
              <Tag className='!m-0 !border-white/20 !bg-white/15 !px-3 !py-1 !text-white'>LIVE OVERVIEW</Tag>
              <h1 className='mb-2 mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl'>Good to see you.</h1>
              <p className='m-0 max-w-xl text-sm leading-6 text-blue-50 sm:text-base'>Your LuxeStay operation at a glance. Guests, rooms, and reservations in one calm view.</p>
            </div>
            <div className='flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur'>
              <CalendarOutlined className='text-blue-100' />
              <div><p className='m-0 text-[10px] font-bold uppercase tracking-widest text-blue-100'>Today</p><p className='m-0 text-sm font-semibold text-white'>{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}</p></div>
            </div>
          </div>
        </section>

        <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <MetricCard icon={<TeamOutlined />} label='Total guests' value={users.user_role_user} detail={`${users.verified_user || 0} verified accounts`} accent='bg-blue-50 text-blue-600' onClick={() => navigate('/main/users')} />
          <MetricCard icon={<HomeOutlined />} label='Room inventory' value={rooms.total_rooms} detail={`${rooms.available_rooms || 0} ready to book`} accent='bg-emerald-50 text-emerald-600' onClick={() => navigate('/main/hotel-rooms')} />
          <MetricCard icon={<CalendarOutlined />} label='Reservations' value={bookings.total_bookings} detail={`${bookings.pending_bookings || 0} need attention`} accent='bg-violet-50 text-violet-600' onClick={() => navigate('/main/booking-orders')} />
          <MetricCard icon={<CheckCircleFilled />} label='Completed stays' value={bookings.completed_bookings} detail={`${completion}% of all reservations`} accent='bg-amber-50 text-amber-600' onClick={() => navigate('/main/booking-orders')} />
        </section>

        <section className='mt-5 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]'>
          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
            <div className='mb-6 flex items-center justify-between gap-4'>
              <div><h2 className='m-0 text-lg font-bold text-slate-900'>Booking pipeline</h2><p className='mb-0 mt-1 text-sm text-slate-500'>Current reservation distribution</p></div>
              <Button type='text' onClick={() => navigate('/main/booking-orders')}>View orders <ArrowRightOutlined /></Button>
            </div>
            <div className='grid gap-x-8 md:grid-cols-2'>
              <div>
                <StatusRow color='bg-amber-400' label='Pending' value={bookings.pending_bookings} total={bookings.total_bookings} />
                <StatusRow color='bg-blue-500' label='Approved' value={bookings.approved_bookings} total={bookings.total_bookings} />
                <StatusRow color='bg-violet-500' label='In review' value={bookings.in_reviews_bookings} total={bookings.total_bookings} />
              </div>
              <div>
                <StatusRow color='bg-emerald-500' label='Completed' value={bookings.completed_bookings} total={bookings.total_bookings} />
                <StatusRow color='bg-rose-500' label='Rejected' value={bookings.rejected_bookings} total={bookings.total_bookings} />
                <StatusRow color='bg-slate-400' label='Cancelled' value={bookings.cancel_bookings} total={bookings.total_bookings} />
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6'>
            <div className='mb-5'><h2 className='m-0 text-lg font-bold text-slate-900'>Property health</h2><p className='mb-0 mt-1 text-sm text-slate-500'>Operational readiness today</p></div>
            <div className='space-y-6'>
              <div><div className='mb-2 flex justify-between text-sm'><span className='font-medium text-slate-600'>Room occupancy</span><span className='font-bold text-slate-900'>{occupancy}%</span></div><Progress percent={occupancy} showInfo={false} strokeColor='#2563eb' trailColor='#e2e8f0' /></div>
              <div><div className='mb-2 flex justify-between text-sm'><span className='font-medium text-slate-600'>Verified guests</span><span className='font-bold text-slate-900'>{verification}%</span></div><Progress percent={verification} showInfo={false} strokeColor='#10b981' trailColor='#e2e8f0' /></div>
              <div className='grid grid-cols-2 gap-3 pt-1'>
                <div className='rounded-xl bg-emerald-50 p-3'><HomeOutlined className='text-emerald-600' /><p className='mb-0 mt-2 text-xl font-bold text-slate-900'>{rooms.available_rooms || 0}</p><p className='m-0 text-xs text-slate-500'>Available rooms</p></div>
                <div className='rounded-xl bg-rose-50 p-3'><StopOutlined className='text-rose-600' /><p className='mb-0 mt-2 text-xl font-bold text-slate-900'>{rooms.unavailable_rooms || 0}</p><p className='m-0 text-xs text-slate-500'>Unavailable</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className='mt-5 grid gap-4 md:grid-cols-3'>
          <button type='button' onClick={() => navigate('/main/booking-orders')} className='flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md'><span className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600'><ClockCircleOutlined /></span><span className='flex-1'><b className='block text-slate-900'>Review pending</b><small className='text-slate-500'>{bookings.pending_bookings || 0} reservations waiting</small></span><ArrowRightOutlined className='text-slate-400' /></button>
          <button type='button' onClick={() => navigate('/main/hotel-rooms')} className='flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md'><span className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600'><HomeOutlined /></span><span className='flex-1'><b className='block text-slate-900'>Manage rooms</b><small className='text-slate-500'>Update rates and availability</small></span><ArrowRightOutlined className='text-slate-400' /></button>
          <button type='button' onClick={() => navigate('/main/users')} className='flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md'><span className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600'><SafetyCertificateOutlined /></span><span className='flex-1'><b className='block text-slate-900'>Guest accounts</b><small className='text-slate-500'>{users.blocked_status_user || 0} blocked accounts</small></span><ArrowRightOutlined className='text-slate-400' /></button>
        </section>
      </Skeleton>
    </div>
  );
}

export default React.memo(Dashboard);