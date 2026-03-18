import React,{ useState, useEffect } from 'react';
import '../styles/responsive.css';

function DashboardNew() {
  const [user, setUser] = useState(null);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const userData = localStorage.getItem('user');
    if (!userData) {
      window.location.href = '/login';
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Charger les demandes de service
    const requests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const userRequests = requests.filter(req => req.userId === parsedUser.id);
    setServiceRequests(userRequests);
    
    // Charger le panier
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(cartData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const updateRequestStatus = (requestId, newStatus) => {
    const updatedRequests = serviceRequests.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    );
    setServiceRequests(updatedRequests);
    
    // Mettre à jour localStorage
    const allRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]');
    const updatedAllRequests = allRequests.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    );
    localStorage.setItem('serviceRequests', JSON.stringify(updatedAllRequests));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const getProgressPercentage = (status) => {
    switch(status) {
      case 'pending': return 0;
      case 'in_progress': return 50;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  if (!user) {
    return <div>Chargement...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem 0', 
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                Tableau de bord
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Bienvenue, {user.firstName || user.name}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 24px' }}>
        {/* Stats Cards */}
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                📋
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', margin: 0 }}>{serviceRequests.length}</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>Demandes de service</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                ✅
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', margin: 0 }}>
                  {serviceRequests.filter(req => req.status === 'completed').length}
                </h3>
                <p style={{ margin: 0, color: '#6b7280' }}>Projets terminés</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem'
              }}>
                🛒
              </div>
              <div>
                <h3 style={{ fontSize: '2rem', margin: 0 }}>{cart.length}</h3>
                <p style={{ margin: 0, color: '#6b7280' }}>Articles au panier</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {['overview', 'requests', 'cart'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 1.5rem',
                background: activeTab === tab ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                color: activeTab === tab ? '#6366f1' : '#6b7280',
                fontWeight: activeTab === tab ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {tab === 'overview' ? 'Aperçu' : tab === 'requests' ? 'Mes demandes' : 'Panier'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Aperçu général</h2>
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Activité récente</h3>
              {serviceRequests.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                  Vous n'avez pas encore de demandes de service. 
                  <a href="/#services" style={{ color: '#6366f1', textDecoration: 'none' }}>
                    {' '}Découvrez nos services
                  </a>
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {serviceRequests.slice(0, 5).map(request => (
                    <div key={request.id} style={{ 
                      padding: '1rem', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: 0 }}>{request.service}</h4>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                          {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px', 
                        fontSize: '0.875rem',
                        background: getStatusColor(request.status) + '20',
                        color: getStatusColor(request.status)
                      }}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Mes demandes de service</h2>
            {serviceRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <h3>Aucune demande de service</h3>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                  Commencez par demander un devis pour voir son avancement ici
                </p>
                <a href="/#services" className="btn">
                  Découvrir nos services
                </a>
              </div>
            ) : (
              <div className="grid grid-2">
                {serviceRequests.map(request => (
                  <div key={request.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <h3>{request.service}</h3>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '20px', 
                        fontSize: '0.875rem',
                        background: getStatusColor(request.status) + '20',
                        color: getStatusColor(request.status)
                      }}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Progression</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                          {getProgressPercentage(request.status)}%
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        background: '#e5e7eb', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${getProgressPercentage(request.status)}%`, 
                          height: '100%', 
                          background: getStatusColor(request.status),
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                    
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      Demandé le {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    
                    {request.status === 'pending' && (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => updateRequestStatus(request.id, 'cancelled')}
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cart' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Mon panier</h2>
            {cart.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                <h3>Panier vide</h3>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                  Découvrez nos services et ajoutez-les à votre panier
                </p>
                <a href="/#pricing" className="btn">
                  Voir les tarifs
                </a>
              </div>
            ) : (
              <div className="grid grid-2">
                {cart.map(item => (
                  <div key={item.id} className="card">
                    <h3>{item.name}</h3>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6366f1', margin: '1rem 0' }}>
                      {item.price} DH
                    </div>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                      {item.description}
                    </p>
                    <button className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
                      Retirer du panier
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardNew;
