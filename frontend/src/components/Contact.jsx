import React, { useState } from 'react';
import '../styles/responsive.css';

function Contact({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');
    
    try {
      // API call réelle vers MariaDB
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }
      
      setSubmitStatus('success');
      if (onSubmit) {
        onSubmit(formData);
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
      });
      
      setTimeout(() => setSubmitStatus(''), 3000);
    } catch (error) {
      console.error('Erreur contact:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: ''
    });
    setSubmitStatus('');
  };

  return (
    <section className="section contact-section" id="contact">
      <div className="container">
        <h2 className="section-title">Contactez-nous</h2>
        <p className="section-subtitle">
          Nous sommes passionnés par la création d'expériences digitales exceptionnelles. 
          N'hésitez pas à nous contacter pour discuter de vos besoins et projets.
        </p>
        
        <div className="contact-layout">
          <div className="contact-form-container">
            <h3>Envoyez-nous un message</h3>
            
            {submitStatus === 'success' && (
              <div className="contact-success">
                ✅ Message envoyé avec succès! Nous vous répondrons dans les plus brefs délais.
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="contact-error">
                ❌ Une erreur est survenue. Veuillez réessayer plus tard.
              </div>
            )}
            
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nom complet *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Téléphone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+212 6XX XXX XXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company">Entreprise</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    placeholder="Nom de votre entreprise"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Sujet</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Sujet de votre message"
                  value={formData.subject}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  placeholder="Votre message..."
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="contact-btn btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="contact-info-compact">
            <div className="contact-info-header">
              <h3>Informations</h3>
              <div className="contact-info-subtitle">Contact rapide</div>
            </div>
            
            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon">📍</div>
                <div className="contact-info-content">
                  <h4>Adresse</h4>
                  <p>123 Avenue Mohammed V, Casablanca, Maroc</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="contact-info-icon">📞</div>
                <div className="contact-info-content">
                  <h4>Téléphone</h4>
                  <p>+212 5XX XXX XXX</p>
                  <p>+212 6XX XXX XXX</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="contact-info-icon">✉️</div>
                <div className="contact-info-content">
                  <h4>Email</h4>
                  <p>contact@ytech.ma</p>
                  <p>support@ytech.ma</p>
                </div>
              </div>
              
              <div className="contact-info-item">
                <div className="contact-info-icon">🕐</div>
                <div className="contact-info-content">
                  <h4>Heures d'ouverture</h4>
                  <p>Lun - Ven: 9:00 - 18:00</p>
                  <p>Sam: 9:00 - 13:00</p>
                </div>
              </div>
            </div>
            
            <div className="contact-social">
              <h4>Suivez-nous</h4>
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
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
