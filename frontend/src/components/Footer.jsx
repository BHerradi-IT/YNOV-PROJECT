import React from 'react';
import '../styles/responsive.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>YTECH</h4>
            <p>
              Transformons vos idées en réalité digitale avec des solutions web et mobiles innovantes.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <span>f</span>
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <span>t</span>
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <span>in</span>
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <span>ig</span>
              </a>
            </div>
          </div>
          
          <div className="footer-section">
            <h4>Services</h4>
            <ul className="footer-links">
              <li>
                <a href="#services" onClick={() => scrollToSection('services')}>
                  Développement Web
                </a>
              </li>
              <li>
                <a href="#services" onClick={() => scrollToSection('services')}>
                  Applications Mobile
                </a>
              </li>
              <li>
                <a href="#services" onClick={() => scrollToSection('services')}>
                  E-Commerce
                </a>
              </li>
              <li>
                <a href="#services" onClick={() => scrollToSection('services')}>
                  Design UI/UX
                </a>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Entreprise</h4>
            <ul className="footer-links">
              <li>
                <a href="#about">À Propos</a>
              </li>
              <li>
                <a href="#contact" onClick={() => scrollToSection('contact')}>
                  Contact
                </a>
              </li>
              <li>
                <a href="#careers">Carrières</a>
              </li>
              <li>
                <a href="#blog">Blog</a>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Légal</h4>
            <ul className="footer-links">
              <li>
                <a href="#privacy">Politique de confidentialité</a>
              </li>
              <li>
                <a href="#terms">Conditions générales</a>
              </li>
              <li>
                <a href="#cookies">Politique de cookies</a>
              </li>
              <li>
                <a href="#gdpr">RGPD</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} YTECH. Tous droits réservés.
            </p>
            <p className="footer-made">
              Fait avec ❤️ au Maroc
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
