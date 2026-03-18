import React from 'react';
import '../styles/responsive.css';

function UseCases() {
  const useCases = [
    {
      icon: '🏢',
      title: 'Entreprises',
      description: 'Solutions digitales complètes pour PME et grandes entreprises. Sites corporate, intranets, et applications métier sur mesure.'
    },
    {
      icon: '🛍️',
      title: 'E-Commerce',
      description: 'Boutiques en ligne performantes avec gestion avancée des stocks, paiements sécurisés et expérience d\'achat optimisée.'
    },
    {
      icon: '🎯',
      title: 'Startups',
      description: 'Accompagnement digital pour startups. MVP, applications innovantes et scaling technologique pour la croissance.'
    },
    {
      icon: '👥',
      title: 'Professionnels',
      description: 'Sites personnels, portfolios et applications sur mesure pour freelances et professionnels indépendants.'
    }
  ];

  return (
    <section className="section section-dark" id="use-cases">
      <div className="container">
        <h2 className="section-title">Nos Réalisations</h2>
        <p className="section-subtitle">
          Découvrez comment nous transformons les idées en succès digitaux pour différents secteurs
        </p>
        
        <div className="grid grid-2">
          {useCases.map((useCase, index) => (
            <div key={index} className="card use-case-card">
              <div className="use-case-icon">{useCase.icon}</div>
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UseCases;
