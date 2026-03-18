const pool = require('./config/db');

pool.query('SELECT COUNT(*) as total, COUNT(DISTINCT email) as unique_emails FROM users').then(([rows]) => {
  console.log('📊 Statistiques utilisateurs:');
  console.log(`Total entrées: ${rows[0].total}`);
  console.log(`Emails uniques: ${rows[0].unique_emails}`);
  console.log(`Entrées en double: ${rows[0].total - rows[0].unique_emails}`);
  
  // Voir les entrées avec email NULL ou vide
  pool.query('SELECT id, email FROM users WHERE email IS NULL OR email = "" OR email = " "').then(([nullEmails]) => {
    if (nullEmails.length > 0) {
      console.log('\n⚠️ Entrées avec email NULL/vides:');
      nullEmails.forEach(row => console.log(`ID: ${row.id}, Email: '${row.email}'`));
    }
    
    process.exit(0);
  });
}).catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
