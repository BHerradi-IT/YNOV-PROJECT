const pool = require('./config/db');

// Nettoyer les entrées avec email NULL ou vide
async function cleanupUsers() {
  try {
    console.log('🧹 Nettoyage des utilisateurs avec email NULL/vides...');
    
    // Voir les entrées problématiques
    const [badEntries] = await pool.query('SELECT id, email FROM users WHERE email IS NULL OR email = "" OR email = " " OR email LIKE "%undefined%"');
    
    if (badEntries.length > 0) {
      console.log('⚠️ Entrées problématiques trouvées:');
      badEntries.forEach(row => console.log(`ID: ${row.id}, Email: '${row.email}'`));
      
      // Supprimer les entrées avec email NULL ou vide
      const [result] = await pool.query('DELETE FROM users WHERE email IS NULL OR email = "" OR email = " " OR email LIKE "%undefined%"');
      console.log(`🗑️ ${result.affectedRows} entrée(s) supprimée(s)`);
    } else {
      console.log('✅ Aucune entrée problématique trouvée');
    }
    
    // Vérifier les doublons
    const [duplicates] = await pool.query(`
      SELECT email, COUNT(*) as count 
      FROM users 
      WHERE email IS NOT NULL AND email != "" 
      GROUP BY email 
      HAVING count > 1
    `);
    
    if (duplicates.length > 0) {
      console.log('🔄 Emails en double trouvés:');
      duplicates.forEach(row => console.log(`Email: ${row.email}, Count: ${row.count}`));
      
      // Garder seulement la première occurrence
      for (const dup of duplicates) {
        const [toDelete] = await pool.query(`
          SELECT id FROM users 
          WHERE email = ? AND email IS NOT NULL AND email != "" 
          ORDER BY id ASC 
          LIMIT 1 OFFSET 1
        `, [dup.email]);
        
        if (toDelete.length > 0) {
          await pool.query('DELETE FROM users WHERE id = ?', [toDelete[0].id]);
          console.log(`🗑️ Doublon supprimé: ID ${toDelete[0].id} pour email ${dup.email}`);
        }
      }
    }
    
    console.log('✅ Nettoyage terminé !');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
    process.exit(1);
  }
}

cleanupUsers();
