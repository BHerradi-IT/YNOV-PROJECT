import React, { useState } from 'react';
import './QuoteModal.css';

function QuoteModal({ isOpen, onClose, service, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectDescription: '',
    budget: '',
    timeline: '',
    requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/quotes/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Demande de devis envoyée avec succès ! Nous vous contacterons sous 24h.');
        onSubmit(data);
        onClose();
      } else {
        setError(data.error || 'Erreur lors de l\'envoi du devis');
      }
    } catch (error) {
      console.error('Erreur devis:', error);
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="quote-modal-overlay" onClick={onClose}>
      <div className="quote-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="quote-modal-close" onClick={onClose}>
          ×
        </button>
        
        <div className="quote-modal-header">
          <h2>Demande de Devis</h2>
          <p>Service: <strong>{service.name}</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="quote-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nom complet *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Votre nom et prénom"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Téléphone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+212 6 12 34 56 78"
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Entreprise</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Nom de votre entreprise"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="projectDescription">Description du projet *</label>
            <textarea
              id="projectDescription"
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Décrivez votre projet en détail..."
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">Budget estimé</label>
              <select id="budget" name="budget" value={formData.budget} onChange={handleChange}>
                <option value="">Sélectionnez une fourchette</option>
                <option value="5k-10k">5,000 - 10,000 DH</option>
                <option value="10k-25k">10,000 - 25,000 DH</option>
                <option value="25k-50k">25,000 - 50,000 DH</option>
                <option value="50k+">Plus de 50,000 DH</option>
                <option value="discuss">À discuter</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timeline">Délai souhaité</label>
              <select id="timeline" name="timeline" value={formData.timeline} onChange={handleChange}>
                <option value="">Sélectionnez un délai</option>
                <option value="urgent">Urgent (&lt; 1 mois)</option>
                <option value="1-3months">1-3 mois</option>
                <option value="3-6months">3-6 mois</option>
                <option value="6months+">Plus de 6 mois</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements spécifiques</label>
            <textarea
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="3"
              placeholder="Fonctionnalités spécifiques, intégrations, etc..."
            ></textarea>
          </div>

          <button type="submit" className="quote-submit-btn" disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Envoyer la demande de devis'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QuoteModal;
