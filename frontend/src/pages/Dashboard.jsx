import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [hasPurchases, setHasPurchases] = useState(false);
  const [loading, setLoading] = useState(true);
  const { success, info } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      window.location.href = '/auth';
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    if (parsedUser.role === 'admin') {
      window.location.href = '/admin';
      return;
    }

    setUser(parsedUser);

    const checkUserPurchases = async () => {
      try {
        const response = await fetch('/api/user/purchases', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const purchases = await response.json();
          setHasPurchases(purchases.length > 0);
          setOrders(purchases);
        } else {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          setHasPurchases(cart.length > 0);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des achats:', error);
        setHasPurchases(false);
      }
    };

    checkUserPurchases();
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.firstName} />
            ) : (
              <span>{user.firstName[0]}{user.lastName[0]}</span>
            )}
          </div>
          <div className="user-details">
            <h3>{user.firstName} {user.lastName}</h3>
            <p>{user.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </div>

      {!hasPurchases ? (
        <div className="dashboard-content">
          <div className="welcome-section">
            <h2>👋 Bienvenue sur YTECH !</h2>
            <p>
              Merci de vous être inscrit sur YTECH ! Nous sommes ravis de vous compter parmi nos clients.
            </p>
            <div className="welcome-actions">
              <button className="action-btn primary" onClick={() => {
                window.location.href = '/#services';
                success('Découvrez nos services !');
              }}>
                <span>🚀</span>
                Découvrir nos services
              </button>
              <button className="action-btn secondary" onClick={() => {
                window.location.href = '/#contact';
                info('Contactez-nous pour un devis personnalisé !');
              }}>
                <span>💬</span>
                Contacter un expert
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>🎯 Comment commencer ?</h3>
            <div className="getting-started">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>Choisissez un service</h4>
                  <p>Découvrez nos offres de développement web, mobile et marketing digital</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>Demandez un devis</h4>
                  <p>Remplissez le formulaire pour recevoir une estimation personnalisée</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h4>Lancez votre projet</h4>
                  <p>Notre équipe vous accompagne à chaque étape du développement</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <h3>📊 Nos statistiques</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">150+</span>
                <span className="stat-label">Projets livrés</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98.5%</span>
                <span className="stat-label">Satisfaction client</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24h</span>
                <span className="stat-label">Support technique</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5⭐</span>
                <span className="stat-label">Note moyenne</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-content">
          <div className="dashboard-card">
            <h3>📈 Vos projets</h3>
            {orders.length === 0 ? (
              <div className="empty-state">
                <h4>Aucun projet en cours</h4>
                <p>Félicitations ! Votre premier projet apparaîtra ici bientôt.</p>
                <button 
                  className="action-btn primary"
                  onClick={() => {
                    const event = new CustomEvent('openQuoteModal');
                    window.dispatchEvent(event);
                    success('Commencez votre nouveau projet !');
                  }}
                >
                  <span>🚀</span>
                  Nouveau projet
                </button>
              </div>
            ) : (
              <div className="projects-list">
                {orders.map(order => (
                  <div key={order.id} className="project-item">
                    <div className="project-header">
                      <h4>{order.service}</h4>
                      <span className={`status-badge ${order.status}`}>
                        {order.status === 'pending' && '⏳ En attente'}
                        {order.status === 'processing' && '🔧 En cours'}
                        {order.status === 'completed' && '✅ Terminé'}
                        {order.status === 'cancelled' && '❌ Annulé'}
                      </span>
                    </div>
                    <div className="project-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{order.progress}%</span>
                    </div>
                    <div className="project-details">
                      <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString('fr-FR')}</p>
                      <p><strong>Prix:</strong> {order.price} DH</p>
                    </div>
                    <div className="project-actions">
                      <button className="action-btn secondary" onClick={() => info(`Détails du projet ${order.id}`)}>
                        <span>📋</span>
                        Voir détails
                      </button>
                      <button className="action-btn primary" onClick={() => success(`Contactez-nous pour le projet ${order.id} !`)}>
                        <span>💬</span>
                        Contacter l'équipe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>🎯 Actions Rapides</h3>
              <div className="quick-actions">
                <button className="action-btn primary" onClick={() => {
                  window.location.href = '/#services';
                  success('Découvrez nos autres services !');
                }}>
                  <span>🛒</span>
                  Voir les services
                </button>
                <button className="action-btn secondary" onClick={() => {
                  window.location.href = '/#contact';
                  info('Besoin daide ? Contactez-nous !');
                }}>
                  <span>📞</span>
                  Contacter le support
                </button>
                <button className="action-btn secondary" onClick={() => {
                  window.location.href = '/#testimonials';
                  success('Découvrez nos témoignages !');
                }}>
                  <span>⭐</span>
                  Voir les témoignages
                </button>
                <button className="action-btn secondary" onClick={() => {
                  const event = new CustomEvent('openQuoteModal');
                  window.dispatchEvent(event);
                  success('Demandez un nouveau devis !');
                }}>
                  <span>💰</span>
                  Nouveau devis
                </button>
              </div>
            </div>

            <div className="dashboard-card">
              <h3>📊 Statistiques</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{orders.length}</span>
                  <span className="stat-label">Projets totaux</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{orders.filter(o => o.status === 'completed').length}</span>
                  <span className="stat-label">Projets terminés</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{orders.filter(o => o.status === 'processing').length}</span>
                  <span className="stat-label">En cours</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">
                    {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100) : 0}%
                  </span>
                  <span className="stat-label">Taux de complétion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
