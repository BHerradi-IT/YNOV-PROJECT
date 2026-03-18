import React from 'react';
import '../styles/responsive.css';

function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Consultation & Analyse',
      description: 'Nous étudions vos besoins et définissons ensemble la meilleure stratégie digitale pour votre projet.'
    },
    {
      number: '2',
      title: 'Design & Développement',
      description: 'Notre équipe crée votre solution avec les technologies les plus modernes et les meilleures pratiques.'
    },
    {
      number: '3',
      title: 'Lancement & Support',
      description: 'Nous déployons votre projet et assurons un suivi continu pour garantir votre succès.'
    }
  ];

  return (
    <section className="section section-light" id="how-it-works">
      <div className="container">
        <h2 className="section-title">Notre Méthodologie</h2>
        <p className="section-subtitle">
          Une approche structurée pour garantir le succès de vos projets digitaux
        </p>
        
        <div className="grid grid-3">
          {steps.map((step, index) => (
            <div key={index} className="card step-card">
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
