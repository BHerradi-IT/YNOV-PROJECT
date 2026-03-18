# YTECH - Accès Utilisateurs et Logs

## 🔍 **Où Trouver les Utilisateurs et Logs**

### 👥 **Utilisateurs Enregistrés**

**Base de données MariaDB** :
```sql
-- Voir tous les utilisateurs
SELECT * FROM users;

-- Voir utilisateurs avec détails
SELECT id, email, first_name, last_name, auth_type, created_at, last_login FROM users ORDER BY created_at DESC;

-- Voir uniquement les clients (non-admin)
SELECT * FROM users WHERE email != 'admin@ytech.ma';

-- Voir l'admin
SELECT * FROM users WHERE email = 'admin@ytech.ma';
```

**Dashboard Admin** :
- ✅ **URL** : http://localhost:3000/admin
- ✅ **Email admin** : `admin@ytech.ma`
- ✅ **Section "Utilisateurs"** → Liste complète avec détails

### 📊 **Logs et Analytics**

**Base de données Analytics** :
```sql
-- Voir toutes les sessions
SELECT * FROM user_sessions ORDER BY created_at DESC;

-- Voir les événements de tracking
SELECT * FROM analytics_events ORDER BY created_at DESC;

-- Voir les inscriptions
SELECT * FROM analytics_events WHERE event_type = 'signup';

-- Voir les connexions
SELECT * FROM analytics_events WHERE event_type = 'login';

-- Voir les ajouts au panier
SELECT * FROM analytics_events WHERE event_type = 'add_to_cart';

-- Voir les pages visitées
SELECT page_url, COUNT(*) as views FROM analytics_events WHERE event_type = 'page_view' GROUP BY page_url;
```

**Dashboard Admin** :
- ✅ **Section "Analytics"** → Pages populaires, services populaires
- ✅ **Statistiques globales** → Utilisateurs, commandes, revenus

### 🛒 **Commandes et Devis**

**Base de données Commandes** :
```sql
-- Voir toutes les commandes
SELECT * FROM orders ORDER BY created_at DESC;

-- Voir les commandes avec détails utilisateurs
SELECT o.*, u.email as user_email FROM orders o JOIN users u ON o.user_id = u.id;

-- Voir les items de commandes
SELECT oi.*, o.order_number FROM order_items oi JOIN orders o ON oi.order_id = o.id;

-- Voir les demandes de devis
SELECT o.*, u.email as user_email, oi.custom_requirements 
FROM orders o 
JOIN users u ON o.user_id = u.id 
JOIN order_items oi ON o.id = oi.order_id 
WHERE o.notes LIKE '%Demande de devis%';
```

**Dashboard Admin** :
- ✅ **Section "Commandes"** → Gestion complète des commandes
- ✅ **Mettre à jour statut** → En attente, payée, terminée, etc.

### 🔐 **Accès Direct**

**1. Accéder à la base de données** :
```bash
# Connexion MariaDB
mysql -u root -p
USE ytech_db;
```

**2. Accéder au dashboard admin** :
- URL : http://localhost:3000/admin
- Email : admin@ytech.ma
- Mot de passe : celui que vous avez défini

**3. Voir les logs du serveur** :
```bash
# Logs backend
cd c:\xampp\htdocs\ytech-ai-website\backend
npm run dev

# Console du navigateur (F12) → Network → Voir les requêtes API
```

### 📱 **Où Voir Quoi**

| Information | Où le trouver | Comment y accéder |
|-------------|----------------|------------------|
| **Liste utilisateurs** | Dashboard Admin | http://localhost:3000/admin |
| **Détails utilisateurs** | Base de données | `SELECT * FROM users` |
| **Sessions actives** | Base de données | `SELECT * FROM user_sessions` |
| **Logs de navigation** | Base de données | `SELECT * FROM analytics_events` |
| **Commandes clients** | Dashboard Admin | Section "Commandes" |
| **Demandes de devis** | Dashboard Admin | Section "Commandes" |
| **Statistiques globales** | Dashboard Admin | Section "Vue d'ensemble" |
| **Pages populaires** | Dashboard Admin | Section "Analytics" |

### 🚀 **Accès Rapide**

**Pour voir les utilisateurs maintenant** :
1. **Allez sur** : http://localhost:3000/admin
2. **Connectez-vous** avec `admin@ytech.ma`
3. **Cliquez sur** "Utilisateurs" → Liste complète

**Pour voir les logs** :
1. **Base de données** : `SELECT * FROM analytics_events`
2. **Dashboard admin** : Section "Analytics"
3. **Console backend** : Logs en temps réel

---

**🎯 Résumé : Les utilisateurs et logs sont accessibles via le dashboard admin et directement dans la base de données MariaDB !**
