import React, { useState } from 'react';
import '../styles/responsive.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const newMessage = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    messages.push(newMessage);
    localStorage.setItem('contactMessages', JSON.stringify(messages));
    
    alert('Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section className="section contact-section" id="contact">
      <div className="contact-container">
        <div className="contact-info">
          <h3>Parlons de votre projet</h3>
          <p>Nous sommes passionnés par la création d'experiences digitales exceptionnelles. Transformez vos idées en réalité avec notre expertise et notre engagement.</p>
          
          <div className="contact-details">
            <div className="contact-detail">
              <div className="contact-detail-icon">📧</div>
              <span>contact@ytech.ma</span>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon">📱</div>
              <span>+212 612-34-56-78</span>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon">📍</div>
              <span>Casablanca, Maroc</span>
            </div>
            <div className="contact-detail">
              <div className="contact-detail-icon">🕐</div>
              <span>Lun-Ven: 9h-18h</span>
            </div>
          </div>
        </div>
        
        <div className="contact-form">
          <h4>Envoyez-nous un message</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom complet</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Votre nom"
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
              />
            </div>
            
            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Parlez-nous de votre projet..."
              ></textarea>
            </div>
            
            <button type="submit" className="contact-submit">
              Envoyer le message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Contact;
