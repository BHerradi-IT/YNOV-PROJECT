require("dotenv").config()
const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const path = require("path")
const fs = require("fs")

const app = express()

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Static files
app.use(express.static(path.join(__dirname, 'public')))

const pool = require("./config/db")
const bcrypt = require('bcryptjs')

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const [dbResult] = await pool.query("SELECT NOW() as now, VERSION() as version")
    const memoryUsage = process.memoryUsage()
    
    res.json({
      status: "Server is running",
      database: "Connected (MariaDB)",
      timestamp: new Date().toISOString(),
      version: dbResult[0]?.version || '10.4.32-MariaDB',
      uptime: process.uptime(),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB'
      }
    })
  } catch (error) {
    res.status(500).json({
      status: "Error",
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Routes d'authentification
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body
    
    const [existingUsers] = await pool.query("SELECT id FROM users WHERE email = ?", [email])
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: "Cet email est déjà utilisé" 
      })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const [result] = await pool.query(
      "INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, firstName, lastName, 'user']
    )
    
    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      userId: result.insertId
    })
  } catch (error) {
    console.error("❌ Error during registration:", error)
    res.status(500).json({ 
      success: false,
      error: "Erreur lors de l'inscription" 
    })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body
    
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email])
    
    if (users.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: "Email ou mot de passe incorrect" 
      })
    }
    
    const user = users[0]
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        error: "Email ou mot de passe incorrect" 
      })
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'ytech_secret_key',
      { expiresIn: '24h' }
    )
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    })
  } catch (error) {
    console.error("❌ Error during login:", error)
    res.status(500).json({ 
      success: false,
      error: "Erreur lors de la connexion" 
    })
  }
})

// Route de demande de devis
app.post("/api/quotes/request", async (req, res) => {
  try {
    const { name, email, phone, company, message, planName, planPrice } = req.body
    
    // Validation basique
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "Les champs nom, email et message sont requis"
      })
    }
    
    // Insérer la demande de devis
    const [quoteResult] = await pool.query(
      `INSERT INTO quote_requests (name, email, phone, company, message, plan_name, plan_price, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [name, email, phone, company, message, planName, planPrice]
    )
    
    // Créer une commande associée
    const [orderResult] = await pool.query(
      `INSERT INTO orders (quote_request_id, user_id, status, total_amount) 
       VALUES (?, ?, 'pending', ?)`,
      [quoteResult.insertId, null, planPrice || 0]
    )
    
    res.status(201).json({
      success: true,
      message: "Demande de devis envoyée avec succès",
      quoteId: quoteResult.insertId,
      orderId: orderResult.insertId
    })
    
  } catch (error) {
    console.error("❌ Error saving quote request:", error)
    res.status(500).json({ 
      success: false,
      error: "Erreur lors de l'enregistrement de la demande"
    })
  }
})

// Route contact
app.post("/api/contact", async (req, res) => {
  const { name, email, phone, company, subject, message } = req.body
  
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Les champs nom, email et message sont requis"
    })
  }
  
  try {
    // Simuler l'envoi d'email (en production, utiliser nodemailer)
    console.log('📧 Nouveau message de contact:', {
      name,
      email,
      phone,
      company,
      subject,
      message,
      timestamp: new Date().toISOString()
    })
    
    res.json({
      success: true,
      message: "Message envoyé avec succès"
    })
  } catch (error) {
    console.error("❌ Error saving contact:", error)
    res.status(500).json({ 
      success: false,
      error: "Erreur lors de l'enregistrement du message"
    })
  }
})

// Démarrage du serveur
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT)
  console.log('📡 API available at http://localhost:' + PORT)
  console.log('🗄️ Database: MariaDB')
  console.log('✅ Routes auth intégrées directement')
  console.log('✅ Endpoint /api/auth/register should work now')
})
