import React from 'react';
import '../styles/responsive.css';

function Features() {
  const features = [
    {
      icon: '🌐',
      title: 'Sites Web Professionnels',
      description: 'Développement de sites modernes, responsifs et optimisés SEO avec les dernières technologies.'
    },
    {
      icon: '�',
      title: 'Applications Mobile',
      description: 'Applications iOS et Android natives avec interface intuitive et expérience utilisateur optimale.'
    },
    {
      icon: '�',
      title: 'Solutions E-Commerce',
      description: 'Boutiques en ligne complètes avec gestion des stocks, paiements sécurisés et admin intuitive.'
    },
    {
      icon: '🎨',
      title: 'Design UI/UX',
      description: 'Interfaces utilisateur modernes et expériences engageantes pour maximiser la conversion.'
    },
    {
      icon: '⚙️',
      title: 'Développement Backend',
      description: 'API robustes, bases de données optimisées et architecture scalable pour vos applications.'
    },
    {
      icon: '�',
      title: 'Maintenance & Support',
      description: 'Support technique continu, mises à jour régulières et monitoring performant 24/7.'
    }
  ];

  return (
    <section className="section section-dark" id="services">
      <div className="container">
        <h2 className="section-title">Nos Services</h2>
        <p className="section-subtitle">
          Des solutions digitales complètes pour transformer vos idées en succès
        </p>
        
        <div className="grid grid-3">
          {features.map((feature, index) => (
            <div key={index} className="card feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
