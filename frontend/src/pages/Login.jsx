import React, { useState } from 'react';
import '../styles/responsive.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulation de connexion (remplacer par vrai appel API)
    if (formData.email === 'admin@ytech.com' && formData.password === 'test123') {
      // Stocker l'utilisateur dans localStorage
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: formData.email,
        role: 'admin',
        name: 'Admin YTech'
      }));
      
      alert('Connexion réussie !');
      window.location.href = '/';
    } else {
      alert('Identifiants incorrects');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="section" style={{ paddingTop: '100px' }}>
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <h2>Connexion</h2>
            <p>Accédez à votre espace YTech AI</p>
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="admin@ytech.com"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Mot de passe</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="test123"
                />
              </div>
              
              <button type="submit" className="btn btn-primary">
                Se connecter
              </button>
            </form>
            
            <div className="auth-info">
              <p>
                <strong>Identifiants de test :</strong><br />
                Email : admin@ytech.com<br />
                Mot de passe : test123
              </p>
            </div>
            
            <div className="auth-back">
              <a href="/" className="btn btn-secondary">
                Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
