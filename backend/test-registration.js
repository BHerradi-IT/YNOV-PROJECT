const pool = require('./config/db');

async function testRegistration() {
  try {
    console.log('🧪 Test d\'inscription d\'un nouvel utilisateur...');
    
    // 1. Inscrire un nouvel utilisateur
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'nouveauutilisateur@test.com',
        password: 'password123',
        firstName: 'Nouveau',
        lastName: 'Utilisateur'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Inscription response:', registerData);
    
    if (registerData.token) {
      console.log('✅ Inscription réussie !');
      console.log('Token:', registerData.token.substring(0, 50) + '...');
      console.log('User:', registerData.user);
      
      // 2. Vérifier que l'utilisateur est bien dans la base
      console.log('\n🔍 Vérification dans la base...');
      const [users] = await pool.query(
        'SELECT id, email, first_name, last_name, role FROM users WHERE email = ?',
        ['nouveauutilisateur@test.com']
      );
      
      console.log('Utilisateur trouvé dans la base:', users.length > 0 ? '✅ OUI' : '❌ NON');
      if (users.length > 0) {
        console.log('Détails:', users[0]);
      }
      
    } else {
      console.log('❌ Inscription échouée:', registerData);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur test:', error);
    process.exit(1);
  }
}

testRegistration();
