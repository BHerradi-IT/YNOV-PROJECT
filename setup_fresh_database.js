const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function recreateDatabase() {
  console.log('🔄 Recréation de la base de données YTECH...');
  
  try {
    // Connexion à MySQL sans base de données spécifiée
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✅ Connexion à MySQL établie');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'recreate_database.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Exécuter les commandes SQL
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✅ Commande exécutée:', statement.substring(0, 50) + '...');
        } catch (error) {
          if (!error.message.includes('already exists') && !error.message.includes('Query was empty')) {
            console.log('⚠️  Avertissement:', error.message);
          }
        }
      }
    }

    // Vérifier que l'admin a été créé
    const [admin] = await connection.execute(
      'SELECT id, email, nom, prenom, role FROM users WHERE role = "admin"'
    );
    
    if (admin.length > 0) {
      console.log('✅ Administrateur créé:', admin[0]);
      console.log('   Email: admin@ytech.ma');
      console.log('   Mot de passe: admin123');
    }

    // Vérifier les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ Tables créées:', tables.map(t => Object.values(t)[0]));

    await connection.end();
    console.log('🎉 Base de données YTECH recréée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la recréation:', error);
    process.exit(1);
  }
}

recreateDatabase();
