import { Button } from 'antd';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useMemo, useState } from 'react';
import { FaBed, FaCheck, FaPaw, FaRulerCombined, FaShieldAlt, FaUserFriends, FaUtensils } from 'react-icons/fa';
import MainLayout from '../../components/layout';
import Loading from '../../components/shared/Loading';
import OrderPlaceModal from '../../components/utilities/OrderPlaceModal';
import RoomReviewList from '../../components/utilities/RoomReviewList';
import { getSessionToken, getSessionUser } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';
const API_URL=process.env.NEXT_PUBLIC_API_URL; const money=new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0});
function RoomPreview({room,error}) {
  const data=room?.data; const images=data?.room_images||[]; const [activeImage,setActiveImage]=useState(0); const [bookingModal,setBookingModal]=useState({open:false,roomId:null}); const router=useRouter(); const facilities=useMemo(()=>data?.extra_facilities||[],[data]);
  const handleOrder=()=>{const token=getSessionToken();const user=getSessionUser();if(!token||!user){notificationWithIcon('error','SIGN IN REQUIRED','Sign in or create an account to reserve this room.');router.push('/auth/login');return}setBookingModal({open:true,roomId:data?.id})};
  if(!room&&!error)return <MainLayout title='Room - LuxeStay'><Loading/></MainLayout>;
  if(error)return <MainLayout title='Room unavailable - LuxeStay'><div className='ls-room-error'><span>404</span><h1>This room could not be found.</h1><Link href='/rooms'>Return to all rooms</Link></div></MainLayout>;
  return <><MainLayout title={`${data?.room_name} - LuxeStay`}><main className='ls-detail-page'>
    <header className='ls-detail-header'><div><Link href='/rooms'>&larr; All rooms</Link><span className='ls-eyebrow'>{data?.room_type} room</span><h1>{data?.room_name}</h1></div><div className='ls-detail-price'><span>From</span><b>{money.format(data?.room_price||0)}</b><small>per night</small></div></header>
    <section className='ls-detail-gallery'><div className='ls-gallery-main'><img src={images[activeImage]?.url||'/images/jpeg/room-1.jpeg'} alt={`${data?.room_name} view ${activeImage+1}`}/><div className='ls-gallery-shade'/><span>{String(activeImage+1).padStart(2,'0')} / {String(images.length||1).padStart(2,'0')}</span></div>{images.length>1&&<div className='ls-gallery-thumbs'>{images.slice(0,5).map((image,index)=><button type='button' className={index===activeImage?'is-active':''} key={image.url} onClick={()=>setActiveImage(index)}><img src={image.url} alt={`Select view ${index+1}`}/></button>)}</div>}</section>
    <section className='ls-detail-layout'><div className='ls-detail-main'><div className='ls-detail-intro'><span className={`ls-detail-status is-${data?.room_status}`}>{data?.room_status}</span><h2>A room designed around your comfort.</h2><p>{data?.room_description}</p></div><div className='ls-detail-facts'><div><FaUserFriends/><span><b>{data?.room_capacity}</b> guests</span></div><div><FaRulerCombined/><span><b>{data?.room_size}</b> square feet</span></div><div><FaBed/><span><b>{data?.room_type}</b> room</span></div><div><FaShieldAlt/><span><b>Secure</b> booking</span></div></div><div className='ls-amenities-section'><span className='ls-eyebrow'>Room comforts</span><h2>Everything you need, considered.</h2><div className='ls-detail-amenities'>{facilities.map((facility)=><span key={facility}><FaCheck/>{facility}</span>)}<span className={data?.provide_breakfast?'':'is-muted'}><FaUtensils/>{data?.provide_breakfast?'Breakfast included':'Breakfast not included'}</span><span className={data?.allow_pets?'':'is-muted'}><FaPaw/>{data?.allow_pets?'Pet friendly':'No pets'}</span></div></div></div>
      <aside className='ls-booking-card'><span className='ls-eyebrow'>Reserve your stay</span><div className='ls-booking-price'><b>{money.format(data?.room_price||0)}</b><span>per night</span></div><p>Select up to five nights when you continue. Your reservation remains pending until confirmed.</p><ul><li><FaCheck/> Secure account booking</li><li><FaCheck/> Dates confirmed before payment</li><li><FaCheck/> Booking history in your profile</li></ul><Button className='ls-detail-book' onClick={handleOrder} disabled={data?.room_status!=='available'}>{data?.room_status==='available'?'Choose your dates':'Currently unavailable'} <span>&rarr;</span></Button><small>No charge is made at this step.</small></aside>
    </section><section className='ls-detail-reviews'>{data?.id&&<RoomReviewList roomId={data.id}/>}</section>
  </main></MainLayout>{bookingModal.open&&<OrderPlaceModal bookingModal={bookingModal} setBookingModal={setBookingModal}/>}</>;
}
export async function getServerSideProps(ctx){try{const response=await axios.get(`${API_URL}/api/v1/get-room-by-id-or-slug-name/${ctx.query.slug}`);return{props:{room:response?.data?.result,error:null}}}catch(err){return{props:{room:null,error:{message:err?.response?.data?.result?.error||err?.message||'Room not found'}}}}}
export default RoomPreview;