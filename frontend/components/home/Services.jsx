import React from 'react';
import { FaConciergeBell, FaRegGem, FaRegMoon } from 'react-icons/fa';

const items = [
  { number: '01', icon: <FaRegGem />, title: 'Curated comfort', info: 'Well-composed rooms, premium essentials, and calm details that make every stay feel effortless.' },
  { number: '02', icon: <FaConciergeBell />, title: 'Personal service', info: 'Responsive guest care with thoughtful support before arrival, throughout your stay, and after checkout.' },
  { number: '03', icon: <FaRegMoon />, title: 'Rest, redefined', info: 'Quiet spaces, exceptional beds, and the freedom to experience each destination at your own rhythm.' }
];
function Services() {
  return <section className='ls-experience'><div className='ls-section-head'><div><span className='ls-eyebrow'>Why LuxeStay</span><h2>Luxury that feels natural</h2></div><p>Less formality. More thoughtfulness. Everything you need, beautifully considered.</p></div><div className='ls-service-grid'>{items.map((item) => <article className='ls-service-card' key={item.number}><div className='ls-service-top'><span>{item.icon}</span><small>{item.number}</small></div><h3>{item.title}</h3><p>{item.info}</p><i /></article>)}</div></section>;
}
export default Services;