const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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

// Middleware pour tracking des visiteurs
const trackVisitor = async (req, res, next) => {
  try {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    // Créer ou mettre à jour la session
    const sessionToken = req.headers['x-session-token'] || crypto.randomBytes(32).toString('hex');
    
    const existingSession = await pool.query(
      'SELECT * FROM user_sessions WHERE session_token = ? AND is_active = 1 AND expires_at > NOW()',
      [sessionToken]
    );
    
    if (existingSession.length === 0) {
      // Nouvelle session
      await pool.query(
        'INSERT INTO user_sessions (session_token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))',
        [sessionToken, ipAddress, userAgent]
      );
    } else {
      // Mettre à jour la session existante
      await pool.query(
        'UPDATE user_sessions SET page_views = page_views + 1, last_activity = NOW() WHERE session_token = ?',
        [sessionToken]
      );
    }
    
    req.sessionToken = sessionToken;
    next();
  } catch (error) {
    console.error('Erreur tracking:', error);
    next();
  }
};

// API Routes pour l'authentification
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Tous les champs requis' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mot de passe minimum 6 caractères' });
    }
    
    // Vérifier si l'email existe déjà
    const existingUser = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, auth_type, email_verified) VALUES (?, ?, ?, ?, "email", FALSE)',
      [email, hashedPassword, firstName, lastName]
    );
    
    // Créer le token JWT
    const token = jwt.sign(
      { userId: result.insertId, email, authType: 'email' },
      process.env.JWT_SECRET || 'ytech_secret_key',
      { expiresIn: '7d' }
    );
    
    // Tracker l'événement
    await trackEvent(req.sessionToken, result.insertId, 'signup', null, null);
    
    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        authType: 'email'
      }
    });
    
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    // Trouver l'utilisateur
    const users = await pool.query(
      'SELECT id, email, password, first_name, last_name, auth_type, is_active FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    const user = users[0];
    
    if (!user.is_active) {
      return res.status(401).json({ error: 'Compte désactivé' });
    }
    
    if (user.auth_type === 'email') {
      // Vérifier le mot de passe
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Identifiants invalides' });
      }
    }
    
    // Mettre à jour last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    
    // Créer le token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, authType: user.auth_type },
      process.env.JWT_SECRET || 'ytech_secret_key',
      { expiresIn: '7d' }
    );
    
    // Tracker l'événement
    await trackEvent(req.sessionToken, user.id, 'login', null, null);
    
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        authType: user.auth_type
      }
    });
    
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route Google OAuth (simplifiée)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, avatarUrl } = req.body;
    
    if (!googleId || !email) {
      return res.status(400).json({ error: 'Données Google incomplètes' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    let user = await pool.query('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email]);
    
    if (user.length === 0) {
      // Créer un nouvel utilisateur Google
      const result = await pool.query(
        'INSERT INTO users (email, first_name, last_name, google_id, auth_type, email_verified, avatar_url) VALUES (?, ?, ?, ?, "google", TRUE, ?)',
        [email, firstName, lastName, googleId, avatarUrl || null]
      );
      
      user = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    } else {
      // Mettre à jour si nécessaire
      if (!user[0].google_id) {
        await pool.query('UPDATE users SET google_id = ?, auth_type = "google", email_verified = TRUE WHERE id = ?', [googleId, user[0].id]);
        user[0].google_id = googleId;
        user[0].auth_type = 'google';
        user[0].email_verified = true;
      }
      
      // Mettre à jour last_login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user[0].id]);
    }
    
    const userData = user[0];
    
    // Créer le token JWT
    const token = jwt.sign(
      { userId: userData.id, email: userData.email, authType: userData.auth_type },
      process.env.JWT_SECRET || 'ytech_secret_key',
      { expiresIn: '7d' }
    );
    
    // Tracker l'événement
    await trackEvent(req.sessionToken, userData.id, 'login', null, null);
    
    res.json({
      message: 'Connexion Google réussie',
      token,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        authType: userData.auth_type,
        avatarUrl: userData.avatar_url
      }
    });
    
  } catch (error) {
    console.error('Erreur Google OAuth:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonction pour tracker les événements
async function trackEvent(sessionId, userId, eventType, pageUrl, serviceId, orderId = null, metadata = null) {
  try {
    await pool.query(
      'INSERT INTO analytics_events (session_id, user_id, event_type, page_url, service_id, order_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sessionId, userId, eventType, pageUrl, serviceId, orderId, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (error) {
    console.error('Erreur tracking événement:', error);
  }
}

// API pour obtenir les services
app.get('/api/services', async (req, res) => {
  try {
    const services = await pool.query(
      'SELECT * FROM services WHERE is_active = 1 ORDER BY is_popular DESC, name ASC'
    );
    
    // Parser les features JSON
    services.forEach(service => {
      if (service.features) {
        service.features = JSON.parse(service.features);
      }
    });
    
    res.json(services);
  } catch (error) {
    console.error('Erreur services:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour ajouter au panier
app.post('/api/cart/add', authenticateToken, async (req, res) => {
  try {
    const { serviceId, quantity = 1, customRequirements } = req.body;
    const userId = req.user.userId;
    
    if (!serviceId) {
      return res.status(400).json({ error: 'ID service requis' });
    }
    
    // Vérifier si le service existe
    const service = await pool.query('SELECT * FROM services WHERE id = ? AND is_active = 1', [serviceId]);
    if (service.length === 0) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    
    // Vérifier s'il y a déjà une commande en cours pour cet utilisateur
    let existingOrder = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? AND status = "pending"',
      [userId]
    );
    
    let orderId;
    if (existingOrder.length === 0) {
      // Créer une nouvelle commande
      const result = await pool.query(
        'INSERT INTO orders (user_id, status, total_amount, currency) VALUES (?, "pending", 0, "MAD")',
        [userId]
      );
      orderId = result.insertId;
    } else {
      orderId = existingOrder[0].id;
    }
    
    // Vérifier si le service est déjà dans la commande
    const existingItem = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ? AND service_id = ?',
      [orderId, serviceId]
    );
    
    if (existingItem.length > 0) {
      return res.status(400).json({ error: 'Service déjà dans le panier' });
    }
    
    // Ajouter l'item
    const unitPrice = service[0].price;
    const totalPrice = unitPrice * quantity;
    
    await pool.query(
      'INSERT INTO order_items (order_id, service_id, quantity, unit_price, total_price, custom_requirements) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, serviceId, quantity, unitPrice, totalPrice, customRequirements || null]
    );
    
    // Mettre à jour le total de la commande
    await updateOrderTotal(orderId);
    
    // Tracker l'événement
    await trackEvent(req.sessionToken, userId, 'add_to_cart', null, serviceId, orderId);
    
    res.json({ message: 'Service ajouté au panier' });
    
  } catch (error) {
    console.error('Erreur panier:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Fonction pour mettre à jour le total d'une commande
async function updateOrderTotal(orderId) {
  const result = await pool.query(
    'SELECT SUM(total_price) as total FROM order_items WHERE order_id = ?',
    [orderId]
  );
  
  const total = result[0].total || 0;
  
  await pool.query(
    'UPDATE orders SET total_amount = ? WHERE id = ?',
    [total, orderId]
  );
}

// API pour obtenir le panier
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const order = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? AND status = "pending"',
      [userId]
    );
    
    if (order.length === 0) {
      return res.json({ items: [], total: 0, orderNumber: null });
    }
    
    const orderData = order[0];
    
    const items = await pool.query(
      `SELECT oi.*, s.name as service_name, s.description as service_description, s.image_url 
       FROM order_items oi 
       JOIN services s ON oi.service_id = s.id 
       WHERE oi.order_id = ?`,
      [orderData.id]
    );
    
    res.json({
      items,
      total: orderData.total_amount,
      orderNumber: orderData.order_number
    });
    
  } catch (error) {
    console.error('Erreur panier:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour obtenir le profil utilisateur
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await pool.query(
      'SELECT id, email, first_name, last_name, avatar_url, auth_type, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(user[0]);
    
  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour obtenir les commandes de l'utilisateur
app.get('/api/user/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const orders = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    // Pour chaque commande, obtenir les items
    for (const order of orders) {
      const items = await pool.query(
        `SELECT oi.*, s.name as service_name 
         FROM order_items oi 
         JOIN services s ON oi.service_id = s.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }
    
    res.json(orders);
    
  } catch (error) {
    console.error('Erreur commandes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
