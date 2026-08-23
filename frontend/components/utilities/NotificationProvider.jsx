import { notification } from 'antd';
import { useEffect } from 'react';
import { setNotificationApi } from '../../utils/notification';

function NotificationProvider({ children }) {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => setNotificationApi(api), [api]);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
}

export default NotificationProvider;
