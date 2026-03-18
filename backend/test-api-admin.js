const pool = require('./config/db');

async function testAPI() {
  try {
    console.log('🧪 Test de l\'API admin...');
    
    // 1. Test login admin
    console.log('\n🔐 Test login admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@ytech.ma',
        password: 'YTech@Admin2024!Secure#Access@Maroc'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.token) {
      console.log('✅ Login réussi, token:', loginData.token.substring(0, 50) + '...');
      
      // 2. Test API admin users
      console.log('\n👥 Test API /api/admin/users...');
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      const usersData = await usersResponse.json();
      console.log('Users API response:', usersData);
      console.log('Nombre d\'utilisateurs trouvés:', Array.isArray(usersData) ? usersData.length : 'Not an array');
      
      if (Array.isArray(usersData)) {
        usersData.forEach((user, index) => {
          console.log(`  User ${index + 1}:`, {
            id: user.id,
            email: user.email,
            role: user.role
          });
        });
      }
      
    } else {
      console.log('❌ Login échoué');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur test:', error);
    process.exit(1);
  }
}

testAPI();
