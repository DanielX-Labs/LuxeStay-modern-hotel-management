import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { getSessionToken, getSessionUser } from '../../utils/authentication';
import UserPopover from './popover';

const LOGO = '/images/svg/luxestay-logo.svg';
function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState({ ready: false, user: null, token: null });
  const router = useRouter();
  useEffect(() => { setSession({ ready: true, user: getSessionUser(), token: getSessionToken() }); }, []);
  useEffect(() => { setOpen(false); }, [router.asPath]);
  const authenticated = session.ready && session.user?.id && session.token;
  const links = [
    { href: '/', label: 'Home' },
    { href: '/rooms', label: 'Rooms' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/help', label: 'Help' }
  ];
  return (
    <header className='ls-nav ls-nav-refined'>
      <div className='ls-nav-inner'>
        <Link href='/' className='ls-logo' aria-label='LuxeStay home'><img src={LOGO} alt='LuxeStay' /></Link>
        <nav id='public-navigation' className={open ? 'ls-nav-links is-open' : 'ls-nav-links'} aria-label='Main navigation'>
          <div className='ls-mobile-nav-label'>Explore LuxeStay</div>
          {links.map((link) => <Link key={link.href} href={link.href} className={router.pathname === link.href ? 'is-active' : ''}>{link.label}</Link>)}
          <div className='ls-mobile-account'>{authenticated ? <UserPopover user={session.user} mobile onNavigate={() => setOpen(false)} /> : <div className='ls-mobile-guest'><p>Access your bookings and account details.</p><Link href='/auth/login'>Sign in</Link><Link href='/auth/registration'>Create account</Link></div>}</div>
        </nav>
        <div className='ls-nav-actions'>
          <div className='ls-desktop-account'>{authenticated ? <UserPopover user={session.user} /> : <div className='ls-guest-actions'><Link href='/auth/login'>Sign in</Link><Link href='/auth/registration'>Join LuxeStay</Link></div>}</div>
          <button type='button' className='ls-nav-toggle' onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls='public-navigation' aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <FaTimes /> : <FaBars />}</button>
        </div>
      </div>
    </header>
  );
}
export default Navbar;