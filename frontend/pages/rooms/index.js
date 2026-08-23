import { Empty, Result, Skeleton } from 'antd';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/layout';
import RoomFilter from '../../components/rooms/RoomsFilter';
import RoomList from '../../components/rooms/RoomsList';
import useLiveRoomData, { fetchRoomData } from '../../hooks/useLiveRoomData';
function Rooms({ rooms: initialRooms, error: initialError }) {
  const [stay, setStay] = useState({ checkIn: '', checkOut: '' });
  const availabilityQuery = stay.checkIn && stay.checkOut ? `?check_in=${stay.checkIn}&check_out=${stay.checkOut}` : '';
  const { data: rooms, error: refreshError } = useLiveRoomData(initialRooms, `/api/v1/all-rooms-list${availabilityQuery}`);
  const error = rooms ? null : refreshError || initialError;
  const [allRooms, setAllRooms] = useState([]); const [filteredRooms, setFilteredRooms] = useState([]);
  useEffect(() => { const rows = rooms?.data?.rows || []; setAllRooms(rows); setFilteredRooms(rows); }, [rooms]);
  return <MainLayout title='Rooms - LuxeStay'><main className='ls-rooms-page'>
    <section className='ls-rooms-hero'><div className='ls-rooms-hero-shade' /><div className='ls-rooms-hero-content'><span className='ls-eyebrow ls-eyebrow-light'>The LuxeStay collection</span><h1>Find your kind<br />of <em>comfortable.</em></h1><p>Thoughtfully designed rooms for quiet mornings, productive afternoons, and unhurried nights.</p><div className='ls-rooms-hero-meta'><span><b>{rooms?.data?.total_rows || 0}</b> curated rooms</span><i /><span>Flexible stays</span><i /><span>Secure booking</span></div></div><a href='#room-collection' className='ls-rooms-scroll'>Explore the collection <span>&darr;</span></a></section>
    <section id='room-collection' className='ls-room-collection'><div className='ls-collection-heading'><div><span className='ls-eyebrow'>Choose your stay</span><h2>Rooms made for living well</h2></div><p>Use the filters to find a room that fits your pace, preferences, and plans.</p></div>
      <Skeleton loading={!rooms && !error} paragraph={{ rows: 10 }} active>{rooms?.data?.rows?.length === 0 ? <Empty description='No rooms are available for those dates.' /> : error ? <Result title='Rooms are temporarily unavailable' subTitle={error?.message || 'Please try again shortly.'} status='error' extra={<Link href='/' className='ls-inline-button'>Return home</Link>} /> : <><RoomFilter ourRooms={allRooms} setOurFilteredRooms={setFilteredRooms} resultCount={filteredRooms.length} stay={stay} setStay={setStay} /><RoomList rooms={filteredRooms} /></>}</Skeleton>
    </section>
  </main></MainLayout>;
}
export async function getServerSideProps({ res }){res.setHeader('Cache-Control','no-store');try{return{props:{rooms:await fetchRoomData('/api/v1/all-rooms-list'),error:null}}}catch(err){return{props:{rooms:null,error:{message:err?.response?.data?.result?.error||err?.message||'Unable to fetch rooms'}}}}}
export default Rooms;
