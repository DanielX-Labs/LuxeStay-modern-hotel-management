import Link from 'next/link';
import React from 'react';

const money = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

function FeaturedRooms({ featuredRoom = [] }) {
  return (
    <div className='ls-room-grid'>
      {featuredRoom.slice(0, 3).map((room, index) => (
        <article className='ls-room-card' key={room.id || room.room_slug}>
          <Link href={`/rooms/${room.room_slug}`} className='ls-room-image'>
            <img src={room?.room_images?.[0]?.url || '/images/jpeg/room-1.jpeg'} alt={room.room_name} loading='lazy' />
            <span className='ls-room-index'>0{index + 1}</span>
            <span className='ls-room-type'>{room.room_type}</span>
            <div className='ls-room-shade' />
          </Link>
          <div className='ls-room-info'>
            <div>
              <h3>{room.room_name}</h3>
              <p>{room.room_description?.slice(0, 105) || 'A beautifully appointed room designed for restorative, memorable stays.'}</p>
            </div>
            <div className='ls-room-meta'>
              <span><b>{money.format(room.room_price || 0)}</b><small> / night</small></span>
              <Link href={`/rooms/${room.room_slug}`} aria-label={`View ${room.room_name}`}>&rarr;</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default FeaturedRooms;
