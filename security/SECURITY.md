# YTECH Security Guidelines

## 🔐 Sécurité du Backend

### 1. Variables d'Environnement
- Jamais exposer `.env` dans Git
- Utiliser des secrets forts pour JWT
- Changer les clés par défaut

### 2. Base de Données
- Utiliser des prepared statements
- Limiter les permissions utilisateur
- Activer les logs MariaDB

### 3. Rate Limiting
```javascript
// Configuration actuelle : 100 requêtes/15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
})
```

### 4. Validation d'Entrée
- Valider tous les inputs utilisateur
- Limiter la taille des données
- Échapper les caractères spéciaux

## 🛡️ Sécurité Frontend

### 1. HTTPS
- Forcer HTTPS en production
- Utiliser HSTS headers
- Certificat SSL valide

### 2. Content Security Policy
```javascript
// À ajouter dans les headers nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
```

### 3. Protection XSS
- Échapper les données utilisateur
- Utiliser `dangerouslySetInnerHTML` avec précaution
- Valider les entrées formulaire

## 🔍 Audit & Monitoring

### 1. Logs d'Audit
- Table `audit_logs` pour les actions sensibles
- Logger les connexions admin
- Surveiller les erreurs 4xx/5xx

### 2. Monitoring
```bash
# Health check API
curl https://your-domain.com/api/health

# PM2 monitoring
pm2 monit
```

### 3. Alertes
- Surveiller l'utilisation CPU/mémoire
- Alertes sur tentatives d'intrusion
- Notifications erreurs critiques

## 🚨 Mesures d'Urgence

### 1. Incident Response
1. Isoler le serveur
2. Analyser les logs
3. Identifier la faille
4. Appliquer le patch
5. Notifier les utilisateurs

### 2. Backup Strategy
- Backups quotidiens automatiques
- Stockage externe sécurisé
- Tests de restauration réguliers

### 3. Recovery Plan
- Procédures de restauration BDD
- Rollback application
- Communication crise

## 📋 Checklist Sécurité

### Déploiement
- [ ] Variables d'environnement configurées
- [ ] SSL/TLS activé
- [ ] Firewall configuré
- [ ] Rate limiting activé
- [ ] Logs d'audit activés

### Maintenance
- [ ] Mises à jour régulières
- [ ] Scan vulnérabilités
- [ ] Review logs d'accès
- [ ] Tests de pénétration

---

**Sécurité avant tout** - Protection de vos données et celles de vos clients
