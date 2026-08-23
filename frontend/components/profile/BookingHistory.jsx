import { CalendarOutlined, ExclamationCircleOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Modal, Result, Select, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import useFetchData from '../../hooks/useFetchData';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';
import { bookingStatusAsResponse } from '../../utils/responseAsStatus';

const reasons = ['Change of plans', 'Wrong booking date', 'Duplicate booking', 'Personal reasons', 'Other'];
function BookingHistory() {
  const [refresh, setRefresh] = useState(false); const [page, setPage] = useState(1);
  const [cancel, setCancel] = useState({ open: false, id: null, reason: '' });
  const [loading, error, response] = useFetchData(`/api/v1/get-user-booking-orders?limit=10&page=${page}&sort=desc`, refresh);
  const openInvoice = async (record, print = false) => {
    const win = window.open('', '_blank');
    if (!win) { notificationWithIcon('error', 'PDF VIEWER BLOCKED', 'Allow pop-ups for this site, then try again.'); return; }
    try {
      win.document.title = 'Loading invoice...';
      const pdf = await ApiService.get(`/api/v1/booking/${record.id}/invoice?format=pdf`, { responseType: 'blob' });
      const blob = pdf instanceof Blob && pdf.type === 'application/pdf' ? pdf : new Blob([pdf], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      win.location.replace(url);
      if (print) win.addEventListener('load', () => win.print());
      setTimeout(() => URL.revokeObjectURL(url), 300000);
      notificationWithIcon('success', print ? 'INVOICE READY TO PRINT' : 'PDF VIEWER OPENED', print ? `${record.booking_id} is ready to print.` : 'Use the Adobe or browser PDF toolbar to download or print the invoice.');
    } catch (err) {
      win.close();
      notificationWithIcon('error', 'INVOICE UNAVAILABLE', err?.response?.data?.result?.error || 'Invoice is unavailable.');
    }
  };
  const submitCancellation = async () => {
    if (!cancel.reason.trim()) return notificationWithIcon('error', 'ERROR', 'Select or enter a cancellation reason.');
    try { const result = await ApiService.put(`/api/v1/cancel-booking-order/${cancel.id}`, { cancellation_reason: cancel.reason }); notificationWithIcon('success', 'SUCCESS', result?.result?.message); setCancel({ open: false, id: null, reason: '' }); setRefresh((value) => !value); } catch (err) { notificationWithIcon('error', 'ERROR', err?.response?.data?.result?.error || 'Unable to cancel booking.'); }
    return undefined;
  };
  const columns = [
    { title: 'Booking ID', dataIndex: 'booking_id', render: (value) => <span className='ls-booking-id'>{value}</span> },
    { title: 'Hotel / Room', dataIndex: 'room', render: (room) => <><strong>LuxeStay Hotel</strong><br />{room?.room_name} ({room?.room_type})</> },
    { title: 'Stay', render: (_, row) => <>{dayjs(row.check_in).format('DD MMM YYYY')} → {dayjs(row.check_out).format('DD MMM YYYY')}<br />{row.number_of_nights} night(s)</> },
    { title: 'Total', dataIndex: 'total_amount', render: (value) => `NGN ${Number(value || 0).toLocaleString()}` },
    { title: 'Booking', dataIndex: 'booking_status', render: (value) => <Tag color={bookingStatusAsResponse(value).color}>{bookingStatusAsResponse(value).level}</Tag> },
    { title: 'Payment', dataIndex: 'payment_status', render: (value) => <Tag color={value === 'paid' ? 'green' : 'gold'}>{value === 'paid' ? 'PAID' : 'PAYMENT PENDING'}</Tag> },
    { title: 'Invoice / Actions', render: (_, row) => <Space wrap>
      <Button icon={<FilePdfOutlined />} disabled={!row.invoice_available} onClick={() => openInvoice(row)}>Open Invoice PDF</Button>
      <Button disabled={!row.invoice_available} onClick={() => openInvoice(row, true)}>Print</Button>
      {['pending', 'confirmed'].includes(row.booking_status) && <Button danger onClick={() => setCancel({ open: true, id: row.id, reason: '' })}>Cancel Booking</Button>}
    </Space> }
  ];
  if (error) return <Result status='error' title='Failed to fetch bookings' subTitle={error} />;
  return <div className='ls-bookings-dashboard'>
    <div className='ls-bookings-heading'><div><span className='ls-eyebrow'>Your stays</span><h2>Booking history</h2><p>Manage upcoming reservations and keep every invoice close at hand.</p></div><div className='ls-booking-count'><CalendarOutlined /><span><b>{response?.data?.total_rows || 0}</b> reservations</span></div></div>
    <Table className='ls-bookings-table' columns={columns} dataSource={response?.data?.rows} loading={loading} rowKey='id' scroll={{ x: 1100 }} locale={{ emptyText: <Empty description='You have no bookings yet' /> }} pagination={{ current: page, total: response?.data?.total_rows || 0, pageSize: 10, onChange: setPage }} />
    <Modal className='ls-cancel-modal' title='Cancel this reservation?' open={cancel.open} okText='Cancel Reservation' okButtonProps={{ danger: true }} onOk={submitCancellation} onCancel={() => setCancel({ open: false, id: null, reason: '' })}>
      <div className='ls-cancel-warning'><ExclamationCircleOutlined /><p>Are you sure you want to cancel this booking? The room will become available for other guests.</p></div>
      <Select className='w-full mb-3' placeholder='Select a reason' options={reasons.map((reason) => ({ label: reason, value: reason }))} onChange={(reason) => setCancel((state) => ({ ...state, reason }))} />
      <Input.TextArea value={cancel.reason} onChange={(event) => setCancel((state) => ({ ...state, reason: event.target.value }))} placeholder='Cancellation reason' maxLength={500} />
    </Modal>
  </div>;
}
export default BookingHistory;
