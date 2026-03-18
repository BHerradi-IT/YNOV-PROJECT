import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import DevisModal from './DevisModal';
import '../styles/responsive.css';

function Pricing() {
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, selectedPlan: '' });
  const [devisModal, setDevisModal] = useState({ isOpen: false, planName: '', planPrice: 0 });

  // Écouter l'événement d'ouverture du modal après connexion
  useEffect(() => {
    const handleOpenDevisModal = (event) => {
      const { planName } = event.detail;
      const plan = plans.find(p => p.name === planName);
      if (plan) {
        setDevisModal({
          isOpen: true,
          planName: plan.name,
          planPrice: isAnnual ? plan.annualPrice : plan.monthlyPrice
        });
      }
    };

    window.addEventListener('openDevisModal', handleOpenDevisModal);
    return () => window.removeEventListener('openDevisModal', handleOpenDevisModal);
  }, [isAnnual]);

  const plans = [
    {
      name: 'Basic',
      monthlyPrice: 29,
      annualPrice: 19,
      originalMonthly: 49,
      originalAnnual: 39,
      features: [
        '1 Site',
        '1GB Stockage',
        'Support Email',
        'SSL Basic',
        'Analytics',
        'Backup mensuel'
      ],
      featured: false,
      description: 'Pour commencer',
      icon: '🌱'
    },
    {
      name: 'Pro',
      monthlyPrice: 79,
      annualPrice: 59,
      originalMonthly: 99,
      originalAnnual: 79,
      features: [
        '5 Sites',
        '10GB Stockage',
        'Support Prioritaire',
        'SSL Pro',
        'Analytics Avancé',
        'Backup quotidien',
        'API Access',
        'CDN'
      ],
      featured: true,
      description: 'Le plus populaire',
      icon: '⭐'
    },
    {
      name: 'Business',
      monthlyPrice: 199,
      annualPrice: 149,
      originalMonthly: 299,
      originalAnnual: 239,
      features: [
        'Sites illimités',
        '100GB Stockage',
        'Support 24/7',
        'SSL Enterprise',
        'Analytics Premium',
        'Backup temps réel',
        'API illimitées',
        'CDN Global',
        'Équipe dédiée'
      ],
      featured: false,
      description: 'Pour les pros',
      icon: '🚀'
    }
  ];

  const handlePlanSelect = (planName, planPrice) => {
    console.log(`Plan sélectionné: ${planName} - ${planPrice}€/mois`);
    
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      // Ouvrir le modal d'authentification avec le plan sélectionné
      setAuthModal({
        isOpen: true,
        selectedPlan: planName
      });
      return;
    }
    
    // Si l'utilisateur est connecté, ouvrir directement le modal de devis
    setDevisModal({
      isOpen: true,
      planName: planName,
      planPrice: planPrice
    });
  };

  const handleAuthSuccess = (userData) => {
    // Après authentification réussie, ouvrir le modal de devis avec le plan
    const plan = plans.find(p => p.name === authModal.selectedPlan);
    if (plan) {
      setDevisModal({
        isOpen: true,
        planName: plan.name,
        planPrice: isAnnual ? plan.annualPrice : plan.monthlyPrice
      });
    }
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, selectedPlan: '' });
  };

  const closeDevisModal = () => {
    setDevisModal({ isOpen: false, planName: '', planPrice: 0 });
  };

  return (
    <section className="section pricing-section" id="pricing">
      <div className="container">
        <h2 className="section-title">Tarifs</h2>
        <p className="section-subtitle">
          Choisissez le plan parfait pour vos besoins
        </p>
        
        <div className="billing-toggle">
          <button 
            className={`toggle-btn ${!isAnnual ? 'active' : ''}`}
            onClick={() => setIsAnnual(false)}
          >
            Mensuel
          </button>
          <button 
            className={`toggle-btn ${isAnnual ? 'active' : ''}`}
            onClick={() => setIsAnnual(true)}
          >
            Annuel <span className="discount">-20%</span>
          </button>
        </div>
        
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-card ${plan.featured ? 'featured' : ''}`}
            >
              {plan.featured && (
                <div className="pricing-badge">Plus Populaire</div>
              )}
              
              <div className="pricing-header">
                <div className="pricing-icon">{plan.icon}</div>
                <h3>{plan.name}</h3>
                <p className="pricing-description">{plan.description}</p>
                <div className="pricing-price">
                  <div className="price-current">
                    <span className="price-amount">
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="price-period">
                      {isAnnual ? '/mois (annuel)' : '/mois'}
                    </span>
                  </div>
                  <div className="price-original">
                    <span>{isAnnual ? plan.originalAnnual : plan.originalMonthly}</span>
                    <span>/mois</span>
                  </div>
                </div>
              </div>
              
              <div className="pricing-features">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="feature-item">
                    <span className="feature-check">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <button 
                className="pricing-btn btn-primary"
                onClick={() => handlePlanSelect(plan.name, isAnnual ? plan.annualPrice : plan.monthlyPrice)}
              >
                {plan.featured ? 'Commencer maintenant' : 'Commencer maintenant'}
              </button>
            </div>
          ))}
        </div>
        
        <div className="pricing-footer">
          <p className="pricing-guarantee">
            💰 Garantie satisfait ou remboursé 30 jours
          </p>
          <p className="pricing-note">
            Tous les plans incluent un support technique et des mises à jour régulières
          </p>
        </div>
      </div>
      
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
        selectedPlan={authModal.selectedPlan}
      />
      
      <DevisModal 
        isOpen={devisModal.isOpen}
        onClose={closeDevisModal}
        planName={devisModal.planName}
        planPrice={devisModal.planPrice}
      />
    </section>
  );
}

export default Pricing;
