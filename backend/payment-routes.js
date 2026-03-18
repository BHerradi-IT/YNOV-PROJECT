const jwt = require('jsonwebtoken');
const pool = require('./config/db');

// Middleware pour vérifier le token JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'ytech_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    
    req.user = user;
    next();
  });
};

// Fonction de tracking
const trackEvent = async (sessionToken, userId, eventType, pageUrl, serviceId, orderId, metadata = {}) => {
  try {
    if (pool && pool.query) {
      await pool.query(
        'INSERT INTO analytics_events (session_token, user_id, event_type, page_url, service_id, order_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [sessionToken, userId, eventType, pageUrl, serviceId, orderId, JSON.stringify(metadata)]
      );
    }
  } catch (error) {
    console.error('Erreur tracking:', error);
  }
};

// API pour traiter les paiements
app.post('/api/payments/process', authenticateToken, async (req, res) => {
  try {
    const { 
      amount, 
      serviceName, 
      paymentMethod, 
      currency, 
      cardNumber, 
      cardName, 
      expiryDate, 
      cvv, 
      email,
      paypalEmail 
    } = req.body;
    
    const userId = req.user.userId;

    // Validation
    if (!amount || !serviceName || !paymentMethod) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    if (paymentMethod === 'card' && (!cardNumber || !cardName || !expiryDate || !cvv || !email)) {
      return res.status(400).json({ error: 'Informations de carte incomplètes' });
    }

    if (paymentMethod === 'paypal' && !paypalEmail) {
      return res.status(400).json({ error: 'Email PayPal requis' });
    }

    // Simulation de traitement de paiement
    // En production, vous intégreriez Stripe, PayPal SDK, etc.
    const paymentSuccess = await processPayment({
      amount,
      paymentMethod,
      currency: currency || 'MAD',
      userId
    });

    if (!paymentSuccess.success) {
      return res.status(400).json({ error: paymentSuccess.error });
    }

    // Créer l'enregistrement de paiement
    const paymentResult = await pool.query(
      `INSERT INTO payments (
        user_id, amount, currency, status, transaction_id, 
        payment_method, payment_details, service_name, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        amount,
        currency || 'MAD',
        'completed',
        paymentSuccess.transactionId,
        paymentMethod,
        JSON.stringify({
          ...(paymentMethod === 'card' ? {
            cardNumber: `****-****-****-${cardNumber.slice(-4)}`,
            cardName,
            expiryDate
          } : { paypalEmail })
        }),
        serviceName
      ]
    );

    // Créer une commande
    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, status, total_amount, currency, notes) VALUES (?, ?, ?, ?, ?)',
      [userId, 'paid', amount, currency || 'MAD', `Paiement ${serviceName} - ${paymentMethod}`]
    );

    // Tracker l'événement
    await trackEvent(req.sessionToken, userId, 'purchase', null, null, orderResult.insertId, {
      amount,
      paymentMethod,
      serviceName
    });

    res.status(200).json({
      message: 'Paiement effectué avec succès',
      paymentId: paymentResult.insertId,
      orderId: orderResult.insertId,
      transactionId: paymentSuccess.transactionId,
      status: 'completed',
      amount,
      currency: currency || 'MAD'
    });

  } catch (error) {
    console.error('Erreur paiement:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du paiement' });
  }
});

// Simulation de traitement de paiement
async function processPayment(paymentData) {
  // Simuler un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulation de validation (90% de succès pour la démo)
  const successRate = 0.9;
  const isSuccess = Math.random() < successRate;

  if (!isSuccess) {
    return {
      success: false,
      error: 'Paiement refusé. Veuillez vérifier vos informations ou essayer une autre carte.'
    };
  }

  // Générer un ID de transaction unique
  const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

  return {
    success: true,
    transactionId
  };
}

// API pour obtenir l'historique des paiements
app.get('/api/payments/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const payments = await pool.query(
      `SELECT id, amount, currency, status, transaction_id, 
       payment_method, service_name, created_at 
       FROM payments 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      payments: payments[0] || [],
      total: payments[0]?.length || 0
    });

  } catch (error) {
    console.error('Erreur historique paiements:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

// API pour obtenir les détails d'un paiement
app.get('/api/payments/:id', authenticateToken, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user.userId;
    
    const payments = await pool.query(
      'SELECT * FROM payments WHERE id = ? AND user_id = ?',
      [paymentId, userId]
    );

    if (payments[0].length === 0) {
      return res.status(404).json({ error: 'Paiement non trouvé' });
    }

    res.json(payments[0][0]);

  } catch (error) {
    console.error('Erreur détails paiement:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des détails' });
  }
});
