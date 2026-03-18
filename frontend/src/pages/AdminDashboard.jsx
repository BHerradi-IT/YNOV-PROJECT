import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/responsive.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    // Charger les données depuis localStorage
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Charger les utilisateurs
    const userData = localStorage.getItem('users');
    if (userData) {
      const usersList = JSON.parse(userData);
      setUsers(usersList);
      setStats(prev => ({ ...prev, totalUsers: usersList.length }));
    }

    // Charger les logs
    const logsData = localStorage.getItem('systemLogs');
    if (logsData) {
      setLogs(JSON.parse(logsData));
    }

    // Charger les demandes de service
    const requestsData = localStorage.getItem('serviceRequests');
    if (requestsData) {
      const requests = JSON.parse(requestsData);
      setServiceRequests(requests);
      const pending = requests.filter(req => req.status === 'pending').length;
      setStats(prev => ({ ...prev, pendingRequests: pending }));
    }

    // Charger les commandes
    const ordersData = localStorage.getItem('orders');
    if (ordersData) {
      const ordersList = JSON.parse(ordersData);
      setOrders(ordersList);
      setStats(prev => ({ 
        ...prev, 
        totalOrders: ordersList.length,
        totalRevenue: ordersList.reduce((sum, order) => sum + (order.total || 0), 0)
      }));
    }
  };

  const addUser = () => {
    const newUser = {
      id: Date.now(),
      name: prompt('Nom de l\'utilisateur:'),
      email: prompt('Email de l\'utilisateur:'),
      role: 'user',
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    if (newUser.name && newUser.email) {
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Ajouter un log
      addLog('USER_CREATED', `Utilisateur ${newUser.name} créé`);
      loadDashboardData();
    }
  };

  const deleteUser = (userId) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    addLog('USER_DELETED', `Utilisateur ${userId} supprimé`);
    loadDashboardData();
  };

  const updateRequestStatus = (requestId, newStatus) => {
    const updatedRequests = serviceRequests.map(req => 
      req.id === requestId ? { ...req, status: newStatus, updatedAt: new Date().toISOString() } : req
    );
    setServiceRequests(updatedRequests);
    localStorage.setItem('serviceRequests', JSON.stringify(updatedRequests));
    
    addLog('REQUEST_UPDATED', `Demande ${requestId} mise à jour: ${newStatus}`);
    loadDashboardData();
  };

  const addLog = (type, description) => {
    const newLog = {
      id: Date.now(),
      type,
      description,
      timestamp: new Date().toISOString(),
      severity: type.includes('ERROR') ? 'error' : type.includes('SUCCESS') ? 'success' : 'info'
    };

    const updatedLogs = [newLog, ...logs].slice(0, 100); // Garder seulement les 100 derniers logs
    setLogs(updatedLogs);
    localStorage.setItem('systemLogs', JSON.stringify(updatedLogs));
  };

  const exportData = () => {
    const data = {
      users,
      serviceRequests,
      orders,
      logs,
      stats,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ytech-admin-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    addLog('DATA_EXPORTED', 'Export des données administrateur');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Tableau de Bord Administrateur</h1>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={exportData}>
              Exporter les données
            </button>
            <Link to="/" className="btn btn-secondary">
              Retour au site
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Vue d'ensemble
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Utilisateurs
          </button>
          <button 
            className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Demandes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Commandes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </button>
        </div>

        <div className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Utilisateurs</h3>
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">Utilisateurs actifs</div>
                </div>
                <div className="stat-card">
                  <h3>Total Commandes</h3>
                  <div className="stat-value">{stats.totalOrders}</div>
                  <div className="stat-label">Commandes passées</div>
                </div>
                <div className="stat-card">
                  <h3>Revenus Totaux</h3>
                  <div className="stat-value">{stats.totalRevenue.toLocaleString()} DH</div>
                  <div className="stat-label">Revenus générés</div>
                </div>
                <div className="stat-card">
                  <h3>Demandes en attente</h3>
                  <div className="stat-value">{stats.pendingRequests}</div>
                  <div className="stat-label">À traiter</div>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Activité Récente</h3>
                <div className="activity-list">
                  {logs.slice(0, 10).map(log => (
                    <div key={log.id} className={`activity-item ${log.severity}`}>
                      <span className="activity-time">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className="activity-type">{log.type}</span>
                      <span className="activity-description">{log.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h3>Gestion des Utilisateurs</h3>
                <button className="btn" onClick={addUser}>
                  Ajouter un utilisateur
                </button>
              </div>
              
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Date de création</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn btn-danger"
                            onClick={() => deleteUser(user.id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="requests-section">
              <h3>Demandes de Service</h3>
              <div className="requests-grid">
                {serviceRequests.map(request => (
                  <div key={request.id} className="request-card">
                    <div className="request-header">
                      <h4>{request.service}</h4>
                      <span className={`status-badge ${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="request-details">
                      <p><strong>Client:</strong> {request.name}</p>
                      <p><strong>Email:</strong> {request.email}</p>
                      <p><strong>Entreprise:</strong> {request.company || 'N/A'}</p>
                      <p><strong>Description:</strong> {request.projectDescription}</p>
                      <p><strong>Budget:</strong> {request.budget || 'Non spécifié'}</p>
                      <p><strong>Délai:</strong> {request.timeline || 'Non spécifié'}</p>
                    </div>
                    <div className="request-actions">
                      {request.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-success"
                            onClick={() => updateRequestStatus(request.id, 'approved')}
                          >
                            Approuver
                          </button>
                          <button 
                            className="btn btn-danger"
                            onClick={() => updateRequestStatus(request.id, 'rejected')}
                          >
                            Rejeter
                          </button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <button 
                          className="btn"
                          onClick={() => updateRequestStatus(request.id, 'in-progress')}
                        >
                          Démarrer
                        </button>
                      )}
                      {request.status === 'in-progress' && (
                        <button 
                          className="btn btn-success"
                          onClick={() => updateRequestStatus(request.id, 'completed')}
                        >
                          Terminer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h3>Commandes</h3>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID Commande</th>
                      <th>Client</th>
                      <th>Plan</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customerName}</td>
                        <td>{order.planName}</td>
                        <td>{order.total} DH</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="logs-section">
              <div className="section-header">
                <h3>Logs Système</h3>
                <button className="btn btn-secondary" onClick={() => setLogs([])}>
                  Vider les logs
                </button>
              </div>
              
              <div className="logs-container">
                {logs.map(log => (
                  <div key={log.id} className={`log-entry ${log.severity}`}>
                    <div className="log-header">
                      <span className="log-time">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className="log-type">{log.type}</span>
                      <span className={`log-severity ${log.severity}`}>
                        {log.severity}
                      </span>
                    </div>
                    <div className="log-description">
                      {log.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
