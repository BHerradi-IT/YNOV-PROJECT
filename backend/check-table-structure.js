const pool = require('./config/db');

pool.query('DESCRIBE users').then(([rows]) => {
  console.log('📋 Structure de la table users:');
  rows.forEach(row => console.log(`- ${row.Field}: ${row.Type} (${row.Null ? 'NULL' : 'NOT NULL'})`));
  process.exit(0);
}).catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
