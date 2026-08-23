import { CalendarOutlined, ExclamationCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { Button, DatePicker, Descriptions, Modal } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';

const { RangePicker } = DatePicker;
const { confirm } = Modal;

function OrderPlaceModal({ bookingModal, setBookingModal }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const placeBooking = async () => {
    if (selectedDates.length !== 2) return notificationWithIcon('error', 'ERROR', 'Select check-in and check-out dates.');
    confirm({
      title: 'Confirm reservation?', icon: <ExclamationCircleOutlined />,
      content: 'Payment will be made at the hotel upon arrival.', okText: 'Confirm booking',
      async onOk() {
        setLoading(true);
        try {
          const response = await ApiService.post(`/api/v1/placed-booking-order/${bookingModal.roomId}`, {
            check_in: selectedDates[0].format('YYYY-MM-DD'), check_out: selectedDates[1].format('YYYY-MM-DD')
          });
          const booking = response?.result?.data;
          setBookingModal({ open: false, roomId: null }); setSelectedDates([]);
          Modal.success({
            width: 620, title: 'Your reservation has been confirmed',
            content: (
              <><Descriptions column={1} size='small' bordered>
                <Descriptions.Item label='Booking ID'>{booking?.booking_id}</Descriptions.Item>
                <Descriptions.Item label='Hotel'>LuxeStay Hotel</Descriptions.Item>
                <Descriptions.Item label='Room'>{booking?.room?.room_name}</Descriptions.Item>
                <Descriptions.Item label='Check-in'>{dayjs(booking?.check_in).format('DD MMM YYYY')}</Descriptions.Item>
                <Descriptions.Item label='Check-out'>{dayjs(booking?.check_out).format('DD MMM YYYY')}</Descriptions.Item>
                <Descriptions.Item label='Nights'>{booking?.number_of_nights}</Descriptions.Item>
                <Descriptions.Item label='Total'>NGN {Number(booking?.total_amount || 0).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label='Booking status'>Confirmed</Descriptions.Item>
                <Descriptions.Item label='Payment status'>Payment Pending — Pay at Hotel</Descriptions.Item>
              </Descriptions><p className='mt-4'>Your reservation has been confirmed. Payment will be made at the hotel upon arrival.</p></>
            ), onOk: () => router.push('/profile?tab=booking-history')
          });
        } catch (error) { notificationWithIcon('error', 'ERROR', error?.response?.data?.result?.error || error.message); } finally { setLoading(false); }
        return undefined;
      }
    });
    return undefined;
  };

  return (
    <Modal className='ls-booking-modal' title='Reserve your stay' open={bookingModal.open} centered footer={[
      <Button key='cancel' onClick={() => setBookingModal({ open: false, roomId: null })}>Cancel</Button>,
      <Button key='book' type='primary' loading={loading} onClick={placeBooking}>Book Room</Button>
    ]} onCancel={() => setBookingModal({ open: false, roomId: null })}>
      <div className='ls-booking-modal-intro'><span><CalendarOutlined /></span><div><strong>Select your arrival and departure</strong><p>Your room is checked again before the reservation is confirmed.</p></div></div>
      <RangePicker className='ls-stay-range' size='large' value={selectedDates} onChange={(dates) => setSelectedDates(dates || [])} disabledDate={(date) => date && date < dayjs().startOf('day')} />
      <div className='ls-pay-at-hotel'><SafetyCertificateOutlined /><div><strong>Pay at Hotel</strong><p>No online payment is required. Pay securely when you arrive.</p></div></div>
    </Modal>
  );
}
OrderPlaceModal.defaultProps = { bookingModal: { open: false, roomId: null } };
OrderPlaceModal.propTypes = { bookingModal: PropTypes.object, setBookingModal: PropTypes.func.isRequired };
export default OrderPlaceModal;
