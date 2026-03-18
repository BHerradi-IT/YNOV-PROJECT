// API Admin Routes - Protégées et réservées à l'admin

// Middleware pour vérifier si l'utilisateur est admin
const requireAdmin = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'ytech_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    
    // Vérifier si l'utilisateur a le rôle admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    req.user = user;
    next();
  });
};

// API pour obtenir tous les utilisateurs
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await pool.query(
      'SELECT id, email, first_name, last_name, role, created_at, last_login FROM users ORDER BY created_at DESC'
    );
    
    res.json(users[0]);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour obtenir toutes les commandes
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await pool.query(
      `SELECT o.*, u.email as user_email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
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

// API pour mettre à jour le statut d'une commande
app.put('/api/admin/orders/:orderId/status', requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'paid', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    
    await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, orderId]
    );
    
    res.json({ message: 'Statut mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur mise à jour statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour obtenir les analytics
app.get('/api/admin/analytics', requireAdmin, async (req, res) => {
  try {
    // Statistiques générales
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [totalRevenue] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
    
    // Visiteurs aujourd'hui
    const [todayVisitors] = await pool.query(
      'SELECT COUNT(DISTINCT session_token) as count FROM user_sessions WHERE DATE(created_at) = CURDATE()'
    );
    
    // Pages les plus visitées
    const [topPages] = await pool.query(
      'SELECT page_url, COUNT(*) as views FROM analytics_events WHERE event_type = "page_view" GROUP BY page_url ORDER BY views DESC LIMIT 10'
    );
    
    // Services les plus populaires
    const [topServices] = await pool.query(
      `SELECT s.name, COUNT(oi.id) as purchases 
       FROM services s 
       LEFT JOIN order_items oi ON s.id = oi.service_id 
       LEFT JOIN orders o ON oi.order_id = o.id 
       WHERE o.status = "completed" 
       GROUP BY s.id, s.name 
       HAVING purchases > 0 
       ORDER BY purchases DESC 
       LIMIT 10`
    );
    
    res.json({
      totalUsers: totalUsers[0].count,
      totalOrders: totalOrders[0].count,
      totalRevenue: totalRevenue[0].total || 0,
      todayVisitors: todayVisitors[0].count,
      topPages,
      topServices
    });
  } catch (error) {
    console.error('Erreur analytics:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour supprimer un utilisateur (admin uniquement)
app.delete('/api/admin/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Empêcher la suppression de l'admin
    if (userId == 1) {
      return res.status(403).json({ error: 'Impossible de supprimer l\'administrateur' });
    }
    
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// API pour bannir/débannir un utilisateur
app.put('/api/admin/users/:userId/status', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    // Empêcher de bannir l'admin
    if (userId == 1) {
      return res.status(403).json({ error: 'Impossible de modifier l\'administrateur' });
    }
    
    await pool.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, userId]
    );
    
    res.json({ message: `Utilisateur ${isActive ? 'activé' : 'banni'} avec succès` });
  } catch (error) {
    console.error('Erreur modification statut utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
