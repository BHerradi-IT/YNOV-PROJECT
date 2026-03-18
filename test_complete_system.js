const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

// Configuration
const API_BASE = 'http://localhost:5000';
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ytech_db'
};

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log('\n🗄️  Test de connexion à la base de données...', 'blue');
  
  try {
    const connection = await mysql.createConnection(DB_CONFIG);
    await connection.ping();
    log('✅ Base de données connectée avec succès', 'green');
    
    // Vérifier les tables
    const [tables] = await connection.execute('SHOW TABLES');
    log(`📊 Tables trouvées: ${tables.length}`, 'blue');
    
    // Vérifier l'admin
    const [admin] = await connection.execute('SELECT * FROM users WHERE role = "admin"');
    if (admin.length > 0) {
      log('👤 Administrateur trouvé', 'green');
    } else {
      log('❌ Administrateur non trouvé', 'red');
    }
    
    await connection.end();
    return true;
  } catch (error) {
    log(`❌ Erreur base de données: ${error.message}`, 'red');
    return false;
  }
}

async function testAPIEndpoints() {
  log('\n🚀 Test des endpoints API...', 'blue');
  
  try {
    // Test health
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    if (healthResponse.ok) {
      log('✅ API Health check OK', 'green');
    }
    
    // Test inscription
    const testUser = {
      email: `test${Date.now()}@test.com`,
      password: 'password123',
      name: 'Test User',
      firstName: 'Test User'
    };
    
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      log('✅ Inscription réussie', 'green');
      log(`📧 Email: ${testUser.email}`, 'blue');
      log(`🔑 Token généré: ${registerData.token ? 'OUI' : 'NON'}`, 'blue');
      
      // Test login
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'password123'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        log('✅ Connexion réussie', 'green');
        log(`🔑 Token reçu: ${loginData.token ? 'OUI' : 'NON'}`, 'blue');
        
        // Test contact
        const contactResponse = await fetch(`${API_BASE}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Contact',
            email: testUser.email,
            subject: 'Test Message',
            message: 'Ceci est un message de test'
          })
        });
        
        if (contactResponse.ok) {
          log('✅ Formulaire contact fonctionnel', 'green');
        } else {
          log('❌ Formulaire contact en erreur', 'red');
        }
        
        // Test devis (avec token)
        const quoteResponse = await fetch(`${API_BASE}/api/quotes/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          },
          body: JSON.stringify({
            serviceId: 1,
            serviceName: 'Test Service',
            name: 'Test User',
            email: testUser.email,
            projectDescription: 'Test project description',
            budget: 'medium',
            timeline: 'medium'
          })
        });
        
        if (quoteResponse.ok) {
          log('✅ Demande de devis fonctionnelle', 'green');
        } else {
          const error = await quoteResponse.json();
          log(`❌ Demande de devis en erreur: ${error.error}`, 'red');
        }
        
      } else {
        log('❌ Connexion échouée', 'red');
      }
    } else {
      const error = await registerResponse.json();
      log(`❌ Inscription échouée: ${error.error}`, 'red');
    }
    
    return true;
  } catch (error) {
    log(`❌ Erreur API: ${error.message}`, 'red');
    return false;
  }
}

async function testFrontend() {
  log('\n🌐 Test du frontend...', 'blue');
  
  try {
    const frontendResponse = await fetch('http://localhost:3000');
    if (frontendResponse.ok) {
      log('✅ Frontend accessible', 'green');
      return true;
    } else {
      log('❌ Frontend inaccessible', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Erreur frontend: ${error.message}`, 'red');
    return false;
  }
}

async function generateReport() {
  log('\n📋 Rapport de test complet...', 'yellow');
  
  const dbOk = await testDatabaseConnection();
  const apiOk = await testAPIEndpoints();
  const frontendOk = await testFrontend();
  
  log('\n🎯 Résultats finaux:', 'blue');
  log(`🗄️  Base de données: ${dbOk ? '✅ OK' : '❌ ERREUR'}`, dbOk ? 'green' : 'red');
  log(`🚀 API: ${apiOk ? '✅ OK' : '❌ ERREUR'}`, apiOk ? 'green' : 'red');
  log(`🌐 Frontend: ${frontendOk ? '✅ OK' : '❌ ERREUR'}`, frontendOk ? 'green' : 'red');
  
  const allOk = dbOk && apiOk && frontendOk;
  
  if (allOk) {
    log('\n🎉 SYSTÈME COMPLET FONCTIONNEL !', 'green');
    log('✅ Toutes les fonctionnalités sont opérationnelles', 'green');
    log('🚀 L\'application YTECH est prête à être utilisée', 'green');
  } else {
    log('\n⚠️  PROBLÈMES DÉTECTÉS', 'yellow');
    log('🔧 Veuillez corriger les erreurs avant de continuer', 'yellow');
  }
  
  return allOk;
}

// Fonction principale
async function main() {
  log('🧪 DÉMARRAGE DES TESTS COMPLETS YTECH', 'blue');
  log('=====================================', 'blue');
  
  const success = await generateReport();
  
  process.exit(success ? 0 : 1);
}

// Lancer les tests
if (require.main === module) {
  main().catch(error => {
    log(`❌ Erreur critique: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { generateReport, testDatabaseConnection, testAPIEndpoints, testFrontend };
