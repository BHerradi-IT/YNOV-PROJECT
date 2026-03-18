import React from 'react';
import '../styles/responsive.css';

function FooterSaaS() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Services</h4>
            <ul className="footer-links">
              <li><a href="#services">Développement Web</a></li>
              <li><a href="#services">Applications Mobile</a></li>
              <li><a href="#services">E-Commerce</a></li>
              <li><a href="#services">Design UI/UX</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Solutions</h4>
            <ul className="footer-links">
              <li><a href="#use-cases">Entreprises</a></li>
              <li><a href="#use-cases">E-Commerce</a></li>
              <li><a href="#use-cases">Startups</a></li>
              <li><a href="#use-cases">Professionnels</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>YTECH</h4>
            <ul className="footer-links">
              <li><a href="#about">À Propos</a></li>
              <li><a href="#how-it-works">Notre Méthode</a></li>
              <li><a href="#technologies">Technologies</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Légal</h4>
            <ul className="footer-links">
              <li><a href="#privacy">Politique de Confidentialité</a></li>
              <li><a href="#terms">Conditions Générales</a></li>
              <li><a href="#cookies">Cookies</a></li>
              <li><a href="#license">Licence</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 YTECH - Solutions Digitales. Tous droits réservés.</p>
          <p>Fait avec ❤️ au Maroc pour des entreprises qui innovent</p>
        </div>
      </div>
    </footer>
  );
}

export default FooterSaaS;
