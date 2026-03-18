import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/responsive.css';

function DevisPage() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    plan: '',
    planName: '',
    planPrice: '',
    planPeriod: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    projectDescription: '',
    budget: '',
    timeline: '',
    requirements: '',
    additionalInfo: ''
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUser(user);
      // Pré-remplir avec les infos de l'utilisateur
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    } else {
      // Rediriger vers la page de connexion si non connecté
      window.location.href = '/login';
    }

    // Récupérer les paramètres de l'URL
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    const name = params.get('name');
    const price = params.get('price');
    const period = params.get('period');

    if (plan && name && price && period) {
      setFormData(prev => ({
        ...prev,
        plan: plan,
        planName: name,
        planPrice: price,
        planPeriod: period
      }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Créer la demande de devis
    const devisRequest = {
      id: Date.now(),
      userId: user.id,
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      type: 'devis'
    };

    // Sauvegarder dans localStorage
    const existingRequests = JSON.parse(localStorage.getItem('devisRequests') || '[]');
    existingRequests.push(devisRequest);
    localStorage.setItem('devisRequests', JSON.stringify(existingRequests));

    // Créer aussi une demande de service pour le suivi
    const serviceRequest = {
      service: formData.planName,
      userId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      progress: 0,
      projectDescription: formData.projectDescription,
      budget: formData.budget,
      timeline: formData.timeline,
      type: 'devis'
    };

    const serviceRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    serviceRequests.push(serviceRequest);
    localStorage.setItem('serviceRequests', JSON.stringify(serviceRequests));

    alert('Demande de devis envoyée avec succès! Nous vous contacterons dans les plus brefs délais.');
    
    // Rediriger vers le dashboard
    window.location.href = '/dashboard';
  };

  if (!user) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="devis-page">
      <div className="devis-header">
        <div className="container">
          <h1>Demande de Devis</h1>
          <p>Remplissez le formulaire ci-dessous pour recevoir votre devis personnalisé</p>
        </div>
      </div>

      <div className="devis-content">
        <div className="container">
          <div className="devis-layout">
            {/* Plan Selection */}
            <div className="plan-summary">
              <h2>Plan Sélectionné</h2>
              {formData.planName ? (
                <div className="selected-plan">
                  <h3>{formData.planName}</h3>
                  <div className="plan-price">
                    <span className="price">{formData.planPrice}</span>
                    <span className="period">{formData.planPeriod}</span>
                  </div>
                  <p>Ce plan sera la base de votre devis personnalisé</p>
                </div>
              ) : (
                <div className="no-plan">
                  <p>Aucun plan sélectionné</p>
                  <a href="/#pricing">Retourner aux tarifs</a>
                </div>
              )}
            </div>

            {/* Devis Form */}
            <div className="devis-form-container">
              <h2>Informations du Projet</h2>
              <form onSubmit={handleSubmit} className="devis-form">
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
                    rows="4"
                    required
                    placeholder="Décrivez votre projet en détail..."
                  ></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="budget">Budget estimé</label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner une fourchette</option>
                      <option value="1000-5000">1 000 - 5 000 DH</option>
                      <option value="5000-10000">5 000 - 10 000 DH</option>
                      <option value="10000-20000">10 000 - 20 000 DH</option>
                      <option value="20000-50000">20 000 - 50 000 DH</option>
                      <option value="50000+">50 000 DH et plus</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="timeline">Délai souhaité</label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner un délai</option>
                      <option value="urgent">Urgent (1-2 semaines)</option>
                      <option value="normal">Normal (1-2 mois)</option>
                      <option value="flexible">Flexible (3-6 mois)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="requirements">Spécifications techniques</label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Technologies préférées, fonctionnalités spécifiques, etc."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="additionalInfo">Informations complémentaires</label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Toute information pertinente pour votre projet..."
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
                    Retour
                  </button>
                  <button type="submit" className="btn-primary">
                    Envoyer la demande de devis
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DevisPage;
