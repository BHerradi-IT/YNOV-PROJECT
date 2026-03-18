const pool = require('./config/db');

// Test direct de la requête pour trouver le bug
async function testEmailQuery() {
  try {
    const testEmail = 'testnouveau123@exemple.com';
    console.log('🧪 Test avec email:', testEmail);
    
    // Test 1: Requête simple
    console.log('\n🔍 Test 1: Requête simple');
    const [result1] = await pool.query('SELECT id, email FROM users WHERE email = ?', [testEmail]);
    console.log('Résultat 1:', result1.length, 'trouvé(s)');
    
    // Test 2: Requête avec LOWER
    console.log('\n🔍 Test 2: Requête avec LOWER');
    const [result2] = await pool.query('SELECT id, email FROM users WHERE LOWER(email) = ?', [testEmail.toLowerCase()]);
    console.log('Résultat 2:', result2.length, 'trouvé(s)');
    
    // Test 3: Toutes les entrées
    console.log('\n🔍 Test 3: Toutes les entrées');
    const [result3] = await pool.query('SELECT id, email FROM users');
    console.log('Total entrées:', result3.length);
    result3.forEach(row => console.log(`  ID: ${row.id}, Email: "${row.email}"`));
    
    // Test 4: Recherche pattern
    console.log('\n🔍 Test 4: Recherche avec LIKE');
    const [result4] = await pool.query('SELECT id, email FROM users WHERE email LIKE "%test%"');
    console.log('Entrées avec "test":', result4.length);
    result4.forEach(row => console.log(`  ID: ${row.id}, Email: "${row.email}"`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur test:', error);
    process.exit(1);
  }
}

testEmailQuery();
