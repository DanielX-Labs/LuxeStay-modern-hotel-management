import React from 'react';

const reviews = [
  { quote: 'Everything felt calm, intentional, and genuinely welcoming. The kind of stay you keep thinking about after you leave.', name: 'Olivia Bennett', location: 'New York' },
  { quote: 'The room was beautiful, but the thoughtful service made it exceptional. Booking was clear and arrival was completely effortless.', name: 'Michael Carter', location: 'London' },
  { quote: 'LuxeStay gets the balance right: polished without feeling formal, luxurious without losing warmth.', name: 'Sophia Martinez', location: 'Madrid' }
];
function ResortTestimonials() {
  return <section className='ls-reviews'><div className='ls-section-head ls-section-head-light'><div><span className='ls-eyebrow ls-eyebrow-light'>Guest notes</span><h2>Loved in the details</h2></div><p>Real moments from guests who found their kind of stay.</p></div><div className='ls-review-grid'>{reviews.map((review, index) => <article className='ls-review-card' key={review.name}><div className='ls-stars' aria-label='5 out of 5 stars'>★★★★★</div><blockquote>“{review.quote}”</blockquote><div className='ls-review-person'><span>{review.name.split(' ').map((part) => part[0]).join('')}</span><div><b>{review.name}</b><small>{review.location}</small></div></div><i>0{index + 1}</i></article>)}</div></section>;
}
export default ResortTestimonials;