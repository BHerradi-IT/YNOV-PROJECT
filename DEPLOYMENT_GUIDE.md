# 🚀 YTech AI - Guide de Déploiement Sécurisé

![Deployment](https://img.shields.io/badge/Deployment-SECURED-brightgreen.svg)
![Security](https://img.shields.io/badge/Security-MILITARY%20GRADE-red.svg)
![Production](https://img.shields.io/badge/Production-READY-blue.svg)

---

## 📋 Table des Matières

- [🎯 Prérequis](#-prérequis)
- [🔧 Configuration](#-configuration)
- [🚀 Déploiement Local](#-déploiement-local)
- [☁️ Déploiement Cloud](#️-déploiement-cloud)
- [🛡️ Sécurité](#️-sécurité)
- [📊 Monitoring](#-monitoring)
- [🔧 Maintenance](#-maintenance)

---

## 🎯 Prérequis

### 📋 **Configuration Système Requise**
- **Node.js** 18.0.0 ou supérieur
- **npm** 8.0.0 ou supérieur
- **MariaDB** 10.6 ou supérieur
- **Git** 2.30 ou supérieur
- **SSL/TLS** (obligatoire pour production)

### 🔧 **Outils Recommandés**
- **Docker** 20.10+ (pour conteneurisation)
- **PM2** (pour gestion de processus)
- **Nginx** (pour reverse proxy)
- **Certbot** (pour certificats SSL)

---

## 🔧 Configuration

### 📄 **Variables d'Environnement**

Créez un fichier `.env` avec la configuration suivante :

```bash
# ===========================================
# 🗄️ BASE DE DONNÉES SÉCURISÉE
# ===========================================
DB_HOST=localhost
DB_USER=ytech_user
DB_PASSWORD=votre_mot_de_passe_ultra_securise
DB_NAME=ytech_db
DB_PORT=3306
DB_SSL=true

# ===========================================
# 🚀 SERVEUR SÉCURISÉ
# ===========================================
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://votre-domaine.com
API_URL=https://api.votre-domaine.com

# ===========================================
# 🔐 SÉCURITÉ MILITAIRE
# ===========================================
JWT_SECRET=votre_cle_secrete_256bits_minimum
SESSION_SECRET=votre_cle_secrete_session_minimum
ENCRYPTION_KEY=votre_cle_chiffrement_aes256
BCRYPT_ROUNDS=14

# ===========================================
# 📧 EMAIL SÉCURISÉ
# ===========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=votre-email@domaine.com
EMAIL_PASS=votre-mot-de-passe-app
ADMIN_EMAIL=admin@votre-domaine.com

# ===========================================
# 🛡️ SÉCURITÉ AVANCÉE
# ===========================================
SECURITY_LEVEL=MILITARY_GRADE
THREAT_DETECTION=ENABLED
REAL_TIME_MONITORING=ENABLED
MULTI_FACTOR_AUTH=READY
RATE_LIMITING=ENABLED
IP_WHITELIST_ENABLED=true

# ===========================================
# 📊 MONITORING & LOGGING
# ===========================================
LOG_LEVEL=info
LOG_FILE_ENABLED=true
SECURITY_LOGS_ENABLED=true
PERFORMANCE_MONITORING=ENABLED
HEALTH_CHECK_ENABLED=true

# ===========================================
# 🌐 CLOUD PROVIDER
# ===========================================
CLOUD_PROVIDER=aws  # aws, gcp, azure
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=votre_access_key
AWS_SECRET_ACCESS_KEY=votre_secret_key
S3_BUCKET_NAME=ytech-backups

# ===========================================
# 🔔 ALERTING
# ===========================================
SLACK_WEBHOOK_URL=votre_webhook_slack
DISCORD_WEBHOOK_URL=votre_webhook_discord
EMAIL_ALERTS_ENABLED=true
SMS_ALERTS_ENABLED=false
```

---

## 🚀 Déploiement Local

### 🏃‍♂️ **Installation Rapide**

```bash
# 1. Cloner le repository sécurisé
git clone https://github.com/ytech-solutions-projet/YTech-ApplicationWeb.git
cd YTech-ApplicationWeb

# 2. Installer les dépendances backend
cd backend
npm install --production

# 3. Installer les dépendances frontend
cd ../frontend
npm install --production
npm run build

# 4. Configurer la base de données
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed/seed.sql

# 5. Démarrer le serveur sécurisé
cd ../backend
node server_max_security.js
```

### 🔧 **Démarrage avec PM2**

```bash
# Installer PM2 globalement
npm install -g pm2

# Créer le fichier de configuration PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ytech-backend',
    script: './backend/server_max_security.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## ☁️ Déploiement Cloud

### 🚀 **Déploiement Frontend (Vercel)**

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Build pour production
cd frontend
npm run build

# 3. Déployer sur Vercel
vercel --prod

# 4. Configurer les variables d'environnement
vercel env add FRONTEND_URL production
vercel env add API_URL production
```

### 🔧 **Déploiement Backend (Heroku)**

```bash
# 1. Installer Heroku CLI
# Télécharger depuis https://devcenter.heroku.com/articles/heroku-cli

# 2. Se connecter à Heroku
heroku login

# 3. Créer l'application
heroku create ytech-backend-secure

# 4. Configurer les variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre_cle_secrete
heroku config:set DB_HOST=votre_host_db
heroku config:set DB_USER=votre_user_db
heroku config:set DB_PASSWORD=votre_password_db
heroku config:set DB_NAME=votre_nom_db

# 5. Déployer
git push heroku main

# 6. Configurer le domaine personnalisé
heroku domains:add api.votre-domaine.com
```

### 🗄️ **Configuration Base de Données (AWS RDS)**

```bash
# 1. Créer une instance RDS MariaDB
aws rds create-db-instance \
    --db-instance-identifier ytech-db \
    --db-instance-class db.t3.micro \
    --engine mariadb \
    --master-username ytech_admin \
    --master-user-password VotreMotDePasseUltraSecure123! \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxx \
    --db-subnet-group-name default \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted

# 2. Configurer le security group
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxx \
    --protocol tcp \
    --port 3306 \
    --cidr 0.0.0.0/0

# 3. Importer les données
mysql -h ytech-db.xxxxxxxxxxxx.eu-west-3.rds.amazonaws.com \
    -u ytech_admin -p ytech_db < database/schema.sql
```

---

## 🛡️ Sécurité

### 🔒 **Configuration SSL/TLS**

```bash
# 1. Installer Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# 2. Obtenir certificat SSL
sudo certbot --nginx -d votre-domaine.com -d api.votre-domaine.com

# 3. Configurer renouvellement automatique
sudo crontab -e
# Ajouter: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 🛡️ **Configuration Nginx Reverse Proxy**

```nginx
# /etc/nginx/sites-available/ytech
server {
    listen 80;
    server_name votre-domaine.com api.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    # Configuration SSL avancée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Frontend
    location / {
        root /var/www/ytech/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Headers de sécurité
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout pour les requêtes longues
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### 🔥 **Configuration Firewall**

```bash
# 1. Configurer UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 2. Configurer fail2ban
sudo apt-get install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# 3. Configuration fail2ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
```

---

## 📊 Monitoring

### 📈 **Configuration Monitoring (Grafana + Prometheus)**

```yaml
# docker-compose.yml pour monitoring
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"

volumes:
  prometheus_data:
  grafana_data:
```

### 🔍 **Health Checks Automatisés**

```bash
# Script de monitoring health-check.sh
#!/bin/bash

# Vérifier le statut du backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ $BACKEND_STATUS -ne 200 ]; then
    echo "❌ Backend DOWN - Status: $BACKEND_STATUS"
    # Envoyer alerte
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 YTech Backend is DOWN!"}' \
        $SLACK_WEBHOOK_URL
else
    echo "✅ Backend UP - Status: $BACKEND_STATUS"
fi

# Vérifier le frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ $FRONTEND_STATUS -ne 200 ]; then
    echo "❌ Frontend DOWN - Status: $FRONTEND_STATUS"
    # Envoyer alerte
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 YTech Frontend is DOWN!"}' \
        $SLACK_WEBHOOK_URL
else
    echo "✅ Frontend UP - Status: $FRONTEND_STATUS"
fi

# Vérifier la base de données
DB_STATUS=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1" 2>/dev/null && echo "UP" || echo "DOWN")
if [ "$DB_STATUS" != "UP" ]; then
    echo "❌ Database DOWN"
    # Envoyer alerte
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"🚨 YTech Database is DOWN!"}' \
        $SLACK_WEBHOOK_URL
else
    echo "✅ Database UP"
fi
```

---

## 🔧 Maintenance

### 🔄 **Scripts de Maintenance Automatique**

```bash
#!/bin/bash
# maintenance.sh

# 1. Nettoyer les logs anciens
find /var/log/ytech -name "*.log" -mtime +30 -delete

# 2. Optimiser la base de données
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "OPTIMIZE TABLE users, quotes, contacts;"

# 3. Sauvegarder la base de données
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD ytech_db | gzip > /backups/ytech_db_$(date +%Y%m%d_%H%M%S).sql.gz

# 4. Nettoyer les backups anciens (garder 30 jours)
find /backups -name "ytech_db_*.sql.gz" -mtime +30 -delete

# 5. Redémarrer les services si nécessaire
pm2 restart ytech-backend

# 6. Vérifier l'espace disque
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "⚠️ Disk usage is ${DISK_USAGE}% - Cleanup required"
    # Envoyer alerte
fi

echo "✅ Maintenance completed at $(date)"
```

### 📅 **Cron Jobs pour Maintenance**

```bash
# Éditer crontab
crontab -e

# Ajouter les tâches suivantes:
# 0 2 * * * /path/to/maintenance.sh >> /var/log/maintenance.log 2>&1
# 0 */6 * * * /path/to/health-check.sh >> /var/log/health-check.log 2>&1
# 0 3 * * 0 /path/to/backup.sh >> /var/log/backup.log 2>&1
```

---

## 🎯 Checklist de Déploiement

### ✅ **Pré-Déploiement**
- [ ] Configuration SSL/TLS
- [ ] Variables d'environnement configurées
- [ ] Base de données sécurisée
- [ ] Firewall configuré
- [ ] Monitoring mis en place
- [ ] Scripts de backup prêts

### ✅ **Déploiement**
- [ ] Frontend buildé et déployé
- [ ] Backend sécurisé déployé
- [ ] Base de données migrée
- [ ] Tests de santé passés
- [ ] Monitoring actif
- [ ] Alertes configurées

### ✅ **Post-Déploiement**
- [ ] Vérification complète
- [ ] Tests de charge
- [ ] Tests de sécurité
- [ ] Documentation mise à jour
- [ ] Équipe formée
- [ ] Support client prêt

---

## 📞 Support Technique

### 🆘 **Support 24/7**
- **Email** : support@ytech.ma
- **Téléphone** : +212-XXX-XXXXXX
- **Urgence** : emergency@ytech.ma
- **Documentation** : https://docs.ytech.ai

### 🔧 **Ressources**
- **Guide de Sécurité** : [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
- **API Documentation** : [API.md](./docs/API.md)
- **Troubleshooting** : [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

---

<div align="center">

**🛡️ Déploiement Sécurisé * Monitoring Actif * Support 24/7**

*YTech AI - Innovation Technologique Marocaine*

[![Deployment Status](https://img.shields.io/badge/Deployment-SECURED-brightgreen.svg)](https://ytech.ai)
[![Security Level](https://img.shields.io/badge/Security-MILITARY%20GRADE-red.svg)](https://security.ytech.ai)

</div>
