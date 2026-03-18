import React from 'react';
import '../styles/responsive.css';

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-background">
        <div className="hero-particles"></div>
        <div className="hero-gradient"></div>
      </div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              L'Intelligence Artificielle 
              <span className="highlight"> au Service de Votre Innovation</span>
            </h1>
            <p className="hero-subtitle">
              Transformez vos idées en réalité digitale avec nos solutions IA sur mesure. 
              Développement web, mobile, et conseil technologique de pointe.
            </p>
            <div className="hero-actions">
              <a href="#pricing" className="btn btn-primary">
                Commencer un Projet
              </a>
              <a href="#services" className="btn btn-secondary">
                Découvrir Nos Services
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
