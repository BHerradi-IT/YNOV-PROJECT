// Script de test pour le frontend
console.log('🧪 Test d\'authentification depuis le frontend...');

async function testAuthFromFrontend() {
  try {
    const testData = {
      email: `frontend_test_${Date.now()}@test.com`,
      password: 'password123',
      name: 'Frontend Debug Test',
      firstName: 'Frontend Debug Test'
    };

    console.log('📧 Données envoyées:', testData);
    console.log('🌐 URL: http://localhost:5000/api/auth/register');

    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📧 Status:', response.status);
    console.log('📧 Status text:', response.statusText);
    console.log('📧 Headers:', response.headers);

    const responseText = await response.text();
    console.log('📧 Response type:', typeof responseText);
    console.log('📧 Response length:', responseText.length);

    if (responseText.includes('<!DOCTYPE')) {
      console.log('⚠️  ERREUR: Le frontend reçoit du HTML !');
      console.log('📧 Début de la réponse HTML:');
      console.log(responseText.substring(0, 300));
      console.log('📧 ...');
    } else {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('✅ Succès JSON !');
        console.log('👤 User:', jsonData.user?.email);
        console.log('🔑 Token:', jsonData.token ? 'PRÉSENT' : 'ABSENT');
      } catch (e) {
        console.log('❌ Erreur parsing JSON:', e.message);
        console.log('📧 Response brute:', responseText);
      }
    }

  } catch (error) {
    console.error('❌ Erreur fetch:', error);
  }
}

// Exécuter le test
testAuthFromFrontend();
