import React from 'react';
import '../styles/responsive.css';

function Compatibility() {
  const technologies = [
    {
      icon: '⚛️',
      name: 'React',
      description: 'Frontend Moderne',
      version: '18.0+'
    },
    {
      icon: '📱',
      name: 'React Native',
      description: 'Applications Mobile',
      version: 'Cross-platform'
    },
    {
      icon: '🗄️',
      name: 'Node.js',
      description: 'Backend JavaScript',
      version: '18.0+'
    },
    {
      icon: '�',
      name: 'UI/UX Design',
      description: 'Design Moderne',
      version: 'Figma & Adobe'
    }
  ];

  return (
    <section className="section section-light" id="compatibility">
      <div className="container">
        <h2 className="section-title">Nos Technologies</h2>
        <p className="section-subtitle">
          Nous utilisons les technologies les plus modernes et performantes du marché
        </p>
        
        <div className="grid grid-4">
          {technologies.map((tech, index) => (
            <div key={index} className="device-compat">
              <div className="device-compat-icon">{tech.icon}</div>
              <h4>{tech.name}</h4>
              <p>{tech.description}</p>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {tech.version}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Compatibility;
