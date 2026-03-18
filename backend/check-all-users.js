const pool = require('./config/db');

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs dans la base...');
    
    // Voir tous les utilisateurs
    const [allUsers] = await pool.query('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC');
    
    console.log('📋 TOUS les utilisateurs:');
    allUsers.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Nom: ${user.first_name} ${user.last_name}`);
      console.log(`  Rôle: ${user.role}`);
      console.log(`  Créé: ${user.created_at}`);
      console.log('---');
    });
    
    console.log(`\n📊 Total: ${allUsers.length} utilisateur(s)`);
    
    // Vérifier spécifiquement les admins
    const [admins] = await pool.query('SELECT id, email, role FROM users WHERE role = "admin"');
    console.log(`\n👑 Administrateurs trouvés: ${admins.length}`);
    admins.forEach(admin => {
      console.log(`  ID: ${admin.id}, Email: ${admin.email}, Rôle: ${admin.role}`);
    });
    
    // Vérifier les utilisateurs normaux
    const [normalUsers] = await pool.query('SELECT id, email, role FROM users WHERE role = "user" OR role IS NULL');
    console.log(`\n👤 Utilisateurs normaux: ${normalUsers.length}`);
    normalUsers.forEach(user => {
      console.log(`  ID: ${user.id}, Email: ${user.email}, Rôle: ${user.role || 'NULL'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkUsers();
