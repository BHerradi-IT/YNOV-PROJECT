import React, { useState, useEffect, useCallback } from 'react';
import { useSecurity } from './SecurityContext';

// Composant de monitoring de sécurité en temps réel
function SecurityMonitor({ children }) {
  const { logSecurityEvent, updateThreatLevel, threatLevel } = useSecurity();
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);

  // Détection d'activités suspectes
  const detectSuspiciousActivity = useCallback(() => {
    const activities = [];
    
    // Vérifier les tentatives de connexion multiples
    const failedAttempts = parseInt(localStorage.getItem('failed_login_attempts') || '0');
    if (failedAttempts > 3) {
      activities.push({
        type: 'MULTIPLE_LOGIN_ATTEMPTS',
        severity: 'high',
        description: 'Plusieurs tentatives de connexion échouées détectées'
      });
    }

    // Vérifier les changements d'adresse IP
    const currentIP = localStorage.getItem('current_ip');
    const lastIP = localStorage.getItem('last_ip');
    if (lastIP && currentIP !== lastIP) {
      activities.push({
        type: 'IP_CHANGE',
        severity: 'medium',
        description: 'Changement d\'adresse IP détecté'
      });
    }

    // Vérifier les sessions anormalement longues
    const sessionStart = localStorage.getItem('session_start');
    if (sessionStart) {
      const sessionDuration = Date.now() - parseInt(sessionStart);
      if (sessionDuration > 8 * 60 * 60 * 1000) { // 8 heures
        activities.push({
          type: 'LONG_SESSION',
          severity: 'medium',
          description: 'Session utilisateur anormalement longue'
        });
      }
    }

    return activities;
  }, []);

  // Scanner de vulnérabilités côté client
  const scanVulnerabilities = useCallback(() => {
    const vulnerabilities = [];
    
    // Vérifier si le navigateur est à jour
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome/6') || userAgent.includes('Firefox/5')) {
      vulnerabilities.push({
        type: 'OUTDATED_BROWSER',
        severity: 'medium',
        description: 'Navigateur non mis à jour détecté'
      });
    }

    // Vérifier les cookies tiers
    if (navigator.cookieEnabled && document.cookie.length > 1000) {
      vulnerabilities.push({
        type: 'EXCESSIVE_COOKIES',
        severity: 'low',
        description: 'Nombre élevé de cookies détecté'
      });
    }

    // Vérifier si HTTPS est utilisé
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      vulnerabilities.push({
        type: 'INSECURE_PROTOCOL',
        severity: 'high',
        description: 'Connexion non sécurisée détectée'
      });
    }

    return vulnerabilities;
  }, []);

  // Monitoring continu
  useEffect(() => {
    const interval = setInterval(() => {
      const activities = detectSuspiciousActivity();
      const vulnerabilities = scanVulnerabilities();
      
      const allIssues = [...activities, ...vulnerabilities];
      setSuspiciousActivities(allIssues);

      // Journaliser les problèmes détectés
      allIssues.forEach(issue => {
        logSecurityEvent({
          type: issue.type,
          description: issue.description,
          severity: issue.severity,
          userId: localStorage.getItem('user_id') || 'anonymous'
        });
      });

      // Ajuster le niveau de menace
      if (allIssues.some(issue => issue.severity === 'high')) {
        updateThreatLevel('high');
      } else if (allIssues.some(issue => issue.severity === 'medium')) {
        updateThreatLevel('medium');
      } else {
        updateThreatLevel('low');
      }
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [detectSuspiciousActivity, scanVulnerabilities, logSecurityEvent, updateThreatLevel]);

  // Protection contre les attaques XSS
  useEffect(() => {
    const originalConsoleError = console.error;
    
    // Surveiller les erreurs potentielles
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('script') || errorMessage.includes('XSS')) {
        logSecurityEvent({
          type: 'POTENTIAL_XSS',
          description: 'Tentative XSS potentielle détectée',
          severity: 'high'
        });
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, [logSecurityEvent]);

  // Afficher les alertes de sécurité
  const getSecurityAlert = () => {
    if (threatLevel === 'high') {
      return {
        type: 'error',
        message: 'Niveau de menace élevé détecté. Des mesures de sécurité renforcées sont en place.'
      };
    } else if (threatLevel === 'medium') {
      return {
        type: 'warning',
        message: 'Activités suspectes détectées. Surveillance renforcée activée.'
      };
    }
    return null;
  };

  const securityAlert = getSecurityAlert();

  return (
    <>
      {securityAlert && (
        <div className={`security-alert security-alert-${securityAlert.type}`}>
          <span className="security-icon">🔒</span>
          <span>{securityAlert.message}</span>
        </div>
      )}
      
      {children}
      
      <style jsx>{`
        .security-alert {
          position: fixed;
          top: 80px;
          right: 20px;
          max-width: 400px;
          padding: 12px 16px;
          border-radius: 8px;
          z-index: 9999;
          animation: slideIn 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .security-alert-error {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
        }
        
        .security-alert-warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }
        
        .security-icon {
          font-size: 16px;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

export default SecurityMonitor;
