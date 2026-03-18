import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/responsive.css';

function Navbar({ user }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            YTECH
          </Link>
          
          <ul className="nav-links">
            <li><a href="#home">Accueil</a></li>
            <li><a href="#testimonials">Témoignages</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#pricing">Tarifs</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          
          <div className="nav-actions">
            {user ? (
              <>
                <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </button>
                <button className="btn btn-danger" onClick={handleLogout}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => navigate('/login')}>
                  Connexion
                </button>
                <button className="btn btn-primary" onClick={() => navigate('/login?mode=register')}>
                  S'inscrire
                </button>
              </>
            )}
          </div>
          
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul>
            <li><a href="#home">Accueil</a></li>
            <li><a href="#testimonials">Témoignages</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#pricing">Tarifs</a></li>
            <li><a href="#contact">Contact</a></li>
            {user ? (
              <>
                <li><button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button></li>
                <li><button className="btn btn-danger" onClick={handleLogout}>Déconnexion</button></li>
              </>
            ) : (
              <>
                <li><button className="btn btn-secondary" onClick={() => navigate('/login')}>Connexion</button></li>
                <li><button className="btn btn-primary" onClick={() => navigate('/login?mode=register')}>S'inscrire</button></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
