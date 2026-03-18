const pool = require('./config/db');

pool.query('SELECT id, email FROM users ORDER BY id DESC LIMIT 10').then(([rows]) => {
  console.log('📋 10 derniers utilisateurs:');
  rows.forEach(row => console.log(`ID: ${row.id}, Email: '${row.email || 'NULL'}'`));
  process.exit(0);
}).catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
