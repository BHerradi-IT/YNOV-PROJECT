const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

// Configuration du middleware de sécurité selon ISO 27001
function setupSecurityMiddleware(app) {
  // 1. Helmet - Protection des en-têtes HTTP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://api.ytech-ai.ma"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // 2. Rate Limiting - Protection contre les attaques par force brute
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: {
      error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      // Journaliser les tentatives d'attaques
      console.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Trop de requêtes',
        message: 'Veuillez réessayer plus tard',
        retryAfter: 15 * 60 * 1000
      });
    }
  });

  // Rate limiting plus strict pour l'authentification
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Maximum 5 tentatives de connexion
    skipSuccessfulRequests: true,
    message: {
      error: 'Trop de tentatives de connexion',
      message: 'Compte temporairement bloqué pour des raisons de sécurité'
    }
  });

  app.use('/api/', limiter);
  app.use('/api/auth/', authLimiter);

  // 3. CORS - Politique de partage des ressources
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // 4. MongoDB Sanitization - Protection contre l'injection NoSQL
  app.use(mongoSanitize());

  // 5. XSS Protection - Nettoyage des entrées
  app.use((req, res, next) => {
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = xss(req.body[key]);
        }
      });
    }
    next();
  });

  // 6. Compression - Optimisation des performances
  app.use(compression());

  // 7. Logging - Audit de sécurité
  app.use(morgan('combined', {
    stream: {
      write: (message) => {
        // Journaliser les requêtes pour l'audit
        console.log(`[SECURITY_AUDIT] ${message.trim()}`);
      }
    }
  }));

  // 8. Validation des entrées
  app.use(express.json({ 
    limit: '10mb',
    strict: true
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
  }));

  // 9. En-têtes de sécurité personnalisés
  app.use((req, res, next) => {
    // En-tête pour prévenir le clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // En-tête pour prévenir le MIME-sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // En-tête pour activer la protection XSS dans les navigateurs
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // En-tête pour la politique de réfèrent
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // En-tête pour les permissions
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
  });

  // 10. Gestion des erreurs de sécurité
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({
        error: 'Invalid JSON',
        message: 'Le corps de la requête contient du JSON invalide'
      });
    }
    
    if (err.type === 'entity.too.large') {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: 'La taille des données dépasse la limite autorisée'
      });
    }
    
    next(err);
  });
}

module.exports = setupSecurityMiddleware;
