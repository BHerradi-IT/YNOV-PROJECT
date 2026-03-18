// API Routes pour l'authentification
module.exports = (app) => {
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, firstName, lastName } = req.body;
    
    // Validation simplifiée pour debug
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email et mot de passe sont requis'
      });
    }
    
    console.log('📧 Debug - Données reçues:', { email, password, name, firstName });
    
    // Supporter les deux formats: name ou firstName/lastName
    const finalFirstName = firstName || name || 'Test';
    const finalLastName = lastName || '';
    
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Mot de passe minimum 6 caractères'
      });
    }
    
    // Validation email simplifiée
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Email invalide'
      });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const cleanEmail = email.trim().toLowerCase();
    
    const [existingUser] = await pool.query(
      'SELECT id, email FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );
    
    if (existingUser.length > 0) {
      return res.status(409).json({ 
        error: 'Email déjà utilisé',
        details: { email: 'Cet email est déjà enregistré' }
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (email, password, nom, prenom, role, is_active) VALUES (?, ?, ?, ?, "user", TRUE)',
      [cleanEmail, hashedPassword, finalLastName, finalFirstName]
    );
    
    // Créer le token JWT
    const token = jwt.sign(
      { userId: result.insertId, email: cleanEmail, authType: 'email', role: 'user' },
      process.env.JWT_SECRET || 'ytech_secret_key',
      { expiresIn: '7d' }
    );
    
    console.log('✅ New user registered:', { id: result.insertId, email: cleanEmail });
    
    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: result.insertId,
        email: cleanEmail,
        name: finalFirstName,
        firstName: finalFirstName,
        lastName: finalLastName,
        role: 'user',
        authType: 'email'
      }
    });
    
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'inscription',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    // Vérifier si l'utilisateur existe
    const [user] = await pool.query(
      'SELECT id, email, password, nom, prenom, role, is_active FROM users WHERE email = ?',
      [email]
    );

    if (user.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const userData = user[0];

    // Vérifier si le compte est actif
    if (!userData.is_active) {
      return res.status(401).json({ error: 'Compte désactivé' });
    }

    // Vérifier le mot de passe
    let validPassword = false;
    if (userData.password) {
      // Authentification par email/mot de passe
      validPassword = await bcrypt.compare(password, userData.password);
    }
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    
    // Mettre à jour last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userData.id]);
    
    // Créer le token JWT
    const token = jwt.sign(
      { userId: userData.id, email: userData.email, authType: 'email', role: userData.role || 'user' },
      process.env.JWT_SECRET || 'ytech_secret_key',
      { expiresIn: '7d' }
    );
    
    // Tracker l'événement
    await trackEvent(req.sessionToken, userData.id, 'login', null, null);
    
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.prenom,
        lastName: userData.nom,
        role: userData.role || 'user'
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route Google OAuth (simplifiée)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, avatarUrl } = req.body;
    
    if (!googleId || !email) {
      return res.status(400).json({ error: 'Google ID et email requis' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await pool.query(
      'SELECT id, email, nom, prenom, role, is_active FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser.length === 0) {
      // Créer un nouvel utilisateur Google
      const result = await pool.query(
        'INSERT INTO users (email, nom, prenom, role, is_active) VALUES (?, ?, ?, "user", TRUE)',
        [email, lastName || '', firstName || '']
      );
      
      const userId = result.insertId;
      
      // Créer le token JWT
      const token = jwt.sign(
        { userId, email, authType: 'google', role: 'user' },
        process.env.JWT_SECRET || 'ytech_secret_key',
        { expiresIn: '7d' }
      );
      
      // Tracker l'événement
      await trackEvent(req.sessionToken, userId, 'signup', null, null);
      
      res.status(201).json({
        message: 'Compte Google créé avec succès',
        token,
        user: {
          id: userId,
          email,
          firstName: firstName || '',
          lastName: lastName || '',
          role: 'user'
        }
      });
    } else {
      // Utilisateur existe, le connecter
      const userData = existingUser[0];
      
      // Mettre à jour last_login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userData.id]);
      
      // Créer le token JWT
      const token = jwt.sign(
        { userId: userData.id, email: userData.email, authType: 'google', role: userData.role || 'user' },
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
          firstName: userData.prenom,
          lastName: userData.nom,
          role: userData.role || 'user'
        }
      });
    }
  } catch (error) {
    console.error('Erreur Google auth:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

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
      'SELECT id, email, nom, prenom, avatar_url, auth_type, created_at, last_login FROM users WHERE id = ?',
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
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
};
