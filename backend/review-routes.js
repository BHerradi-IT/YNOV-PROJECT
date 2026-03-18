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

// API pour soumettre un avis
app.post('/api/reviews/submit', authenticateToken, async (req, res) => {
  try {
    const { 
      rating, 
      name, 
      email, 
      service, 
      message, 
      recommend 
    } = req.body;
    
    const userId = req.user.userId;

    // Validation
    if (!rating || !name || !email || !service || !message) {
      return res.status(400).json({ error: 'Tous les champs requis sont obligatoires' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce service
    const [existingReview] = await pool.query(
      'SELECT id FROM reviews WHERE user_id = ? AND service = ?',
      [userId, service]
    );

    if (existingReview.length > 0) {
      return res.status(400).json({ error: 'Vous avez déjà laissé un avis pour ce service' });
    }

    // Créer l'avis
    const reviewResult = await pool.query(
      `INSERT INTO reviews (
        user_id, rating, name, email, service, message, 
        recommend, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, rating, name, email, service, message, recommend ? 1 : 0, 'pending']
    );

    // Tracker l'événement
    await trackEvent(req.sessionToken, userId, 'review', null, null, null, {
      rating,
      service,
      recommend
    });

    res.status(201).json({
      message: 'Avis soumis avec succès',
      reviewId: reviewResult.insertId,
      status: 'pending_validation'
    });

  } catch (error) {
    console.error('Erreur soumission avis:', error);
    res.status(500).json({ error: 'Erreur lors de la soumission de l\'avis' });
  }
});

// API pour obtenir les avis (public)
app.get('/api/reviews', async (req, res) => {
  try {
    const { service, page = 1, limit = 10 } = req.query;
    
    let query = `
      SELECT r.*, u.nom as user_name 
      FROM reviews r 
      LEFT JOIN users u ON r.user_id = u.id 
      WHERE r.status = 'approved'
    `;
    let params = [];

    if (service) {
      query += ' AND r.service = ?';
      params.push(service);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [reviews] = await pool.query(query, params);

    // Obtenir le nombre total
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM reviews WHERE status = "approved"' + (service ? ' AND service = ?' : ''),
      service ? [service] : []
    );

    res.json({
      reviews: reviews[0] || [],
      total: countResult[0]?.total || 0,
      page: parseInt(page),
      totalPages: Math.ceil((countResult[0]?.total || 0) / parseInt(limit))
    });

  } catch (error) {
    console.error('Erreur récupération avis:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des avis' });
  }
});

// API pour obtenir les avis en attente de validation (admin)
app.get('/api/admin/reviews/pending', authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const [pendingReviews] = await pool.query(
      `SELECT r.*, u.email as user_email 
       FROM reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.status = 'pending' 
       ORDER BY r.created_at DESC`
    );

    res.json({
      reviews: pendingReviews[0] || [],
      total: pendingReviews[0]?.length || 0
    });

  } catch (error) {
    console.error('Erreur avis en attente:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// API pour approuver/rejeter un avis (admin)
app.post('/api/admin/reviews/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const reviewId = req.params.id;
    const { action } = req.body; // 'approve' ou 'reject'

    await pool.query(
      'UPDATE reviews SET status = ? WHERE id = ?',
      [action === 'approve' ? 'approved' : 'rejected', reviewId]
    );

    res.json({
      message: `Avis ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`
    });

  } catch (error) {
    console.error('Erreur validation avis:', error);
    res.status(500).json({ error: 'Erreur lors de la validation de l\'avis' });
  }
});
