const jwt = require('jsonwebtoken');
const pool = require('./config/db');

// Fonction de tracking (simplifiée)
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

app.post('/api/quotes/request', authenticateToken, async (req, res) => {
  try {
    const { serviceId, serviceName, name, email, phone, company, projectDescription, budget, timeline, requirements } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!name || !email || !projectDescription) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }

    // Créer la demande de devis avec la nouvelle structure
    const quoteResult = await pool.query(
      'INSERT INTO quote_requests (user_id, service_id, service_name, name, email, phone, company, project_description, budget, timeline, requirements, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, serviceId || null, serviceName, name, email, phone, company, projectDescription, budget, timeline, requirements, 'pending']
    );

    // Créer aussi une commande pour le suivi
    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, status, total_amount, currency, notes) VALUES (?, ?, 0, "MAD", ?)',
      [userId, 'pending', `Demande de devis - ${serviceName}`]
    );

    const orderId = orderResult.insertId;

    console.log('✅ Quote request created:', { id: quoteResult.insertId, userId, serviceName });

    res.status(201).json({
      message: 'Demande de devis envoyée avec succès',
      quoteId: quoteResult.insertId,
      orderId: orderId,
      data: {
        service: serviceName,
        name: name,
        email: email,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error("❌ Error creating quote request:", error);
    res.status(500).json({ 
      success: false, 
      error: "Erreur lors de la création de la demande de devis" 
    });
  }
});

// API pour obtenir les devis (admin)
app.get('/api/admin/quotes', authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const quotes = await pool.query(
      `SELECT o.*, u.email as user_email, u.first_name, u.last_name,
              oi.custom_requirements
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       JOIN order_items oi ON o.id = oi.order_id 
       WHERE o.notes LIKE '%Demande de devis%'
       ORDER BY o.created_at DESC`
    );

    // Parser les custom_requirements
    quotes.forEach(quote => {
      if (quote.custom_requirements) {
        try {
          quote.custom_requirements = JSON.parse(quote.custom_requirements);
        } catch (e) {
          quote.custom_requirements = {};
        }
      }
    });

    res.json(quotes);
  } catch (error) {
    console.error('Erreur récupération devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour mettre à jour le statut d'un devis
app.put('/api/admin/quotes/:quoteId/status', authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { quoteId } = req.params;
    const { status, amount, currency = 'MAD' } = req.body;

    const validStatuses = ['pending', 'quoted', 'approved', 'rejected', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    // Mettre à jour la commande
    await pool.query(
      'UPDATE orders SET status = ?, total_amount = ?, currency = ?, updated_at = NOW() WHERE id = ?',
      [status, amount || 0, currency, quoteId]
    );

    res.json({ message: 'Devis mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour devis:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
