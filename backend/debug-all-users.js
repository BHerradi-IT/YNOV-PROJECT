const pool = require('./config/db');

async function debugEmailSearch() {
  try {
    // Voir toutes les entrées dans la table users
    const [allUsers] = await pool.query('SELECT id, email, first_name, last_name FROM users ORDER BY id DESC');
    
    console.log('📋 TOUS les utilisateurs dans la base:');
    allUsers.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`  Email: '${row.email || 'NULL'}'`);
      console.log(`  Nom: ${row.first_name || 'NULL'} ${row.last_name || 'NULL'}`);
      console.log('---');
    });
    
    console.log(`\n📊 Total: ${allUsers.length} utilisateur(s)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

debugEmailSearch();
