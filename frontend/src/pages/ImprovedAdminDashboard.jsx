import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import { useSecurity } from '../components/SecurityContext';
import '../styles/responsive.css';

function AdminDashboard() {
  const { auditUserAction } = useSecurity();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { success, error: showError, info } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      window.location.href = '/';
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    if (parsedUser.role !== 'admin') {
      window.location.href = '/dashboard';
      return;
    }

    setUser(parsedUser);
    fetchAdminData(token);
  }, []);

  const fetchAdminData = async (token) => {
    try {
      setLoading(true);
      
      // Simuler les données admin en attendant l'API
      const mockUsers = [
        { id: 1, name: 'Ahmed Benali', email: 'ahmed@example.com', role: 'user', status: 'active', joinDate: '2024-01-15' },
        { id: 2, name: 'Fatima Karim', email: 'fatima@example.com', role: 'user', status: 'active', joinDate: '2024-01-20' },
        { id: 3, name: 'Youssef Ali', email: 'youssef@example.com', role: 'user', status: 'inactive', joinDate: '2024-01-10' }
      ];

      const mockOrders = [
        { id: 1, user: 'Ahmed Benali', plan: 'Professional', price: '5999 DH', date: '2024-01-15', status: 'completed' },
        { id: 2, user: 'Fatima Karim', plan: 'Starter', price: '2999 DH', date: '2024-01-20', status: 'in_progress' },
        { id: 3, user: 'Youssef Ali', plan: 'Enterprise', price: '9999 DH', date: '2024-01-25', status: 'pending' }
      ];

      const mockQuotes = [
        { id: 1, name: 'Karim', email: 'karim@example.com', service: 'Application Mobile', message: 'Besoin d\'une app iOS/Android', date: '2024-01-28', status: 'new' },
        { id: 2, name: 'Sara', email: 'sara@example.com', service: 'Site E-commerce', message: 'Site vente en ligne complet', date: '2024-01-27', status: 'contacted' }
      ];

      const mockProjects = [
        { id: 1, name: 'Site E-commerce Ahmed', client: 'Ahmed Benali', status: 'in_progress', progress: 65, deadline: '2024-02-15' },
        { id: 2, name: 'App Mobile Karim', client: 'Karim Enterprises', status: 'planning', progress: 15, deadline: '2024-03-20' },
        { id: 3, name: 'Site Vitrine Sara', client: 'Sara Boutique', status: 'completed', progress: 100, deadline: '2024-01-30' }
      ];

      const mockAnalytics = {
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.status === 'active').length,
        totalOrders: mockOrders.length,
        totalRevenue: mockOrders.reduce((sum, order) => sum + parseInt(order.price.replace(/[^0-9]/g, '')), 0),
        pendingQuotes: mockQuotes.filter(q => q.status === 'new').length,
        activeProjects: mockProjects.filter(p => p.status === 'in_progress').length
      };

      setUsers(mockUsers);
      setOrders(mockOrders);
      setQuotes(mockQuotes);
      setProjects(mockProjects);
      setAnalytics(mockAnalytics);

      auditUserAction(user.id, 'ADMIN_DASHBOARD_ACCESS', 'admin_dashboard', 'success');
    } catch (error) {
      console.error('Erreur lors du chargement des données admin:', error);
      showError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      // Simuler l'action utilisateur
      success(`Action ${action} effectuée avec succès`);
      auditUserAction(user.id, `USER_${action.toUpperCase()}`, `user_${userId}`, 'success');
      
      // Recharger les données
      const token = localStorage.getItem('token');
      fetchAdminData(token);
    } catch (error) {
      showError('Erreur lors de l\'action');
    }
  };

  const handleQuoteAction = async (quoteId, action) => {
    try {
      success(`Devis ${action} avec succès`);
      auditUserAction(user.id, `QUOTE_${action.toUpperCase()}`, `quote_${quoteId}`, 'success');
      
      const token = localStorage.getItem('token');
      fetchAdminData(token);
    } catch (error) {
      showError('Erreur lors du traitement du devis');
    }
  };

  const handleProjectUpdate = async (projectId, status) => {
    try {
      success('Statut du projet mis à jour');
      auditUserAction(user.id, 'PROJECT_STATUS_UPDATE', `project_${projectId}`, 'success');
      
      const token = localStorage.getItem('token');
      fetchAdminData(token);
    } catch (error) {
      showError('Erreur lors de la mise à jour');
    }
  };

  const filteredData = (data) => {
    return data.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.user?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement du panneau d'administration...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-welcome">
          <h1>Panneau d'Administration</h1>
          <p>Gérez votre plateforme en temps réel</p>
        </div>
        <div className="admin-user">
          <div className="admin-avatar">
            👨‍💼
          </div>
          <div className="admin-details">
            <strong>{user?.firstName} {user?.lastName}</strong>
            <small>Administrateur</small>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="analytics-section">
        <h2>Vue d'ensemble</h2>
        <div className="analytics-grid">
          <div className="stat-card users">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{analytics.totalUsers}</h3>
              <p>Utilisateurs totaux</p>
              <small className="stat-positive">+{analytics.activeUsers} actifs</small>
            </div>
          </div>
          
          <div className="stat-card orders">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>{analytics.totalOrders}</h3>
              <p>Commandes totales</p>
              <small>{analytics.totalRevenue} DH de revenus</small>
            </div>
          </div>
          
          <div className="stat-card quotes">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{analytics.pendingQuotes}</h3>
              <p>Devis en attente</p>
              <small className="stat-warning">Nécessite attention</small>
            </div>
          </div>
          
          <div className="stat-card projects">
            <div className="stat-icon">🚀</div>
            <div className="stat-info">
              <h3>{analytics.activeProjects}</h3>
              <p>Projets actifs</p>
              <small className="stat-positive">En cours</small>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Vue d'ensemble
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          Utilisateurs ({users.length})
        </button>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          Commandes ({orders.length})
        </button>
        <button className={`tab-btn ${activeTab === 'quotes' ? 'active' : ''}`} onClick={() => setActiveTab('quotes')}>
          Devis ({quotes.length})
        </button>
        <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
          Projets ({projects.length})
        </button>
        <button className="tab-btn logout" onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }}>
          Déconnexion
        </button>
      </div>

      {/* Search and Filter */}
      {(activeTab === 'users' || activeTab === 'orders' || activeTab === 'quotes' || activeTab === 'projects') && (
        <div className="search-filter-bar">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="pending">En attente</option>
            <option value="completed">Terminés</option>
            <option value="in_progress">En cours</option>
          </select>
        </div>
      )}

      {/* Content */}
      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="users-section">
            <h2>Gestion des utilisateurs</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Date d'inscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData(users).map(user => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className="role-badge">{user.role}</span></td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>{new Date(user.joinDate).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn-sm edit" onClick={() => handleUserAction(user.id, 'edit')}>
                            ✏️
                          </button>
                          <button className="action-btn-sm delete" onClick={() => handleUserAction(user.id, 'delete')}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Gestion des commandes</h2>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Plan</th>
                    <th>Prix</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData(orders).map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user}</td>
                      <td>{order.plan}</td>
                      <td>{order.price}</td>
                      <td>{new Date(order.date).toLocaleDateString('fr-FR')}</td>
                      <td>
                        <span className={`status-badge ${order.status}`}>
                          {order.status === 'completed' ? 'Terminée' : order.status === 'in_progress' ? 'En cours' : 'En attente'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn-sm view" onClick={() => info(`Détails de la commande #${order.id}`)}>
                            👁️
                          </button>
                          <button className="action-btn-sm edit" onClick={() => handleUserAction(order.id, 'update_status')}>
                            📝
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="quotes-section">
            <h2>Demandes de devis</h2>
            <div className="quotes-grid">
              {filteredData(quotes).map(quote => (
                <div key={quote.id} className="quote-card">
                  <div className="quote-header">
                    <h3>{quote.name}</h3>
                    <span className={`status-badge ${quote.status}`}>
                      {quote.status === 'new' ? 'Nouveau' : 'Contacté'}
                    </span>
                  </div>
                  <p><strong>Email:</strong> {quote.email}</p>
                  <p><strong>Service:</strong> {quote.service}</p>
                  <p><strong>Message:</strong> {quote.message}</p>
                  <p><small>Date: {new Date(quote.date).toLocaleDateString('fr-FR')}</small></p>
                  <div className="quote-actions">
                    {quote.status === 'new' && (
                      <>
                        <button className="action-btn primary" onClick={() => handleQuoteAction(quote.id, 'contact')}>
                          Contacter
                        </button>
                        <button className="action-btn secondary" onClick={() => handleQuoteAction(quote.id, 'reject')}>
                          Refuser
                        </button>
                      </>
                    )}
                    {quote.status === 'contacted' && (
                      <button className="action-btn tertiary" disabled>
                        Déjà contacté
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="projects-section">
            <h2>Gestion des projets</h2>
            <div className="projects-grid">
              {filteredData(projects).map(project => (
                <div key={project.id} className="project-admin-card">
                  <div className="project-header">
                    <h3>{project.name}</h3>
                    <span className={`status-badge ${project.status}`}>
                      {project.status === 'completed' ? 'Terminé' : project.status === 'in_progress' ? 'En cours' : 'Planification'}
                    </span>
                  </div>
                  <p><strong>Client:</strong> {project.client}</p>
                  <div className="project-progress">
                    <div className="progress-info">
                      <span>Progression: {project.progress}%</span>
                      <small>Délai: {new Date(project.deadline).toLocaleDateString('fr-FR')}</small>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>
                  <div className="project-actions">
                    <button className="action-btn primary" onClick={() => handleProjectUpdate(project.id, 'in_progress')}>
                      Mettre en cours
                    </button>
                    <button className="action-btn secondary" onClick={() => handleProjectUpdate(project.id, 'completed')}>
                      Marquer terminé
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #1e293b;
          color: white;
          padding: 2rem;
        }

        .admin-dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .admin-welcome h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .admin-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .analytics-section {
          margin-bottom: 2rem;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-info h3 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .stat-info p {
          color: #cbd5e1;
          margin-bottom: 0.5rem;
        }

        .stat-positive {
          color: #10b981;
        }

        .stat-warning {
          color: #f59e0b;
        }

        .admin-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 0;
          overflow-x: auto;
        }

        .tab-btn {
          padding: 1rem 2rem;
          background: none;
          border: none;
          font-weight: 600;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          white-space: nowrap;
        }

        .tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .tab-btn.logout {
          margin-left: auto;
          color: #ef4444;
        }

        .search-filter-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-input, .filter-select {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .admin-content {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          backdrop-filter: blur(10px);
        }

        .data-table {
          overflow-x: auto;
        }

        .data-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .data-table th {
          background: rgba(59, 130, 246, 0.1);
          font-weight: 600;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge.active {
          background: #10b981;
          color: white;
        }

        .status-badge.inactive {
          background: #64748b;
          color: white;
        }

        .role-badge {
          background: #3b82f6;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn-sm {
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .quotes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .quote-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .quote-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .quote-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .project-admin-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .project-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .project-progress {
          margin-bottom: 1.5rem;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .progress-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          transition: width 0.3s ease;
        }

        .project-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 1rem;
          }

          .admin-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .admin-tabs {
            overflow-x: scroll;
          }

          .data-table {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
