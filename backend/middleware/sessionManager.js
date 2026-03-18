const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Configuration de la gestion des sessions selon ISO 27001
class SessionManager {
  constructor() {
    this.activeSessions = new Map();
    this.blacklistedTokens = new Set();
    this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.maxConcurrentSessions = 3;
  }

  // Génération de token JWT sécurisé
  generateToken(payload) {
    const jwtPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      sessionId: crypto.randomBytes(32).toString('hex'),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30 minutes
    };

    return jwt.sign(jwtPayload, process.env.JWT_SECRET || 'fallback-secret', {
      algorithm: 'HS256',
      issuer: 'ytech-ai.ma',
      audience: 'ytech-users'
    });
  }

  // Vérification du token avec validation renforcée
  verifyToken(token) {
    try {
      if (this.blacklistedTokens.has(token)) {
        throw new Error('Token has been blacklisted');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', {
        algorithms: ['HS256'],
        issuer: 'ytech-ai.ma',
        audience: 'ytech-users'
      });

      // Vérifier si la session est toujours active
      if (!this.activeSessions.has(decoded.sessionId)) {
        throw new Error('Session expired');
      }

      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return null;
    }
  }

  // Création d'une session utilisateur
  createSession(userId, userData) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      userId,
      email: userData.email,
      role: userData.role,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      ipAddress: userData.ipAddress,
      userAgent: userData.userAgent
    };

    // Vérifier le nombre de sessions concurrentes
    this.cleanupExpiredSessions();
    const userSessions = Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId);

    if (userSessions.length >= this.maxConcurrentSessions) {
      // Supprimer la session la plus ancienne
      const oldestSession = userSessions.reduce((oldest, current) => 
        current.createdAt < oldest.createdAt ? current : oldest
      );
      this.activeSessions.delete(oldestSession.sessionId);
    }

    this.activeSessions.set(sessionId, sessionData);
    return sessionId;
  }

  // Nettoyage des sessions expirées
  cleanupExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, sessionData] of this.activeSessions.entries()) {
      if (now - sessionData.lastActivity > this.sessionTimeout) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  // Mise à jour de l'activité de session
  updateSessionActivity(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  // Révocation de session
  revokeSession(sessionId) {
    this.activeSessions.delete(sessionId);
  }

  // Révocation de toutes les sessions utilisateur
  revokeAllUserSessions(userId) {
    for (const [sessionId, sessionData] of this.activeSessions.entries()) {
      if (sessionData.userId === userId) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  // Ajout de token à la liste noire
  blacklistToken(token) {
    this.blacklistedTokens.add(token);
  }

  // Validation de mot de passe renforcée
  validatePasswordStrength(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères`);
    }
    if (!hasUppercase) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!hasLowercase) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    if (!hasNumbers) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!hasSpecialChars) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    // Vérifier les mots de passe communs
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Le mot de passe est trop commun');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Hachage sécurisé du mot de passe
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Vérification du mot de passe
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Génération de token de réinitialisation
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Vérification du token de réinitialisation
  verifyResetToken(token, storedToken, timestamp) {
    const maxAge = 60 * 60 * 1000; // 1 heure
    const isValid = token === storedToken && 
                   Date.now() - timestamp < maxAge;
    
    if (isValid) {
      // Invalider le token après utilisation
      storedToken = null;
    }
    
    return isValid;
  }

  // Audit des sessions
  getSessionAudit() {
    const sessions = Array.from(this.activeSessions.values());
    return {
      totalSessions: sessions.length,
      activeUsers: new Set(sessions.map(s => s.userId)).size,
      averageSessionDuration: sessions.reduce((acc, s) => 
        acc + (Date.now() - s.createdAt), 0) / sessions.length,
      sessionsByRole: sessions.reduce((acc, s) => {
        acc[s.role] = (acc[s.role] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

module.exports = new SessionManager();
