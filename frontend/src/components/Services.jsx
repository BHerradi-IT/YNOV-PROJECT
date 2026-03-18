import React from 'react';
import '../styles/responsive.css';

function Services({ onServiceClick }) {
  const services = [
    {
      id: 1,
      icon: '🌐',
      name: 'Sites Web Professionnels',
      description: 'Sites web modernes, responsifs et optimisés pour les moteurs de recherche',
      features: ['Design responsive', 'Optimisé SEO', 'Performance rapide', 'Maintenance continue']
    },
    {
      id: 2,
      icon: '📱',
      name: 'Applications Mobile',
      description: 'Applications iOS et Android natives avec interface utilisateur intuitive',
      features: ['iOS & Android', 'Interface intuitive', 'Performance native', 'Support continu']
    },
    {
      id: 3,
      icon: '🛒',
      name: 'Solutions E-Commerce',
      description: 'Boutiques en ligne complètes avec gestion des stocks et paiements sécurisés',
      features: ['Gestion stocks', 'Paiements sécurisés', 'Dashboard admin', 'Analytics avancé']
    },
    {
      id: 4,
      icon: '🎨',
      name: 'Design UI/UX',
      description: 'Interfaces utilisateur modernes et expériences engageantes',
      features: ['Maquettes Figma', 'Prototypes interactifs', 'Tests utilisateurs', 'Design system']
    },
    {
      id: 5,
      icon: '🤖',
      name: 'Intelligence Artificielle',
      description: 'Solutions IA personnalisées pour automatiser et optimiser vos processus',
      features: ['Machine Learning', 'NLP', 'Computer Vision', 'Chatbots intelligents']
    },
    {
      id: 6,
      icon: '☁️',
      name: 'Solutions Cloud',
      description: 'Infrastructure cloud scalable et sécurisée pour votre entreprise',
      features: ['AWS/Azure', 'Migration cloud', 'DevOps', 'Monitoring 24/7']
    }
  ];

  return (
    <section className="section pricing-section" id="services">
      <div className="container">
        <h2 className="section-title">Nos Services</h2>
        <p className="section-subtitle">
          Des solutions technologiques complètes pour transformer votre entreprise
        </p>
        
        <div className="pricing-grid">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="pricing-card"
            >
              <div className="pricing-header">
                <div className="pricing-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p className="pricing-description">{service.description}</p>
              </div>
              
              <div className="pricing-features">
                {service.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="feature-item">
                    <span className="feature-check">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
