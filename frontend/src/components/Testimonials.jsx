import React from 'react';
import '../styles/responsive.css';

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Sophie Martin',
      company: 'Tech Innovations',
      avatar: '👩‍💼',
      rating: 5,
      comment: 'Une équipe professionnelle et réactive. Notre site web a dépassé nos attentes! Leur expertise technique est remarquable.',
      date: '15 janvier 2024'
    },
    {
      id: 2,
      name: 'Marc Dubois',
      company: 'StartUp Pro',
      avatar: '👨‍💻',
      rating: 5,
      comment: 'Service exceptionnel du début à la fin. Ils ont transformé notre vision en réalité avec créativité et professionnalisme.',
      date: '10 janvier 2024'
    },
    {
      id: 3,
      name: 'Julie Bernard',
      company: 'E-commerce Plus',
      avatar: '👩‍🎨',
      rating: 5,
      comment: 'Excellente collaboration! Notre application mobile est intuitive et performante. Je recommande vivement leurs services.',
      date: '5 janvier 2024'
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ★
      </span>
    ));
  };

  return (
    <section className="section section-light" id="testimonials">
      <div className="container">
        <h2 className="section-title">Ce que nos clients disent</h2>
        <p className="section-subtitle">
          Découvrez les témoignages de nos clients satisfaits
        </p>
        
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  {testimonial.avatar}
                </div>
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.company}</p>
                  <div className="testimonial-rating">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              
              <div className="testimonial-content">
                <p>"{testimonial.comment}"</p>
              </div>
              
              <div className="testimonial-footer">
                <span className="testimonial-date">{testimonial.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
