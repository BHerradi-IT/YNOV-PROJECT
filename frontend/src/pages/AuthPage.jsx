import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import './AuthPage.css';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    // Rediriger vers le dashboard ou la page d'accueil
    window.location.href = '/dashboard';
  };

  const handleRegister = (userData) => {
    setUser(userData);
    // Rediriger vers le dashboard ou la page d'accueil
    window.location.href = '/dashboard';
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <div className="auth-content">
        {isLogin ? (
          <Login 
            onLogin={handleLogin} 
            onSwitchToRegister={switchToRegister} 
          />
        ) : (
          <Register 
            onRegister={handleRegister} 
            onSwitchToLogin={switchToLogin} 
          />
        )}
      </div>
    </div>
  );
}

export default AuthPage;
