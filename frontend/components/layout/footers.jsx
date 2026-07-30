import Link from 'next/link';
import React from 'react';
import { FaInstagram, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';

const LOGO = '/images/svg/luxestay-logo-light.svg';
function Footers() {
  return (
    <footer className='ls-footer'>
      <div className='ls-footer-main'>
        <div className='ls-footer-brand'><img src={LOGO} alt='LuxeStay' /><p>Distinctive rooms and thoughtful hospitality, for stays that remain with you.</p><div className='ls-footer-socials'><button aria-label='Instagram' type='button'><FaInstagram /></button><button aria-label='Facebook' type='button'><FaFacebookF /></button><button aria-label='LinkedIn' type='button'><FaLinkedinIn /></button></div></div>
        <div className='ls-footer-links'>
          <div><h3>Explore</h3><Link href='/'>Home</Link><Link href='/rooms'>Rooms</Link><Link href='/about'>About LuxeStay</Link></div>
          <div><h3>Guest care</h3><Link href='/contact'>Contact us</Link><Link href='/help'>Help and FAQ</Link><Link href='/auth/login'>My account</Link></div>
          <div><h3>Stay in the know</h3><p>Occasional notes, new rooms, and considered offers.</p><form onSubmit={(event) => event.preventDefault()}><input type='email' aria-label='Email address' placeholder='Email address' /><button type='submit' aria-label='Subscribe'>&rarr;</button></form></div>
        </div>
      </div>
      <div className='ls-footer-bottom'><span>&copy; {new Date().getFullYear()} LuxeStay</span><span>Luxury, made personal.</span></div>
    </footer>
  );
}
export default Footers;