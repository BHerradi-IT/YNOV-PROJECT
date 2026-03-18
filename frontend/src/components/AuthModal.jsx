import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';
import '../styles/auth.css';

function AuthModal({ isOpen, onClose, onAuthSuccess, selectedPlan }) {
  const { login } = useAuth();
  const { success, error } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      resetForm();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      // Validation
      if (!isLogin && formData.password !== formData.confirmPassword) {
        setAuthError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      if (!formData.email || !formData.password) {
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Email invalide');
      }

      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            email: formData.email, 
            password: formData.password, 
            name: formData.name.trim(),
            firstName: formData.name.trim(),
            lastName: ''
          };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'authentification');
      }

      // Stocker les données utilisateur et token
      const loginSuccess = login(data.user, data.token);
      
      if (!loginSuccess) {
        throw new Error('Erreur lors de la sauvegarde de la session');
      }

      success(isLogin ? 'Connexion réussie !' : 'Compte créé avec succès !');

      // Callback pour ouvrir le modal de devis
      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }

      // Fermer le modal d'auth
      onClose();

    } catch (err) {
      console.error('Auth error:', err);
      setAuthError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
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
    setAuthError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-logo">
            <div className="logo-icon">🚀</div>
            <h1>YTECH</h1>
          </div>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        <div className="auth-modal-body">
          <div className="auth-title">
            <h2>{isLogin ? 'Connexion Rapide' : 'Créer un Compte'}</h2>
            <p>
              {selectedPlan ? (
                <>
                  Connectez-vous pour demander un devis pour le plan <strong>{selectedPlan}</strong>
                </>
              ) : (
                isLogin 
                  ? 'Connectez-vous à votre espace personnel' 
                  : 'Créez votre compte et commencez votre projet'
              )}
            </p>
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

          {authError && (
            <div className="auth-error">
              <span className="error-icon">⚠️</span>
              <span>{authError}</span>
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

          <div className="auth-modal-footer">
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
            <p className="auth-note">
              <small>🔒 Vos données sont sécurisées et confidentielles</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
