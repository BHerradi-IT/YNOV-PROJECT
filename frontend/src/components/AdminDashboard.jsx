import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/dashboard.css';

function AdminDashboard() {
  const { user, token, logout, getAuthHeaders } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Charger les données admin
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Charger tous les projets
      const projectsResponse = await fetch('http://localhost:5000/api/admin/projects', {
        headers: getAuthHeaders()
      });
      
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      }

      // Charger tous les utilisateurs
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: getAuthHeaders()
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      // Charger tous les paiements
      const paymentsResponse = await fetch('http://localhost:5000/api/admin/payments', {
        headers: getAuthHeaders()
      });
      
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData.payments || []);
      }
    } catch (error) {
      console.error('Erreur chargement données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'in_progress': '#17a2b8',
      'completed': '#28a745',
      'cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'En attente',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return texts[status] || status;
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Statut du projet mis à jour avec succès');
        fetchAdminData(); // Recharger les données
      } else {
        const error = await response.json();
        alert('Erreur: ' + error.error);
      }
    } catch (error) {
      alert('Erreur de connexion: ' + error.message);
    }
  };

  const validateProject = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/projects/${projectId}/validate`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        alert('Projet validé avec succès');
        fetchAdminData();
      } else {
        const error = await response.json();
        alert('Erreur: ' + error.error);
      }
    } catch (error) {
      alert('Erreur de connexion: ' + error.message);
    }
  };

  const viewProjectDetails = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Chargement du tableau de bord admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="avatar">
            👑
          </div>
          <div className="user-details">
            <h2>Administration</h2>
            <p>Panel de gestion</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="logout-btn" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{users.length}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{projects.length}</h3>
            <p>Projets totaux</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h3>{projects.filter(p => p.status === 'in_progress').length}</h3>
            <p>En cours</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{payments.filter(p => p.status === 'completed').length}</h3>
            <p>Paiements</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          📋 Projets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Utilisateurs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          💰 Paiements
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="admin-content">
        {/* Onglet Projets */}
        {activeTab === 'projects' && (
          <div className="admin-projects-section">
            <h3>Gestion des Projets</h3>
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card admin-project-card">
                  <div className="project-header">
                    <h4>{project.name}</h4>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(project.status) }}
                    >
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  
                  <div className="project-description">
                    <p>{project.description}</p>
                  </div>

                  <div className="project-details">
                    <div className="detail-item">
                      <span className="label">Client:</span>
                      <span className="value">{project.client_email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Budget:</span>
                      <span className="value">{project.budget ? `${project.budget} MAD` : 'Non défini'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Type:</span>
                      <span className="value">{project.type}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Créé le:</span>
                      <span className="value">{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Payé:</span>
                      <span className="value">{project.paid ? '✅ Oui' : '❌ Non'}</span>
                    </div>
                  </div>

                  {/* Actions admin */}
                  <div className="admin-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => viewProjectDetails(project)}
                    >
                      👁 Voir
                    </button>
                    
                    {project.status === 'pending' && (
                      <button 
                        className="action-btn validate-btn"
                        onClick={() => validateProject(project.id)}
                      >
                        ✅ Valider
                      </button>
                    )}
                    
                    {project.status === 'pending' && (
                      <button 
                        className="action-btn start-btn"
                        onClick={() => updateProjectStatus(project.id, 'in_progress')}
                      >
                        ▶️ Démarrer
                      </button>
                    )}
                    
                    {project.status === 'in_progress' && (
                      <button 
                        className="action-btn complete-btn"
                        onClick={() => updateProjectStatus(project.id, 'completed')}
                      >
                        ✅ Terminer
                      </button>
                    )}
                    
                    {project.status !== 'cancelled' && (
                      <button 
                        className="action-btn cancel-btn"
                        onClick={() => updateProjectStatus(project.id, 'cancelled')}
                      >
                        ❌ Annuler
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {projects.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>Aucun projet pour le moment</h3>
                <p>Les projets apparaîtront ici une fois que les utilisateurs en créeront.</p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Utilisateurs */}
        {activeTab === 'users' && (
          <div className="admin-users-section">
            <h3>Gestion des Utilisateurs</h3>
            <div className="users-list">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-header">
                    <div className="user-avatar">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <div className="user-info">
                      <h4>{user.firstName} {user.lastName}</h4>
                      <p>{user.email}</p>
                    </div>
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? '👑 Admin' : '👤 Utilisateur'}
                    </span>
                  </div>
                  
                  <div className="user-details">
                    <div className="detail-item">
                      <span className="label">Rôle:</span>
                      <span className="value">{user.role}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Inscrit le:</span>
                      <span className="value">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Statut:</span>
                      <span className="value">{user.is_active ? '✅ Actif' : '❌ Inactif'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {users.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>Aucun utilisateur pour le moment</h3>
                <p>Les utilisateurs apparaîtront ici une fois qu'ils s'inscriront.</p>
              </div>
            )}
          </div>
        )}

        {/* Onglet Paiements */}
        {activeTab === 'payments' && (
          <div className="admin-payments-section">
            <h3>Historique des Paiements</h3>
            <div className="payments-list">
              {payments.map((payment) => (
                <div key={payment.id} className="payment-item admin-payment-item">
                  <div className="payment-info">
                    <div className="payment-header">
                      <h4>{payment.description}</h4>
                      <span className={`payment-status ${payment.status}`}>
                        {payment.status === 'completed' ? '✅' : '⏳'} {payment.status}
                      </span>
                    </div>
                    <div className="payment-details">
                      <div className="detail-item">
                        <span className="label">Client:</span>
                        <span className="value">{payment.user_email || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Montant:</span>
                        <span className="value">{payment.amount} {payment.currency}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Méthode:</span>
                        <span className="value">{payment.method}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Projet:</span>
                        <span className="value">{payment.project_name || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Date:</span>
                        <span className="value">{new Date(payment.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {payments.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <h3>Aucun paiement pour le moment</h3>
                <p>Les paiements apparaîtront ici une fois que les utilisateurs paieront pour les services.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal détails projet */}
      {showProjectModal && selectedProject && (
        <div className="modal-overlay">
          <div className="project-modal">
            <div className="modal-header">
              <h3>Détails du Projet</h3>
              <button className="close-btn" onClick={() => setShowProjectModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="project-details-full">
                <h4>{selectedProject.name}</h4>
                <p><strong>Description:</strong> {selectedProject.description}</p>
                <p><strong>Client:</strong> {selectedProject.client_email}</p>
                <p><strong>Budget:</strong> {selectedProject.budget} MAD</p>
                <p><strong>Type:</strong> {selectedProject.type}</p>
                <p><strong>Statut:</strong> {getStatusText(selectedProject.status)}</p>
                <p><strong>Payé:</strong> {selectedProject.paid ? 'Oui' : 'Non'}</p>
                <p><strong>Créé le:</strong> {new Date(selectedProject.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
