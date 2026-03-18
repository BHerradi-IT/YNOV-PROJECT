import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import '../styles/responsive.css';

function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger les vraies données depuis MariaDB
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les projets de l'utilisateur depuis l'API
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setServiceRequests(data.projects || []);
        } else {
          // Si l'API n'existe pas encore, afficher dashboard vide
          setServiceRequests([]);
        }
        
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
        // En cas d'erreur, afficher dashboard vide
        setServiceRequests([]);
        error('Erreur de chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [error]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'in-progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityText = (priority) => {
    switch(priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  const handleLogout = () => {
    logout();
    success('Déconnexion réussie');
    navigate('/');
  };

  const handleViewProject = (projectId) => {
    success(`Ouverture du projet #${projectId}`);
    // Ici vous pouvez naviguer vers une page de détail
  };

  const handleContactSupport = () => {
    navigate('/#contact');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de votre dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard-error">
        <h2>Session expirée</h2>
        <p>Veuillez vous reconnecter</p>
        <Link to="/login" className="btn btn-primary">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h1>Tableau de Bord</h1>
              <p>Bienvenue, <strong>{user.name}</strong>!</p>
              <span className="user-role">
                {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              🏠 Accueil
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleContactSupport}
            >
              💬 Support
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleLogout}
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{serviceRequests.length}</h3>
              <p>Projets Total</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>{serviceRequests.filter(r => r.status === 'in-progress').length}</h3>
              <p>En Cours</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{serviceRequests.filter(r => r.status === 'completed').length}</h3>
              <p>Terminés</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>{Math.round(serviceRequests.reduce((acc, r) => acc + r.progress, 0) / serviceRequests.length)}%</h3>
              <p>Progression Moyenne</p>
            </div>
          </div>
        </div>

        <div className="services-tracking">
          <div className="section-header">
            <h2>Mes Projets</h2>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/#services')}
            >
              ➕ Nouveau Projet
            </button>
          </div>
          
          {serviceRequests.length === 0 ? (
            <div className="empty-services">
              <div className="empty-icon">📋</div>
              <h3>Aucun projet en cours</h3>
              <p>Commencez par demander un service pour voir vos projets ici</p>
              <Link to="/#services" className="btn btn-primary">
                Demander un Service
              </Link>
            </div>
          ) : (
            <div className="services-list">
              {serviceRequests.map(request => (
                <div key={request.id} className="service-card">
                  <div className="service-header">
                    <div className="service-title">
                      <h3>{request.title}</h3>
                      <div className="service-meta">
                        <span 
                          className="status-badge"
                          style={{ 
                            backgroundColor: getStatusColor(request.status),
                            color: '#ffffff'
                          }}
                        >
                          {getStatusText(request.status)}
                        </span>
                        <span 
                          className="priority-badge"
                          style={{ 
                            backgroundColor: getPriorityColor(request.priority),
                            color: '#ffffff'
                          }}
                        >
                          {getPriorityText(request.priority)}
                        </span>
                      </div>
                    </div>
                    <button 
                      className="view-btn"
                      onClick={() => handleViewProject(request.id)}
                    >
                      👁️ Voir
                    </button>
                  </div>
                  <div className="service-content">
                    <p>{request.description}</p>
                    <div className="progress-section">
                      <div className="progress-label">
                        <span>Progression</span>
                        <span>{request.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${request.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="service-footer">
                    <div className="service-dates">
                      <small>📅 Créé le {new Date(request.createdAt).toLocaleDateString()}</small>
                      {request.deadline && (
                        <small>⏰ Deadline {new Date(request.deadline).toLocaleDateString()}</small>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
