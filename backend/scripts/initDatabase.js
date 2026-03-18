const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ytech',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432
})

async function initializeDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 Initializing database...\n')
    
    // Read schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute schema
    await client.query(schema)
    
    console.log('✅ Database tables created successfully!\n')
    
    // Create a test user
    const testEmail = 'test@example.com'
    const testPassword = 'test123'
    const bcrypt = require('bcrypt')
    
    // Check if test user exists
    const userCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [testEmail]
    )
    
    if (userCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(testPassword, 10)
      await client.query(
        'INSERT INTO users(email, password) VALUES($1, $2)',
        [testEmail, hashedPassword]
      )
      console.log('📧 Test user created:')
      console.log(`   Email: ${testEmail}`)
      console.log(`   Password: ${testPassword}\n`)
    } else {
      console.log('ℹ️  Test user already exists\n')
    }
    
    // Verify tables
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    )
    
    console.log('📦 Database tables:')
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`)
    })
    
    console.log('\n✨ Database initialization complete!\n')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error initializing database:')
    console.error(err)
    process.exit(1)
  } finally {
    await client.end()
    await pool.end()
  }
}

initializeDatabase()
