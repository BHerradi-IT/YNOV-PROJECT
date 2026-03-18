import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/dashboard.css';

function UserDashboard() {
  const { user, token, logout, getAuthHeaders } = useAuth();
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Charger les services de l'utilisateur
  useEffect(() => {
    fetchUserServices();
    fetchUserPayments();
  }, []);

  const fetchUserServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/projects', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data.projects || []);
      }
    } catch (error) {
      console.error('Erreur chargement services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPayments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/user/payments', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
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

  const getProgressPercentage = (service) => {
    if (service.status === 'completed') return 100;
    if (service.status === 'cancelled') return 0;
    if (service.status === 'pending') return 0;
    return service.progress || 50;
  };

  const handlePayment = async (service) => {
    setSelectedService(service);
    setShowPaymentModal(true);
  };

  const processPayment = async (paymentData) => {
    setPaymentProcessing(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/payments/process', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          projectId: selectedService.id,
          amount: selectedService.budget,
          method: paymentMethod,
          ...paymentData
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Paiement effectué avec succès !');
        setShowPaymentModal(false);
        fetchUserServices();
        fetchUserPayments();
      } else {
        alert('Erreur lors du paiement: ' + result.error);
      }
    } catch (error) {
      alert('Erreur de connexion: ' + error.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const openDevisModal = () => {
    window.location.href = '/#pricing';
  };

  if (loading) {
    return (
      <div className="user-dashboard">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Chargement de vos services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="avatar">
            {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="user-details">
            <h2>{user?.firstName || user?.email}</h2>
            <p>Mes Services</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="devis-btn" onClick={openDevisModal}>
            📝 Demander un service
          </button>
          <button className="logout-btn" onClick={logout}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{services.length}</h3>
            <p>Services totaux</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h3>{services.filter(s => s.status === 'in_progress').length}</h3>
            <p>En cours</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{services.filter(s => s.status === 'completed').length}</h3>
            <p>Terminés</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-info">
            <h3>{payments.filter(p => p.status === 'completed').length}</h3>
            <p>Paiements</p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="services-section">
        <h3>Mes Services</h3>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h4>{service.name}</h4>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(service.status) }}
                >
                  {getStatusText(service.status)}
                </span>
              </div>
              
              <div className="service-description">
                <p>{service.description}</p>
              </div>

              {/* Barre de progression */}
              <div className="progress-section">
                <div className="progress-info">
                  <span>Progression</span>
                  <span>{getProgressPercentage(service)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${getProgressPercentage(service)}%`,
                      backgroundColor: getStatusColor(service.status)
                    }}
                  ></div>
                </div>
              </div>

              <div className="service-details">
                <div className="detail-item">
                  <span className="label">Budget:</span>
                  <span className="value">{service.budget ? `${service.budget} MAD` : 'Non défini'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Type:</span>
                  <span className="value">{service.type || 'Service'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Créé le:</span>
                  <span className="value">{new Date(service.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Bouton de paiement */}
              {service.status === 'completed' && !service.paid && (
                <button 
                  className="pay-btn"
                  onClick={() => handlePayment(service)}
                >
                  💳 Payer maintenant
                </button>
              )}
            </div>
          ))}
        </div>
        
        {services.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Aucun service pour le moment</h3>
            <p>Commencez par demander un devis pour votre premier service.</p>
            <button className="cta-btn" onClick={openDevisModal}>
              Demander un devis
            </button>
          </div>
        )}
      </div>

      {/* Historique des paiements */}
      <div className="payments-section">
        <h3>Historique des paiements</h3>
        <div className="payments-list">
          {payments.map((payment) => (
            <div key={payment.id} className="payment-item">
              <div className="payment-info">
                <div className="payment-header">
                  <h4>{payment.description}</h4>
                  <span className={`payment-status ${payment.status}`}>
                    {payment.status === 'completed' ? '✅' : '⏳'} {payment.status}
                  </span>
                </div>
                <div className="payment-details">
                  <div className="detail-item">
                    <span className="label">Montant:</span>
                    <span className="value">{payment.amount} {payment.currency}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Méthode:</span>
                    <span className="value">{payment.method}</span>
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
            <div className="empty-icon">💳</div>
            <h3>Aucun paiement pour le moment</h3>
            <p>Vos paiements apparaîtront ici après avoir finalisé vos services.</p>
          </div>
        )}
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && selectedService && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h3>Payer pour {selectedService.name}</h3>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                ×
              </button>
            </div>
            
            <div className="payment-summary">
              <div className="summary-item">
                <span>Montant à payer:</span>
                <span className="amount">{selectedService.budget} MAD</span>
              </div>
            </div>

            <div className="payment-methods">
              <h4>Méthode de paiement</h4>
              <div className="method-options">
                <label className="method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="method-card">
                    <div className="method-icon">💳</div>
                    <div className="method-info">
                      <h5>Carte de débit/crédit</h5>
                      <p>Payer avec votre carte bancaire</p>
                    </div>
                  </div>
                </label>
                
                <label className="method-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="method-card">
                    <div className="method-icon">💰</div>
                    <div className="method-info">
                      <h5>PayPal</h5>
                      <p>Payer avec votre compte PayPal</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Formulaire de paiement selon la méthode choisie */}
            {paymentMethod === 'card' && (
              <CardPaymentForm 
                onPayment={processPayment}
                processing={paymentProcessing}
                amount={selectedService.budget}
              />
            )}
            
            {paymentMethod === 'paypal' && (
              <PayPalPayment 
                onPayment={processPayment}
                processing={paymentProcessing}
                amount={selectedService.budget}
                serviceName={selectedService.name}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour le paiement par carte
function CardPaymentForm({ onPayment, processing, amount }) {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onPayment(cardData);
  };

  return (
    <form className="card-payment-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Nom sur la carte</label>
          <input
            type="text"
            value={cardData.cardName}
            onChange={(e) => setCardData({...cardData, cardName: e.target.value})}
            required
            placeholder="Jean Dupont"
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Numéro de carte</label>
          <input
            type="text"
            value={cardData.cardNumber}
            onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
            required
            placeholder="1234 5678 9012 3456"
            maxLength={19}
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Date d'expiration</label>
          <input
            type="text"
            value={cardData.expiryDate}
            onChange={(e) => setCardData({...cardData, expiryDate: e.target.value})}
            required
            placeholder="MM/AA"
            maxLength={5}
          />
        </div>
        
        <div className="form-group">
          <label>CVV</label>
          <input
            type="text"
            value={cardData.cvv}
            onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
            required
            placeholder="123"
            maxLength={4}
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        className="pay-submit-btn"
        disabled={processing}
      >
        {processing ? 'Traitement...' : `Payer ${amount} MAD`}
      </button>
    </form>
  );
}

// Composant pour le paiement PayPal
function PayPalPayment({ onPayment, processing, amount, serviceName }) {
  const [paypalReady, setPaypalReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPaypalReady(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePayPalPayment = () => {
    onPayment({
      method: 'paypal',
      paypalEmail: 'user@example.com',
      transactionId: 'PAYPAL_' + Date.now()
    });
  };

  return (
    <div className="paypal-payment">
      {!paypalReady ? (
        <div className="loading-paypal">
          <div className="spinner"></div>
          <p>Chargement de PayPal...</p>
        </div>
      ) : (
        <div className="paypal-content">
          <div className="paypal-info">
            <p>Vous serez redirigé vers PayPal pour finaliser le paiement.</p>
            <p><strong>Montant:</strong> {amount} MAD</p>
            <p><strong>Service:</strong> {serviceName}</p>
          </div>
          
          <button 
            className="paypal-btn"
            onClick={handlePayPalPayment}
            disabled={processing}
          >
            {processing ? 'Traitement...' : '🔐 Continuer avec PayPal'}
          </button>
          
          <div className="paypal-notice">
            <p>En cliquant, vous acceptez les conditions de PayPal.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
