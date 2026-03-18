// Créer un compte admin sécurisé avec mot de passe complexe
require("dotenv").config();
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

// Mot de passe admin ultra-sécurisé
const adminPassword = 'YTech@Admin2024!Secure#Access@Maroc';

// Hasher le mot de passe
const hashedAdminPassword = bcrypt.hashSync(adminPassword, 12);

// Insérer l'admin dans la base de données
const createAdmin = async () => {
  try {
    // Vérifier d'abord la structure de la table
    const [rows] = await pool.query('DESCRIBE users');
    console.log('Structure de la table users:');
    rows.forEach(row => console.log(`- ${row.Field}: ${row.Type}`));
    
    // Utiliser uniquement les colonnes qui existent
    await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at) 
       VALUES (?, ?, 'Admin', 'YTECH', 'admin', TRUE, NOW())
       ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'admin'`,
      ['admin@ytech.ma', hashedAdminPassword]
    );
    console.log('✅ Admin créé/mis à jour avec succès');
    console.log('📧 Email: admin@ytech.ma');
    console.log('🔑 Mot de passe: YTech@Admin2024!Secure#Access@Maroc');
    console.log('🔐 Rôle: admin');
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
  } finally {
    process.exit(0);
  }
};

// Pour l'exécuter une seule fois
createAdmin();
