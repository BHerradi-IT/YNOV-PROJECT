# YTECH - Installation & Déploiement

## 🚀 Installation Locale

### 1. Cloner le Projet
```bash
git clone <repository-url>
cd ytech-ai-website
```

### 2. Prérequis
- Node.js 18+
- MariaDB 10.6+
- npm ou yarn

### 3. Base de Données
```bash
# Importer le schéma MariaDB
mysql -u root -p < database/mariadb_schema.sql
```

### 4. Backend
```bash
cd backend
npm install
cp .env.example .env
# Configurer .env avec vos credentials
npm run dev
```

### 5. Frontend
```bash
cd frontend
npm install
npm start
```

## 🌐 Déploiement Ubuntu

### 1. Prérequis Serveur
```bash
sudo apt update
sudo apt install -y nodejs npm mariadb-server nginx
```

### 2. Base de Données
```bash
sudo mysql_secure_installation
mysql -u root -p < database/mariadb_schema.sql
```

### 3. Application
```bash
# Cloner le projet
git clone <repository-url> /var/www/ytech
cd /var/www/ytech

# Installer dépendances
npm install --production
cd backend && npm install --production
cd ../frontend && npm install --production && npm run build

# Configurer PM2
npm install -g pm2
pm2 start backend/server.js --name "ytech-api"
pm2 startup
pm2 save
```

### 4. Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/ytech
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/ytech/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/ytech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Sécurité
```bash
# Firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# SSL avec Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 📊 Monitoring

### PM2 Commands
```bash
pm2 status          # Voir les processus
pm2 logs ytech-api  # Voir les logs
pm2 restart ytech-api # Redémarrer
pm2 monit           # Monitoring en temps réel
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

## 🔧 Maintenance

### Backup Base de Données
```bash
mysqldump -u root -p ytech_db > backup_$(date +%Y%m%d).sql
```

### Mise à Jour
```bash
cd /var/www/ytech
git pull origin main
npm install --production
cd backend && npm install --production
pm2 restart ytech-api
```

---

**YTECH** - Votre partenaire digital au Maroc
