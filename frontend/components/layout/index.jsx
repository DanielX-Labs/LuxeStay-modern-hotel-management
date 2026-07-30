import Head from 'next/head';
import React from 'react';
import Footers from './footers';
import Navbar from './navbar';

function MainLayout({ children, title }) {
  return (
    <>
      <Head>
        <title>{title || 'LuxeStay'}</title>
        <meta
          name='description'
          content='LuxeStay luxury hotel and room booking'
        />
        <meta
          content='width=device-width, initial-scale=1'
          name='viewport'
        />
        <link rel='icon' href='/images/svg/luxestay-icon.svg' />
      </Head>

      <Navbar />
      <main style={{ overflow: 'auto' }}>
        {children}
      </main>
      <Footers />
    </>
  );
}

export default MainLayout;
