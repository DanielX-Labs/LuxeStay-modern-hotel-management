import Link from 'next/link';
import React from 'react';

function Hero() {
  return (
    <section className='ls-hero'>
      <div className='ls-hero-overlay' />
      <div className='ls-hero-glow' />
      <div className='ls-hero-content'>
        <span className='ls-hero-kicker'><i /> Distinctive stays, thoughtfully hosted</span>
        <h1>Stay somewhere<br /><em>worth remembering.</em></h1>
        <p>Beautiful rooms, effortless booking, and considered hospitalityâ€”curated for the way you want to travel.</p>
        <div className='ls-hero-actions'><Link href='/rooms' className='ls-btn ls-btn-gold'>Explore rooms <span>â†’</span></Link><Link href='/about' className='ls-btn ls-btn-ghost'>Discover LuxeStay</Link></div>
      </div>
      <div className='ls-hero-note'><span>01</span><div><b>Made for your pace</b><small>Arrive, exhale, feel at home.</small></div></div>
      <a className='ls-scroll-cue' href='#rooms-home' aria-label='Scroll to discover'><span>Scroll</span><i /></a>
    </section>
  );
}
export default Hero;