import React, { useState } from 'react';
import './PaymentModal.css';

function PaymentModal({ isOpen, onClose, amount, serviceName, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Formulaire carte de crédit
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: ''
  });

  // Formulaire PayPal
  const [paypalEmail, setPaypalEmail] = useState('');

  const handleCardChange = (e) => {
    setCardData({
      ...cardData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const paymentData = {
        amount,
        serviceName,
        paymentMethod,
        currency: 'MAD',
        ...(paymentMethod === 'card' ? cardData : { paypalEmail })
      };

      const response = await fetch('http://localhost:5000/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Paiement de ${amount} MAD effectué avec succès !`);
        onPaymentSuccess(data);
        onClose();
      } else {
        setError(data.error || 'Erreur lors du paiement');
      }
    } catch (error) {
      setError('Erreur de connexion au serveur de paiement');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-container">
        <div className="payment-modal-header">
          <h2>💳 Paiement Sécurisé</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="payment-summary">
          <div className="service-info">
            <h3>{serviceName}</h3>
            <div className="amount-display">
              <span className="currency">MAD</span>
              <span className="amount">{amount}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          {/* Sélection du moyen de paiement */}
          <div className="payment-methods">
            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="payment-method-card">
                <span className="card-icon">💳</span>
                <span>Carte de crédit/débit</span>
              </div>
            </label>

            <label className="payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="payment-method-card">
                <span className="paypal-icon">💰</span>
                <span>PayPal</span>
              </div>
            </label>
          </div>

          {paymentMethod === 'card' && (
            <div className="card-payment-form">
              <h4>Informations de la carte</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Numéro de carte</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formatCardNumber(cardData.cardNumber)}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nom sur la carte</label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardData.cardName}
                    onChange={handleCardChange}
                    placeholder="JEAN DUPONT"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date d'expiration</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardData.expiryDate}
                    onChange={handleCardChange}
                    placeholder="MM/AA"
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardChange}
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email de confirmation</label>
                  <input
                    type="email"
                    name="email"
                    value={cardData.email}
                    onChange={handleCardChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="paypal-payment-form">
              <h4>Connexion PayPal</h4>
              <div className="form-group">
                <label>Email PayPal</label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="votre-email@paypal.com"
                  required
                />
              </div>
              <div className="paypal-redirect">
                <p>Vous serez redirigé vers PayPal pour finaliser le paiement</p>
              </div>
            </div>
          )}

          {error && (
            <div className="payment-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="payment-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Traitement...' : `Payer ${amount} MAD`}
            </button>
          </div>

          <div className="security-info">
            <span>🔒 Paiement 100% sécurisé | Chiffrement SSL</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;
