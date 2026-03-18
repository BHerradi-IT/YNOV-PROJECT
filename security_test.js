const http = require('http');
const crypto = require('crypto');

// Configuration
const BASE_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

// Fonction pour faire des requêtes HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          data: body, 
          headers: res.headers 
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Fonction pour logger les résultats
function logTest(testName, status, details = '') {
  console.log(`\n${status === '✅' ? '✅' : '❌'} ${testName}`);
  if (details) console.log(`   ${details}`);
}

// Tests de sécurité
async function runSecurityTests() {
  console.log('🔍 DÉBUT DU PENTEST - YTECH SECURITY AUDIT');
  console.log('=' .repeat(60));

  // 1. Test d'accès non autorisé aux endpoints admin
  logTest('1. Test accès admin sans token', '⚠️', 'En cours...');
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/projects',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (res.status === 401) {
      logTest('1. Test accès admin sans token', '✅', 'Correctement bloqué (401)');
    } else {
      logTest('1. Test accès admin sans token', '❌', `Non bloqué! Status: ${res.status}`);
    }
  } catch (error) {
    logTest('1. Test accès admin sans token', '⚠️', `Erreur: ${error.message}`);
  }

  // 2. Test d'accès admin avec token utilisateur normal
  logTest('2. Test accès admin avec token utilisateur', '⚠️', 'En cours...');
  try {
    // D'abord, créer un utilisateur normal
    const registerRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'testuser' + Date.now() + '@test.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User'
    });

    if (registerRes.status === 201) {
      const registerData = JSON.parse(registerRes.data);
      const userToken = registerData.token;

      // Essayer d'accéder aux endpoints admin avec le token utilisateur
      const adminRes = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/projects',
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (adminRes.status === 403) {
        logTest('2. Test accès admin avec token utilisateur', '✅', 'Correctement bloqué (403)');
      } else {
        logTest('2. Test accès admin avec token utilisateur', '❌', `Non bloqué! Status: ${adminRes.status}`);
      }
    } else {
      logTest('2. Test accès admin avec token utilisateur', '⚠️', 'Impossible de créer un utilisateur pour tester');
    }
  } catch (error) {
    logTest('2. Test accès admin avec token utilisateur', '⚠️', `Erreur: ${error.message}`);
  }

  // 3. Test injection SQL sur login
  logTest('3. Test injection SQL (login)', '⚠️', 'En cours...');
  try {
    const sqlInjectionPayloads = [
      "admin'--",
      "admin'/*",
      "' OR '1'='1",
      "' OR '1'='1' --",
      "'; DROP TABLE users; --"
    ];

    for (const payload of sqlInjectionPayloads) {
      const res = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: payload,
        password: 'anything'
      });

      if (res.status === 200) {
        const data = JSON.parse(res.data);
        if (data.token) {
          logTest('3. Test injection SQL (login)', '❌', `Injection réussie avec: ${payload}`);
          break;
        }
      }
    }
    logTest('3. Test injection SQL (login)', '✅', 'Aucune injection détectée');
  } catch (error) {
    logTest('3. Test injection SQL (login)', '⚠️', `Erreur: ${error.message}`);
  }

  // 4. Test XSS sur les formulaires
  logTest('4. Test XSS (register)', '⚠️', 'En cours...');
  try {
    const xssPayload = '<script>alert("XSS")</script>';
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'test' + Date.now() + '@test.com',
      password: 'Test123!',
      firstName: xssPayload,
      lastName: 'Test'
    });

    if (res.status === 201) {
      logTest('4. Test XSS (register)', '⚠️', 'XSS potentiel - vérifier le stockage');
    } else {
      logTest('4. Test XSS (register)', '✅', 'XSS semble bloqué');
    }
  } catch (error) {
    logTest('4. Test XSS (register)', '⚠️', `Erreur: ${error.message}`);
  }

  // 5. Test CORS
  logTest('5. Test CORS', '⚠️', 'En cours...');
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      headers: { 
        'Origin': 'https://malicious-site.com',
        'Content-Type': 'application/json'
      }
    });

    const corsHeader = res.headers['access-control-allow-origin'];
    if (corsHeader && corsHeader !== 'https://malicious-site.com') {
      logTest('5. Test CORS', '✅', `CORS correctement configuré: ${corsHeader}`);
    } else if (corsHeader === 'https://malicious-site.com') {
      logTest('5. Test CORS', '❌', 'CORS trop permissif!');
    } else {
      logTest('5. Test CORS', '⚠️', 'Header CORS non trouvé');
    }
  } catch (error) {
    logTest('5. Test CORS', '⚠️', `Erreur: ${error.message}`);
  }

  // 6. Test rate limiting
  logTest('6. Test Rate Limiting', '⚠️', 'En cours...');
  try {
    let blockedCount = 0;
    for (let i = 0; i < 20; i++) {
      const res = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: 'test@test.com',
        password: 'wrongpassword'
      });

      if (res.status === 429) {
        blockedCount++;
      }
    }

    if (blockedCount > 0) {
      logTest('6. Test Rate Limiting', '✅', `Rate limiting actif (${blockedCount} requêtes bloquées)`);
    } else {
      logTest('6. Test Rate Limiting', '❌', 'Aucun rate limiting détecté!');
    }
  } catch (error) {
    logTest('6. Test Rate Limiting', '⚠️', `Erreur: ${error.message}`);
  }

  // 7. Test brute force timing
  logTest('7. Test Brute Force Timing', '⚠️', 'En cours...');
  try {
    const start = Date.now();
    await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@ytech.ma',
      password: 'wrongpassword123456789'
    });
    const end = Date.now();
    const responseTime = end - start;

    if (responseTime > 1000) {
      logTest('7. Test Brute Force Timing', '✅', `Timing protection active (${responseTime}ms)`);
    } else {
      logTest('7. Test Brute Force Timing', '⚠️', `Réponse rapide (${responseTime}ms) - possible vulnérabilité`);
    }
  } catch (error) {
    logTest('7. Test Brute Force Timing', '⚠️', `Erreur: ${error.message}`);
  }

  // 8. Test information disclosure
  logTest('8. Test Information Disclosure', '⚠️', 'En cours...');
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/nonexistent',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.data.includes('<!DOCTYPE')) {
      logTest('8. Test Information Disclosure', '⚠️', 'HTML error page - possible information leak');
    } else if (res.data.includes('Error') || res.data.includes('error')) {
      logTest('8. Test Information Disclosure', '⚠️', 'Error details in response');
    } else {
      logTest('8. Test Information Disclosure', '✅', 'Pas de fuite d\'information évidente');
    }
  } catch (error) {
    logTest('8. Test Information Disclosure', '⚠️', `Erreur: ${error.message}`);
  }

  // 9. Test JWT security
  logTest('9. Test JWT Security', '⚠️', 'En cours...');
  try {
    // Test avec token modifié
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature';
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/user/projects',
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fakeToken}`
      }
    });

    if (res.status === 403) {
      logTest('9. Test JWT Security', '✅', 'Token invalide correctement rejeté');
    } else {
      logTest('9. Test JWT Security', '❌', `Token invalide accepté! Status: ${res.status}`);
    }
  } catch (error) {
    logTest('9. Test JWT Security', '⚠️', `Erreur: ${error.message}`);
  }

  // 10. Test password strength
  logTest('10. Test Password Requirements', '⚠️', 'En cours...');
  try {
    const weakPasswords = [
      '123',
      'password',
      'admin',
      'test'
    ];

    let blockedCount = 0;
    for (const password of weakPasswords) {
      const res = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: `test${Date.now()}@test.com`,
        password: password,
        firstName: 'Test',
        lastName: 'User'
      });

      if (res.status === 400) {
        blockedCount++;
      }
    }

    if (blockedCount > 0) {
      logTest('10. Test Password Requirements', '✅', `Mots de passe faibles bloqués (${blockedCount}/${weakPasswords.length})`);
    } else {
      logTest('10. Test Password Requirements', '❌', 'Mots de passe faibles acceptés!');
    }
  } catch (error) {
    logTest('10. Test Password Requirements', '⚠️', `Erreur: ${error.message}`);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🏁 FIN DU PENTEST - RAPPORT DE SÉCURITÉ');
  console.log('=' .repeat(60));

  // Recommandations
  console.log('\n📋 RECOMMANDATIONS DE SÉCURITÉ:');
  console.log('1. Implémenter rate limiting sur tous les endpoints');
  console.log('2. Ajouter validation stricte des entrées utilisateur');
  console.log('3. Utiliser HTTPS en production');
  console.log('4. Implémenter logging des tentatives d\'intrusion');
  console.log('5. Ajouter headers de sécurité (HSTS, CSP, etc.)');
  console.log('6. Valider et échapper toutes les entrées utilisateur');
  console.log('7. Implémenter timeout sur les requêtes');
  console.log('8. Utiliser des paramètres préparés pour SQL');
  console.log('9. Ajouter captcha sur les formulaires sensibles');
  console.log('10. Implémenter monitoring de sécurité en temps réel');
}

// Lancer les tests
runSecurityTests().catch(console.error);
