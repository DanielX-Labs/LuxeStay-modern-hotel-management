import { HistoryOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Popover } from 'antd';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import ApiService from '../../utils/apiService';
import { removeSessionAndLogoutUser } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';

function UserPopover({ user, mobile = false, onNavigate = () => {} }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const go = (path) => { onNavigate(); router.push(path); };
  const userLogout = async () => {
    setLoading(true);
    try { await ApiService.post('/api/v1/auth/logout'); }
    catch (error) { notificationWithIcon('error', 'ERROR', error?.response?.data?.result?.error || 'Unable to contact the server. You have been signed out locally.'); }
    finally { removeSessionAndLogoutUser(); }
  };
  const avatar = <Avatar className='ls-account-avatar' src={user?.avatar} icon={!user?.avatar && <UserOutlined />} size={40} />;
  if (mobile) {
    return <div className='ls-mobile-user'><div className='ls-mobile-user-head'>{avatar}<div><strong>{user?.fullName || 'LuxeStay guest'}</strong><span>{user?.email}</span></div></div><button type='button' onClick={() => go('/profile?tab=my-profile')}><UserOutlined /> My profile</button><button type='button' onClick={() => go('/profile?tab=booking-history')}><HistoryOutlined /> My bookings</button><button type='button' onClick={userLogout} disabled={loading}><LogoutOutlined /> {loading ? 'Signing out...' : 'Sign out'}</button></div>;
  }
  const menu = <div className='ls-account-menu'><div className='ls-account-menu-head'>{avatar}<div><strong>{user?.fullName || 'LuxeStay guest'}</strong><span>{user?.email}</span></div></div><button type='button' onClick={() => go('/profile?tab=my-profile')}><UserOutlined /><span><b>My profile</b><small>Personal details and security</small></span></button><button type='button' onClick={() => go('/profile?tab=booking-history')}><HistoryOutlined /><span><b>My bookings</b><small>View your upcoming stays</small></span></button><button className='ls-account-logout' type='button' onClick={userLogout} disabled={loading}><LogoutOutlined /><span><b>{loading ? 'Signing out...' : 'Sign out'}</b><small>End this session securely</small></span></button></div>;
  return <Popover content={menu} trigger='click' placement='bottomRight' overlayClassName='ls-account-popover'><button type='button' className='ls-account-trigger'>{avatar}<span><small>Welcome back</small><b>{user?.fullName?.split(' ')[0] || 'Guest'}</b></span><i aria-hidden='true'>⌄</i></button></Popover>;
}
export default UserPopover;