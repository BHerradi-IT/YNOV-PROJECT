import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

function DevisModal({ isOpen, onClose, planName, planPrice }) {
  const { user, token, isAuthenticated, getAuthHeaders } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  // Pré-remplir le formulaire avec les infos de l'utilisateur
  useEffect(() => {
    if (isOpen && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        message: `Bonjour, je suis intéressé par le plan "${planName}". Pouvez-vous me donner plus d'informations ?`
      }));
    }
  }, [isOpen, user, planName]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);

    try {
      // Validation
      if (!formData.name || !formData.email || !formData.message) {
        setError('Veuillez remplir tous les champs obligatoires');
        setLoading(false);
        return;
      }

      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous devez être connecté pour envoyer une demande de devis');
        setLoading(false);
        return;
      }

      // Préparer les données pour l'API
      const payload = {
        serviceId: 1, // Service ID par défaut
        serviceName: planName,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        projectDescription: formData.message,
        budget: 'medium', // Budget par défaut
        timeline: 'medium', // Timeline par défaut
        requirements: JSON.stringify({
          plan: planName,
          price: planPrice,
          message: formData.message
        })
      };

      const response = await fetch('http://localhost:5000/api/quotes/request', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la demande');
      }

      // Simulation d'envoi réussi
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: ''
      });

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError('');
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="devis-modal-overlay" onClick={handleClose}>
      <div className="devis-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="devis-modal-header">
          <h3>📋 Demander un Devis</h3>
          <button className="close-btn" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="devis-plan-info">
          <div className="plan-badge">
            <span className="plan-name">{planName}</span>
            <span className="plan-price">
              {planPrice}€/mois
            </span>
          </div>
          <p>Remplissez ce formulaire pour recevoir votre devis personnalisé</p>
        </div>

        {error && (
          <div className="devis-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="devis-success">
            <span className="success-icon">✅</span>
            <div>
              <strong>Demande envoyée avec succès !</strong>
              <p>Nous vous contacterons dans les 24h.</p>
            </div>
          </div>
        )}

        <form className="devis-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nom complet *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Votre nom"
                required
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
                placeholder="votre@email.com"
                required
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
                value={formData.phone}
                onChange={handleChange}
                placeholder="Votre numéro de téléphone"
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
                placeholder="Nom de votre entreprise (optionnel)"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Décrivez votre projet et vos besoins spécifiques"
              required
              rows={4}
            />
          </div>

          <div className="devis-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Envoyer la demande</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="devis-footer">
          <p><small>🔒 Vos données sont sécurisées et confidentielles</small></p>
        </div>
      </div>
    </div>
  );
}

export default DevisModal;
