# YTECH - Quick Start Guide

## 🚀 Installation Rapide

### 1. Prérequis
- **Node.js** 18+ : [Download](https://nodejs.org)
- **MariaDB** 10.6+ : [Download](https://mariadb.org/download/)
- **Git** : [Download](https://git-scm.com)

### 2. Base de Données

#### Installation MariaDB (Windows)
```bash
# Télécharger XAMPP avec MariaDB
# Installer dans C:\xampp
# Démarrer Apache et MariaDB depuis le panneau de contrôle
```

#### Configuration Base de Données
```bash
# Ouvrir phpMyAdmin : http://localhost/phpmyadmin
# Importer le fichier : database/mariadb_schema.sql
```

### 3. Backend

```bash
cd backend
npm install
npm run dev
```

**Serveur disponible sur :** http://localhost:5000

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

**Site disponible sur :** http://localhost:3000

## 🔧 Configuration

### Variables d'Environnement
```bash
# Copier le template
cd backend
copy .env.example .env

# Éditer .env avec vos valeurs
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ytech_db
```

## 📱 Fonctionnalités

- ✅ **Portfolio** : Sites personnels (4,500 DH)
- ✅ **E-Commerce** : Boutiques en ligne (12,000 DH)  
- ✅ **Sur Mesure** : Solutions personnalisées
- ✅ **Contact** : Formulaire avec base de données
- ✅ **Responsive** : Mobile & Desktop
- ✅ **Performance** : Lazy loading, optimisé SEO

## 🗄️ Structure Base de Données

- **contacts** : Messages du formulaire de contact
- **quote_requests** : Demandes de devis
- **users** : Utilisateurs (admin/client)
- **projects** : Projets clients
- **payments** : Paiements

## 📞 Support

- **Email** : contact@ytech.ma
- **Téléphone** : +212 5 22 12 34 56
- **Adresse** : Casablanca, Maroc

## 🔍 Vérification

```bash
# Test API Backend
curl http://localhost:5000/api/health

# Test Frontend
# Ouvrir http://localhost:3000
```

---

**YTECH** - Créons votre présence digitale professionnelle
