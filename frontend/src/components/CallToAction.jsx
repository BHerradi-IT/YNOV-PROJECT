import React from 'react';
import '../styles/responsive.css';

function CallToAction() {
  return (
    <section className="cta-section" id="contact">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">Commencez votre projet digital avec nous</h2>
          <p className="cta-subtitle">
            Transformez vos idées en réalité digitale. Contactez-nous dès aujourd'hui pour discuter de votre projet 
            et obtenir une consultation gratuite.
          </p>
          
          <div className="cta-buttons">
            <a href="#contact-form" className="btn btn-large cta-btn">
              Demander un devis
            </a>
            <a href="#services" className="btn btn-secondary btn-large cta-btn">
              Découvrir nos services
            </a>
          </div>
          
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Consultation gratuite • Devis sous 24h • Satisfaction garantie
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CallToAction;
