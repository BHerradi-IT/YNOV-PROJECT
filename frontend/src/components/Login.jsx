import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/auth.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    // Vérifier si on est en mode inscription
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);

  // Récupérer les paramètres de redirection
  const redirect = searchParams.get('redirect');
  const selectedPlan = searchParams.get('plan');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      if (!formData.email || !formData.password) {
        setError('Veuillez remplir tous les champs requis');
        setLoading(false);
        return;
      }

      if (!isLogin && !formData.name) {
        setError('Veuillez entrer votre nom complet');
        setLoading(false);
        return;
      }

      // Simulation d'API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Données de test
      const userData = {
        id: 1,
        name: formData.name || 'Utilisateur Test',
        email: formData.email,
        role: formData.email.includes('admin') ? 'admin' : 'user'
      };

      const token = 'mock-jwt-token';

      // Stockage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);

      login(userData, token);
      
      // Redirection selon les paramètres
      if (redirect === 'pricing' && selectedPlan) {
        // Rediriger vers les tarifs puis ouvrir le modal du plan
        navigate('/#pricing');
        // Attendre que la page se charge puis ouvrir le modal
        setTimeout(() => {
          const event = new CustomEvent('openDevisModal', { 
            detail: { planName: selectedPlan } 
          });
          window.dispatchEvent(event);
        }, 1000);
      } else {
        navigate('/dashboard');
      }

    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setFocusedField('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
    // Mettre à jour l'URL sans recharger la page
    if (isLogin) {
      navigate('/login?mode=register', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-background">
        <div className="auth-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{ 
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>
      </div>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">🚀</div>
              <h1>YTECH</h1>
            </div>
            <div className="auth-title">
              <h2>{isLogin ? 'Bienvenue' : 'Rejoignez-nous'}</h2>
              <p>
                {isLogin 
                  ? 'Connectez-vous à votre espace personnel' 
                  : 'Créez votre compte et commencez votre projet'
                }
              </p>
            </div>
          </div>

          <div className="auth-toggle">
            <button 
              className={`toggle-option ${isLogin ? 'active' : ''}`}
              onClick={() => isLogin || toggleMode()}
            >
              Connexion
            </button>
            <button 
              className={`toggle-option ${!isLogin ? 'active' : ''}`}
              onClick={() => !isLogin || toggleMode()}
            >
              Inscription
            </button>
          </div>

          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Nom complet *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Adresse email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirmez votre mot de passe"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="auth-options">
              {isLogin && (
                <label className="checkbox-wrapper">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="checkbox-text">Se souvenir de moi</span>
                </label>
              )}
              {isLogin && (
                <a href="#" className="forgot-link">Mot de passe oublié ?</a>
              )}
            </div>

            <button 
              type="submit" 
              className={`auth-submit ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>{isLogin ? 'Connexion...' : 'Inscription...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? '🚀' : '✨'}</span>
                  <span>{isLogin ? 'Se connecter' : "S'inscrire"}</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <div className="auth-links">
              <p>
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button
                  type="button"
                  className="link-btn"
                  onClick={toggleMode}
                >
                  {isLogin ? "S'inscrire" : 'Se connecter'}
                </button>
              </p>
              <p>
                <Link to="/" className="back-link">
                  ← Retour à l'accueil
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="auth-info">
          <div className="info-card">
            <h3>🎯 Pourquoi choisir YTECH ?</h3>
            <ul className="info-features">
              <li>
                <span className="feature-icon">⚡</span>
                <div>
                  <strong>Rapide</strong>
                  <p>Déploiement instantané</p>
                </div>
              </li>
              <li>
                <span className="feature-icon">🔒</span>
                <div>
                  <strong>Sécurisé</strong>
                  <p>Protection de vos données</p>
                </div>
              </li>
              <li>
                <span className="feature-icon">📊</span>
                <div>
                  <strong>Analytics</strong>
                  <p>Suivi en temps réel</p>
                </div>
              </li>
              <li>
                <span className="feature-icon">🎨</span>
                <div>
                  <strong>Design moderne</strong>
                  <p>Interface professionnelle</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
