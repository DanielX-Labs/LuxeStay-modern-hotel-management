import { Empty, Result, Skeleton } from 'antd';
import Link from 'next/link';
import React from 'react';
import FeaturedRooms from '../components/home/FeaturedRooms';
import Hero from '../components/home/Hero';
import Services from '../components/home/Services';
import ResortTestimonials from '../components/home/ResortTestimonials';
import MainLayout from '../components/layout';
import useLiveRoomData, { fetchRoomData } from '../hooks/useLiveRoomData';

function Home({ featuredRooms: initialRooms, error: initialError }) {
  const { data: featuredRooms, error: refreshError } = useLiveRoomData(initialRooms, '/api/v1/featured-rooms-list');
  const error = featuredRooms ? null : refreshError || initialError;
  return (
    <MainLayout title='LuxeStay - Luxury, made personal'>
      <div className='ls-home'>
        <Hero />
        <section className='ls-trust-strip' aria-label='LuxeStay highlights'>
          <div><strong>24/7</strong><span>Guest care</span></div>
          <div><strong>Curated</strong><span>Luxury rooms</span></div>
          <div><strong>Secure</strong><span>Simple booking</span></div>
          <div><strong>Flexible</strong><span>Stay your way</span></div>
        </section>
        <Services />
        <section className='ls-rooms-shell' id='rooms-home'>
          <div className='ls-section-head'>
            <div><span className='ls-eyebrow'>Stay beautifully</span><h2>Rooms with a sense of place</h2></div>
            <Link href='/rooms' className='ls-text-link'>Explore every room <span aria-hidden='true'>&rarr;</span></Link>
          </div>
          <Skeleton loading={!featuredRooms && !error} paragraph={{ rows: 7 }} active>
            {featuredRooms?.data?.rows?.length === 0 ? <Empty description='New rooms are coming soon.' /> : error ? <Result title='Rooms are temporarily unavailable' subTitle={error.message} status='error' /> : <FeaturedRooms featuredRoom={featuredRooms?.data?.rows} />}
          </Skeleton>
        </section>
        <section className='ls-story'>
          <div className='ls-story-image'><img src='/images/jpeg/luxestay-hotel-lobby.jpg' alt='A peaceful LuxeStay interior' loading='lazy' /><span className='ls-story-badge'>Thoughtful by design</span></div>
          <div className='ls-story-copy'><span className='ls-eyebrow'>The LuxeStay feeling</span><h2>Space to slow down. Service that stays one step ahead.</h2><p>Every detail is selected to make arrival effortless and every moment feel considered, from calm interiors to personal guest care.</p><div className='ls-story-points'><span>&#10003; Handpicked spaces</span><span>&#10003; Clear, secure booking</span><span>&#10003; Human support, always</span></div><Link href='/rooms' className='ls-btn ls-btn-dark'>Find your room <span>&rarr;</span></Link></div>
        </section>
        <ResortTestimonials />
        <section className='ls-final-cta'><div><span className='ls-eyebrow ls-eyebrow-light'>Your next stay</span><h2>Ready for somewhere exceptional?</h2><p>Choose a room that feels right, then let LuxeStay handle the rest.</p></div><Link href='/rooms' className='ls-btn ls-btn-gold'>Explore rooms <span>&rarr;</span></Link></section>
      </div>
    </MainLayout>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    return { props: { featuredRooms: await fetchRoomData('/api/v1/featured-rooms-list'), error: null } };
  } catch (err) {
    return { props: { featuredRooms: null, error: { message: err?.response?.data?.result?.error || err?.message || 'Failed to fetch featured rooms' } } };
  }
}
export default Home;
