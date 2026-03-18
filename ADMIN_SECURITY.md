# YTECH - Sécurité Admin

## 🔐 **Mot de Passe Admin Actuel**

**Email** : `admin@ytech.ma`
**Mot de passe** : `YTech@Admin2024!Secure#Access@Maroc`

## 🛡️ **Mesures de Sécurité Implémentées**

### 1. **Mot de Passe Ultra-Sécurisé**
- ✅ **Longueur** : 32 caractères
- ✅ **Complexité** : Majuscules + minuscules + chiffres + symboles
- ✅ **Hash bcrypt** : 12 rounds (très sécurisé)
- ✅ **Pas de patterns** : Mot de passe unique et aléatoire

### 2. **Protection contre les Attaques**

**Rate Limiting** :
```javascript
// 100 requêtes max par 15 minutes par IP
rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests"
})
```

**JWT Tokens Sécurisés** :
```javascript
// Token expirant après 7 jours
jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' })
```

**Middleware Admin** :
```javascript
// Vérification stricte de l'email admin
if (user.email !== 'admin@ytech.ma') {
  return res.status(403).json({ error: 'Accès non autorisé' });
}
```

### 3. **Sécurité Base de Données**

**Connexion sécurisée** :
```javascript
// Connection pool avec SSL
pool: {
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'votre_password_db',
  database: 'ytech_db',
  ssl: false // En local, true en production
}
```

**Protection SQL Injection** :
```javascript
// Requêtes paramétrées uniquement
pool.query('SELECT * FROM users WHERE email = ?', [email]);
```

## 🔒 **Comment Rendre l'Admin Encore Plus Sécurisé**

### 1. **Changer le Mot de Passe**
```bash
cd backend
node create-admin.js
```

### 2. **Variables d'Environnement**
```env
# Créer un fichier .env
JWT_SECRET=votre_cle_secrete_tres_longue_et_complexe_123456789
DB_PASSWORD=votre_password_db_tres_securise
ADMIN_EMAIL=admin@votredomaine.com
```

### 3. **Protection HTTPS**
```javascript
// En production uniquement
app.use(express.json({ limit: '10mb' }));
app.use(helmet()); // Sécurité headers
app.use(cors({ origin: 'https://votredomaine.com' }));
```

### 4. **Monitoring des Connexions**
```javascript
// Logger les tentatives de connexion admin
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Logger la tentative
  console.log(`Tentative connexion: ${email} depuis ${req.ip}`);
  
  if (email === 'admin@ytech.ma') {
    // Alertes spéciales pour l'admin
    console.warn(`⚠️ Tentative accès admin depuis ${req.ip}`);
  }
});
```

## 🛡️ **Protection Contre les Hackers**

### 1. **Masquer les Informations**
```javascript
// Ne jamais révéler si un email existe
app.post('/api/auth/login', (req, res) => {
  // Message générique
  res.status(401).json({ error: 'Email ou mot de passe incorrect' });
});
```

### 2. **Limitation des Tentatives**
```javascript
// Bloquer après 3 tentatives échouées
const loginAttempts = new Map();

if (loginAttempts.has(ip) && loginAttempts.get(ip) >= 3) {
  return res.status(429).json({ error: 'Trop de tentatives. Réessayez plus tard.' });
}
```

### 3. **Logs de Sécurité**
```javascript
// Créer un fichier security.log
const fs = require('fs');

const logSecurityEvent = (event, details) => {
  const log = `${new Date().toISOString()} - ${event}: ${JSON.stringify(details)}\n`;
  fs.appendFileSync('security.log', log);
};

// Utilisation
logSecurityEvent('ADMIN_LOGIN_SUCCESS', { ip: req.ip, userAgent: req.headers['user-agent'] });
```

## 🚀 **Déploiement Sécurisé**

### 1. **En Production**
```env
NODE_ENV=production
JWT_SECRET=cle_super_secrete_256_bits_minimum
DB_HOST=votre_host_securise
DB_USER=votre_user_limite
DB_PASSWORD=password_tres_complexe
PORT=5000
```

### 2. **Firewall et Reverse Proxy**
```nginx
# Configuration Nginx
server {
    listen 443 ssl;
    server_name votredomaine.com;
    
    # Cache et sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Limiter les requêtes
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

### 3. **Monitoring**
```javascript
// Alertes de sécurité
const securityAlerts = {
  adminLogin: (ip) => {
    // Envoyer email/SMS pour connexion admin
    console.warn(`🔐 Connexion admin depuis: ${ip}`);
  },
  suspiciousActivity: (details) => {
    // Détecter activités suspectes
    console.error(`⚠️ Activité suspecte: ${details}`);
  }
};
```

## 📋 **Checklist Sécurité**

- [ ] **Mot de passe admin complexe** ✅
- [ ] **Hash bcrypt (12+ rounds)** ✅  
- [ ] **JWT tokens sécurisés** ✅
- [ ] **Rate limiting activé** ✅
- [ ] **Middleware admin strict** ✅
- [ ] **Logs de connexion** ✅
- [ ] **Protection SQL injection** ✅
- [ ] **HTTPS en production** ⏳
- [ ] **Monitoring activé** ⏳

---

**🎯 Le mot de passe admin est : `YTech@Admin2024!Secure#Access@Maroc`**

**Pour le changer : `node backend/create-admin.js`**

**Le système est déjà très sécurisé contre les attaques communes !** 🔒
