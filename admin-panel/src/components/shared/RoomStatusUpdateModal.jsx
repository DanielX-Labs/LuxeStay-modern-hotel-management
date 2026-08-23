import { Button, Modal, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';

function RoomStatusUpdateModal({ statusUpdateModal, setStatusUpdateModal, setFetchAgain }) {
  const [roomStatus, setRoomStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const options = {
      pending: [{ value: 'confirmed', label: 'Confirmed' }, { value: 'no_show', label: 'No Show' }],
      confirmed: [{ value: 'checked_in', label: 'Checked In' }, { value: 'no_show', label: 'No Show' }],
      checked_in: [{ value: 'checked_out', label: 'Checked Out' }, { value: 'no_show', label: 'No Show' }]
    };
    setRoomStatus(options[statusUpdateModal?.status] || []);
  }, [statusUpdateModal]);

  // function to handle update room status
  const handleUpdateStatus = () => {
    if (!status) {
      notificationWithIcon('error', 'ERROR', 'Please select a booking status.');
    } else {
      setLoading(true);
      ApiService.put(
        `/api/v1/updated-booking-order/${statusUpdateModal?.roomId}`,
        { booking_status: status }
      )
        .then((res) => {
          setLoading(false);
          if (res?.result_code === 0) {
            notificationWithIcon('success', 'SUCCESS', res?.result?.message || 'Room status update successful');
            setStatusUpdateModal((prevState) => ({ ...prevState, open: false, status: null }));
            setFetchAgain((prevState) => !prevState);
          } else {
            notificationWithIcon('error', 'ERROR', 'Sorry! Something went wrong. App server error');
          }
        })
        .catch((err) => {
          setLoading(false);
          notificationWithIcon('error', 'ERROR', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Sorry! Something went wrong. App server error');
        });
    }
  };

  return (
    <Modal
      title='Update Booking Status'
      open={statusUpdateModal?.open}
      onOk={() => setStatusUpdateModal(
        (prevState) => ({ ...prevState, open: false, status: null })
      )}
      onCancel={() => setStatusUpdateModal(
        (prevState) => ({ ...prevState, open: false, status: null })
      )}
      footer={[
        <Button
          onClick={() => setStatusUpdateModal(
            (prevState) => ({ ...prevState, open: false, status: null })
          )}
          key='back'
        >
          Cancel
        </Button>,
        <Button
          onClick={handleUpdateStatus}
          type='primary'
          key='submit'
          disabled={loading}
          loading={loading}
        >
          Ok
        </Button>
      ]}
    >
      <Select
        className='w-full my-5'
        placeholder='Select booking status'
        optionFilterProp='children'
        options={roomStatus}
        size='large'
        allowClear
        value={status}
        onChange={(value) => setStatus(value)}
      />
    </Modal>
  );
}

export default RoomStatusUpdateModal;
