const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function fixDatabaseComplete() {
  console.log('🔧 DÉMARRAGE DE LA CORRECTION COMPLÈTE DE LA BASE DE DONNÉES...');
  
  try {
    // Connexion à MySQL sans base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✅ Connexion à MySQL établie');

    // 1. Suppression complète de l'ancienne base
    await connection.execute('DROP DATABASE IF EXISTS ytech_db');
    console.log('🗑️  Ancienne base de données supprimée');

    // 2. Création de la nouvelle base avec charset optimal
    await connection.execute('CREATE DATABASE ytech_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('📦 Nouvelle base de données créée');

    // 4. Création des tables avec structure optimisée
    const tables = [
      // Table users avec toutes les colonnes nécessaires
      `CREATE TABLE ytech_db.users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(120) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nom VARCHAR(100),
        prenom VARCHAR(100),
        role ENUM('admin', 'user') DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Table contacts avec colonnes correctes
      `CREATE TABLE ytech_db.contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        phone VARCHAR(20),
        company VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Table quote_requests avec structure complète
      `CREATE TABLE ytech_db.quote_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        service_id INT,
        service_name VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        company VARCHAR(100),
        project_description TEXT NOT NULL,
        budget VARCHAR(50),
        timeline VARCHAR(50),
        requirements TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_service (service_name),
        INDEX idx_status (status),
        INDEX idx_created (created_at),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Table projects pour le dashboard
      `CREATE TABLE ytech_db.projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50),
        description TEXT,
        budget DECIMAL(10,2),
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        client_email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_client_email (client_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Table orders pour le suivi
      `CREATE TABLE ytech_db.orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        status VARCHAR(50) DEFAULT 'pending',
        total_amount DECIMAL(10,2) DEFAULT 0,
        currency VARCHAR(3) DEFAULT 'MAD',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      // Table payments pour les transactions
      `CREATE TABLE ytech_db.payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'MAD',
        status VARCHAR(50) DEFAULT 'pending',
        transaction_id VARCHAR(255) UNIQUE,
        package_type VARCHAR(50),
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        description TEXT,
        INDEX idx_user_id (user_id),
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];

    // Créer toutes les tables
    for (let i = 0; i < tables.length; i++) {
      await connection.execute(tables[i]);
      console.log(`✅ Table ${i + 1}/6 créée`);
    }

    // 5. Créer l'administrateur avec un vrai mot de passe hashé
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await connection.execute(
      'INSERT INTO ytech_db.users (email, password, nom, prenom, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin@ytech.ma', hashedPassword, 'YTECH', 'Admin', 'admin', true]
    );
    console.log('👤 Administrateur créé: admin@ytech.ma / admin123');

    // 6. Insérer des données de test réalistes
    await connection.execute(
      'INSERT INTO ytech_db.contacts (nom, email, subject, message, phone, company) VALUES (?, ?, ?, ?, ?, ?)',
      ['Jean Dupont', 'jean.dupont@email.com', 'Demande de site e-commerce', 'Bonjour, je souhaite créer une boutique en ligne pour vendre mes produits artisanaux.', '+212 612345678', 'Artisan Maroc']
    );

    await connection.execute(
      'INSERT INTO ytech_db.contacts (nom, email, subject, message, phone, company) VALUES (?, ?, ?, ?, ?, ?)',
      ['Marie Martin', 'marie.martin@email.com', 'Question sur les tarifs', 'Pouvez-vous me donner un devis pour un site vitrine ?', '+212 623456789', 'SARL Martin']
    );

    await connection.execute(
      'INSERT INTO ytech_db.quote_requests (service_name, name, email, phone, company, project_description, budget, timeline, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      ['Site E-commerce', 'Ahmed Alaoui', 'ahmed@entreprise.com', '+212 634567890', 'Tech Solutions', 'Développement d\'une plateforme e-commerce complète avec paiement en ligne et gestion des stocks', 'medium', '2-3 mois', 'pending']
    );

    await connection.execute(
      'INSERT INTO ytech_db.projects (user_id, name, type, description, budget, status, client_email) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, 'Site Web Corporate', 'corporate', 'Développement d\'un site web moderne pour une entreprise', 15000.00, 'in_progress', 'client@example.com']
    );

    // 7. Vérification finale
    const [tablesResult] = await connection.execute('SHOW TABLES FROM ytech_db');
    console.log(`✅ Tables créées: ${tablesResult.length}`);
    
    const [adminResult] = await connection.execute('SELECT id, email, nom, prenom, role FROM ytech_db.users WHERE role = "admin"');
    console.log('✅ Administrateur vérifié:', adminResult[0]);

    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM ytech_db.users');
    console.log(`✅ Utilisateurs créés: ${userCount[0].count}`);

    const [contactCount] = await connection.execute('SELECT COUNT(*) as count FROM ytech_db.contacts');
    console.log(`✅ Messages de contact: ${contactCount[0].count}`);

    const [quoteCount] = await connection.execute('SELECT COUNT(*) as count FROM ytech_db.quote_requests');
    console.log(`✅ Demandes de devis: ${quoteCount[0].count}`);

    await connection.end();
    
    console.log('\n🎉 BASE DE DONNÉES YTECH CRÉÉE AVEC SUCCÈS !');
    console.log('✅ Structure optimisée');
    console.log('✅ Admin par défaut: admin@ytech.ma / admin123');
    console.log('✅ Données de test insérées');
    console.log('✅ Toutes les relations et index créés');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la base de données:', error);
    return false;
  }
}

// Exécuter la fonction
if (require.main === module) {
  fixDatabaseComplete().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erreur critique:', error);
    process.exit(1);
  });
}

module.exports = { fixDatabaseComplete };
