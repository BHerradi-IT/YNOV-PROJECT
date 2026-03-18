import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Testimonials from '../components/Testimonials';
import Services from '../components/Services';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import Contact from '../components/Contact';
import '../styles/responsive.css';

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleServiceClick = (serviceName) => {
    // Le formulaire de service est géré dans le composant Services
    console.log(`Service demandé: ${serviceName}`);
  };

  const handleContactSubmit = (formData) => {
    // Le formulaire de contact est géré dans le composant Contact
    console.log('Message de contact:', formData);
  };

  return (
    <div className="home">
      <Navbar user={user} />
      <Hero />
      <Testimonials />
      <Services onServiceClick={handleServiceClick} />
      <Pricing />
      <Contact onSubmit={handleContactSubmit} />
      <Footer />
    </div>
  );
}

export default Home;
