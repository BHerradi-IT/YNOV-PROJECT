import React, { useState, useEffect } from 'react';
import { useSecurity } from './SecurityContext';

// Composant Panier avec fonctionnalités complètes
function ShoppingCart({ isOpen, onClose, onCheckout }) {
  const { auditUserAction } = useSecurity();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    tax: 0,
    total: 0
  });

  // Charger les articles du panier depuis le localStorage ou l'API
  useEffect(() => {
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen]);

  // Calculer le résumé de la commande
  useEffect(() => {
    calculateOrderSummary();
  }, [cartItems, discount]);

  const loadCartItems = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Charger depuis l'API
        const response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        }
      } else {
        // Charger depuis le localStorage
        const stored = localStorage.getItem('cartItems');
        if (stored) {
          setCartItems(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      // En cas d'erreur, essayer le localStorage
      const stored = localStorage.getItem('cartItems');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateOrderSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
    
    const tax = subtotal * 0.2; // TVA 20%
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal + tax - discountAmount;
    
    setOrderSummary({
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: Math.max(0, total).toFixed(2)
    });
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedItems);
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`/api/cart/update/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        });
      } else {
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      }
      
      auditUserAction(
        localStorage.getItem('userId') || 'anonymous',
        'UPDATE_CART_QUANTITY',
        `item_${itemId}`,
        'success'
      );
    } catch (error) {
      console.error('Erreur mise à jour quantité:', error);
    }
  };

  const removeItem = async (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`/api/cart/remove/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      }
      
      auditUserAction(
        localStorage.getItem('userId') || 'anonymous',
        'REMOVE_FROM_CART',
        `item_${itemId}`,
        'success'
      );
    } catch (error) {
      console.error('Erreur suppression article:', error);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: promoCode })
      });
      
      if (response.ok) {
        const data = await response.json();
        setDiscount(data.discount || 0);
        
        const event = new CustomEvent('showToast', {
          detail: {
            message: `Code promo appliqué : ${data.discount}% de réduction !`,
            type: 'success'
          }
        });
        window.dispatchEvent(event);
      } else {
        const event = new CustomEvent('showToast', {
          detail: {
            message: 'Code promo invalide ou expiré',
            type: 'error'
          }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Erreur validation promo:', error);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Votre panier est vide',
          type: 'warning'
        }
      });
      window.dispatchEvent(event);
      return;
    }
    
    // Sauvegarder le résumé de la commande
    localStorage.setItem('orderSummary', JSON.stringify({
      items: cartItems,
      summary: orderSummary,
      discount,
      promoCode
    }));
    
    auditUserAction(
      localStorage.getItem('userId') || 'anonymous',
      'INITIATE_CHECKOUT',
      'cart',
      'success'
    );
    
    if (onCheckout) {
      onCheckout();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay">
      <div className="cart-modal">
        <div className="cart-header">
          <h2>Votre Panier</h2>
          <button className="close-btn" onClick={onClose} aria-label="Fermer le panier">
            ×
          </button>
        </div>
        
        <div className="cart-content">
          {loading ? (
            <div className="cart-loading">
              <div className="spinner"></div>
              <p>Chargement de votre panier...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-icon">🛒</div>
              <h3>Votre panier est vide</h3>
              <p>Découvrez nos services et ajoutez vos préférés</p>
              <button className="continue-shopping-btn" onClick={onClose}>
                Continuer vos achats
              </button>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p className="item-price">{item.price} {item.currency}</p>
                    </div>
                    
                    <div className="item-quantity">
                      <button 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        aria-label="Diminuer la quantité"
                      >
                        -
                      </button>
                      <span>{item.quantity || 1}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        aria-label="Augmenter la quantité"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      className="remove-item-btn"
                      onClick={() => removeItem(item.id)}
                      aria-label="Supprimer l'article"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-promo">
                <input
                  type="text"
                  placeholder="Code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                />
                <button onClick={applyPromoCode} disabled={!promoCode.trim()}>Appliquer</button>
              </div>
              
              <div className="cart-summary">
                <div className="summary-row">
                  <span>Sous-total:</span>
                  <span>{orderSummary.subtotal} DH</span>
                </div>
                <div className="summary-row">
                  <span>TVA (20%):</span>
                  <span>{orderSummary.tax} DH</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span>Réduction ({discount}%):</span>
                    <span>-{(orderSummary.subtotal * discount / 100).toFixed(2)} DH</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>{orderSummary.total} DH</span>
                </div>
              </div>
              
              <div className="cart-actions">
                <button className="continue-shopping-btn" onClick={onClose}>
                  Continuer les achats
                </button>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Passer la commande
                </button>
              </div>
            </>
          )}
        </div>
        
        <style jsx>{`
          .cart-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: flex;
            justify-content: flex-end;
          }
          
          .cart-modal {
            width: 100%;
            max-width: 500px;
            background: white;
            height: 100vh;
            overflow-y: auto;
            animation: slideIn 0.3s ease;
          }
          
          .cart-header {
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .cart-header h2 {
            margin: 0;
            color: #1e293b;
          }
          
          .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #64748b;
            padding: 5px;
          }
          
          .cart-content {
            padding: 20px;
          }
          
          .cart-loading {
            text-align: center;
            padding: 40px;
          }
          
          .spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          
          .cart-empty {
            text-align: center;
            padding: 40px;
          }
          
          .empty-icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          
          .cart-item {
            display: flex;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .item-info {
            flex: 1;
          }
          
          .item-info h4 {
            margin: 0 0 5px;
            color: #1e293b;
            font-size: 16px;
          }
          
          .item-price {
            margin: 0;
            color: #64748b;
            font-weight: 600;
          }
          
          .item-quantity {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 0 15px;
          }
          
          .item-quantity button {
            width: 30px;
            height: 30px;
            border: 1px solid #d1d5db;
            background: white;
            border-radius: 4px;
            cursor: pointer;
          }
          
          .remove-item-btn {
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            padding: 5px;
          }
          
          .cart-promo {
            display: flex;
            gap: 10px;
            margin: 20px 0;
          }
          
          .cart-promo input {
            flex: 1;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
          }
          
          .cart-promo button {
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          
          .cart-summary {
            margin: 20px 0;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          
          .summary-row.total {
            font-weight: bold;
            font-size: 18px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
          }
          
          .summary-row.discount {
            color: #059669;
          }
          
          .cart-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
          }
          
          .continue-shopping-btn {
            flex: 1;
            padding: 15px;
            border: 2px solid #d1d5db;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
          
          .checkout-btn {
            flex: 2;
            padding: 15px;
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
          
          @keyframes slideIn {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default ShoppingCart;
