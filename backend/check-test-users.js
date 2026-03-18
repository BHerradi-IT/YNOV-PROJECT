const pool = require('./config/db');

pool.query('SELECT id, email FROM users WHERE email LIKE "%test%" ORDER BY id DESC').then(([rows]) => {
  console.log('🔍 Utilisateurs avec email contenant "test":');
  rows.forEach(row => console.log(`ID: ${row.id}, Email: '${row.email || 'NULL'}'`));
  process.exit(0);
}).catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
