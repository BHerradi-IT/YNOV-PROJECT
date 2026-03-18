import React, { useState, useEffect } from 'react';
import '../styles/responsive.css';

function Services() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const services = [
    {
      icon: '🌐',
      title: 'Sites Web Professionnels',
      description: 'Développement de sites web modernes, responsifs et optimisés pour les moteurs de recherche. Technologies de pointe pour garantir performance et sécurité.'
    },
    {
      icon: '📱',
      title: 'Applications Mobile',
      description: 'Applications iOS et Android natives avec interface utilisateur intuitive et expérience exceptionnelle. Solutions complètes pour mobile et tablette.'
    },
    {
      icon: '🛒',
      title: 'Solutions E-Commerce',
      description: 'Boutiques en ligne complètes avec gestion des stocks, paiements sécurisés et interface d\'administration intuitive pour votre business.'
    },
    {
      icon: '🎨',
      title: 'Design UI/UX',
      description: 'Interfaces utilisateur modernes et expériences engageantes. Design centré sur l\'utilisateur pour maximiser la conversion.'
    },
    {
      icon: '⚙️',
      title: 'Développement Backend',
      description: 'API robustes, bases de données optimisées et architecture scalable. Solutions backend fiables pour vos applications.'
    },
    {
      icon: '🚀',
      title: 'Maintenance & Support',
      description: 'Support technique continu, mises à jour régulières et monitoring performant. Garantie de disponibilité et performance.'
    }
  ];

  const handleServiceClick = (serviceName) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    const serviceRequest = {
      service: serviceName,
      userId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      progress: 0
    };
    
    const existingRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    existingRequests.push(serviceRequest);
    localStorage.setItem('serviceRequests', JSON.stringify(existingRequests));
    
    alert(`Demande de service "${serviceName}" créée avec succès! Vous pouvez suivre l'état d'avancement dans votre tableau de bord.`);
    
    window.location.href = '/dashboard';
  };

  return (
    <section className="section services-section" id="services">
      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-item">
            <div className="service-header">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
            </div>
            <p>{service.description}</p>
            <button 
              className="service-btn" 
              onClick={() => handleServiceClick(service.title)}
            >
              {user ? 'Demander un devis' : 'Se connecter pour commander'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;
