import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Button, Modal, Result, Space, Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import useFetchData from '../../hooks/useFetchData';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';
import { bookingStatusAsResponse } from '../../utils/responseAsStatus';
import QueryOptions from '../shared/QueryOptions';
import RoomStatusUpdateModal from '../shared/RoomStatusUpdateModal';

function Orders() {
  const [refresh, setRefresh] = useState(false); const [query, setQuery] = useState({ search: '', sort: 'desc', page: '1', rows: '10' });
  const [statusModal, setStatusModal] = useState({ open: false, roomId: null, status: null });
  const [loading, error, response] = useFetchData(`/api/v1/get-all-booking-orders?keyword=${encodeURIComponent(query.search)}&limit=${query.rows}&page=${query.page}&sort=${query.sort}`, refresh);
  useEffect(() => setQuery((state) => ({ ...state, page: '1' })), [query.rows, query.search]);
  const call = async (url, method = 'post', data) => { try { const result = await ApiService[method](url, data); notificationWithIcon('success', 'SUCCESS', result?.result?.message); setRefresh((value) => !value); } catch (err) { notificationWithIcon('error', 'ERROR', err?.response?.data?.result?.error || 'Operation failed.'); } };
  const invoice = async (row, print = false) => { try { const result = await ApiService.get(`/api/v1/booking/${row.id}/invoice`); const win = window.open(result?.result?.data?.url, '_blank'); if (!win) throw new Error('Your browser blocked the invoice window.'); if (print) win.addEventListener('load', () => win.print()); notificationWithIcon('success', print ? 'INVOICE READY TO PRINT' : 'INVOICE OPENED', `${row.booking_id} was opened securely.`); } catch (err) { notificationWithIcon('error', 'INVOICE UNAVAILABLE', err?.message || 'The invoice could not be opened.'); } };
  const cancel = (row) => Modal.confirm({ title: `Cancel ${row.booking_id}?`, content: 'The room will immediately become available for other guests.', okButtonProps: { danger: true }, onOk: () => call(`/api/v1/admin/booking/${row.id}/cancel`, 'put', { cancellation_reason: 'Cancelled by hotel staff' }) });
  const columns = [
    { title: 'Booking ID', dataIndex: 'booking_id', fixed: 'left', render: (value) => <span className='admin-booking-id'>{value}</span> },
    { title: 'Client', dataIndex: 'booking_by', render: (user) => <>{user?.fullName}<br /><small>{user?.email}</small></> },
    { title: 'Room', dataIndex: 'room', render: (room) => <>{room?.room_number}<br /><small>{room?.room_type}</small></> },
    { title: 'Stay', render: (_, row) => <>{dayjs(row.check_in).format('DD MMM YYYY')} → {dayjs(row.check_out).format('DD MMM YYYY')}<br /><small>{row.number_of_nights} night(s)</small></> },
    { title: 'Total', dataIndex: 'total_amount', render: (value) => `NGN ${Number(value || 0).toLocaleString()}` },
    { title: 'Booking', dataIndex: 'booking_status', render: (value) => <Tag color={bookingStatusAsResponse(value).color}>{bookingStatusAsResponse(value).level}</Tag> },
    { title: 'Payment', dataIndex: 'payment_status', render: (value) => <Tag color={value === 'paid' ? 'green' : 'gold'}>{value === 'paid' ? 'PAID' : 'PENDING'}</Tag> },
    { title: 'Booked', dataIndex: 'created_at', render: (value) => dayjs(value).format('DD MMM YYYY HH:mm') },
    { title: 'Cancellation', render: (_, row) => row.cancelled_at ? <Tooltip title={row.cancellation_reason}>{row.cancelled_by} · {dayjs(row.cancelled_at).format('DD MMM YYYY')}</Tooltip> : '—' },
    { title: 'Actions', fixed: 'right', width: 250, render: (_, row) => <Space wrap>
      <Button icon={<FilePdfOutlined />} size='small' onClick={() => invoice(row)} disabled={!row.invoice_available}>Invoice</Button>
      <Button size='small' onClick={() => invoice(row, true)} disabled={!row.invoice_available}>Print</Button>
      <Button size='small' onClick={() => call(`/api/v1/admin/booking/${row.id}/resend-invoice`)} disabled={!row.invoice_available}>Resend</Button>
      {row.payment_status === 'pending' && !['cancelled', 'no_show'].includes(row.booking_status) && <Button size='small' type='primary' onClick={() => call(`/api/v1/updated-booking-order/${row.id}`, 'put', { payment_status: 'paid' })}>Confirm Payment</Button>}
      {!['checked_out', 'cancelled', 'no_show'].includes(row.booking_status) && <Button size='small' onClick={() => setStatusModal({ open: true, roomId: row.id, status: row.booking_status })}>Status</Button>}
      {!['checked_in', 'checked_out', 'cancelled', 'no_show'].includes(row.booking_status) && <Button size='small' danger onClick={() => cancel(row)}>Cancel</Button>}
    </Space> }
  ];
  const rows = response?.data?.rows || [];
  return <div className='admin-bookings-page'>
    <section className='admin-bookings-hero'><div><span>Reservation desk</span><h1>Bookings</h1><p>Verify guests, manage arrivals, confirm payments, and retrieve invoices.</p></div><div className='admin-bookings-total'><CalendarOutlined /><strong>{response?.data?.total_rows || 0}</strong><small>Total reservations</small></div></section>
    <div className='admin-booking-stats'><article><CalendarOutlined /><div><b>{rows.filter((row) => ['pending', 'confirmed'].includes(row.booking_status)).length}</b><span>Upcoming on this page</span></div></article><article><ClockCircleOutlined /><div><b>{rows.filter((row) => row.payment_status === 'pending').length}</b><span>Awaiting payment</span></div></article><article><CheckCircleOutlined /><div><b>{rows.filter((row) => row.payment_status === 'paid').length}</b><span>Paid on this page</span></div></article></div>
    <div className='admin-bookings-toolbar'><QueryOptions query={query} setQuery={setQuery} /></div>
    {error ? <Result status='error' title='Failed to fetch bookings' subTitle={error} /> : <Table className='admin-bookings-table' columns={columns} dataSource={rows} loading={loading} rowKey='id' scroll={{ x: 1600 }} pagination={{ current: Number(query.page), total: response?.data?.total_rows || 0, pageSize: Number(query.rows), onChange: (page) => setQuery((state) => ({ ...state, page: String(page) })) }} />}
    {statusModal.open && <RoomStatusUpdateModal statusUpdateModal={statusModal} setStatusUpdateModal={setStatusModal} setFetchAgain={setRefresh} />}
  </div>;
}
export default Orders;
