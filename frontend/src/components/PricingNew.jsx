import React, { useState, useEffect } from 'react';
import '../styles/responsive.css';

function Pricing() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const plans = [
    {
      name: 'Starter',
      price: '2999',
      period: 'une fois',
      description: 'Parfait pour les petites entreprises',
      features: [
        'Site web responsive moderne',
        '5 pages incluses',
        'Formulaire de contact',
        'Hébergement 1 an inclus',
        'Support par email',
        'SEO de base'
      ],
      featured: false
    },
    {
      name: 'Professional',
      price: '5999',
      period: 'une fois',
      description: 'Idéal pour les entreprises en croissance',
      features: [
        'Site web avancé avec CMS',
        '15 pages incluses',
        'Blog intégré',
        'E-commerce basique',
        'Support prioritaire',
        'SEO avancé',
        'Formation incluse'
      ],
      featured: true
    },
    {
      name: 'Enterprise',
      price: '9999',
      period: 'une fois',
      description: 'Solution complète pour grandes entreprises',
      features: [
        'Site web sur mesure',
        'Pages illimitées',
        'API personnalisée',
        'E-commerce complet',
        'Formation avancée',
        'Support 24/7',
        'Maintenance 1 an',
        'Multi-langues'
      ],
      featured: false
    }
  ];

  const handleAddToCart = (plan) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const existingItem = cart.find(item => item.name === plan.name);
    if (existingItem) {
      alert('Ce plan est déjà dans votre panier!');
      return;
    }

    const cartItem = {
      ...plan,
      id: Date.now(),
      quantity: 1,
      addedAt: new Date().toISOString()
    };
    
    const newCart = [...cart, cartItem];
    setCart(newCart);
    
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    const event = new CustomEvent('cartUpdated', { 
      detail: { count: newCart.length } 
    });
    window.dispatchEvent(event);
    
    alert(`${plan.name} ajouté au panier avec succès!`);
  };

  return (
    <section className="section pricing-section" id="pricing">
      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <div key={index} className={`pricing-item ${plan.featured ? 'featured' : ''}`}>
            {plan.featured && <div className="pricing-badge">Plus populaire</div>}
            <h3>{plan.name}</h3>
            <div className="pricing-price">{plan.price} DH</div>
            <div className="pricing-period">{plan.period}</div>
            <p style={{marginBottom: '2.5rem', color: 'rgba(255, 255, 255, 0.8)'}}>{plan.description}</p>
            
            <ul className="pricing-features">
              {plan.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            
            <button 
              className="pricing-btn" 
              onClick={() => handleAddToCart(plan)}
            >
              {user ? 'Ajouter au panier' : 'Se connecter pour commander'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Pricing;
