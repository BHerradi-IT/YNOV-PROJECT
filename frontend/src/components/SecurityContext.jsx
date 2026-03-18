import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Security context pour la gestion des politiques de sécurité
const SecurityContext = createContext();

// Actions pour le reducer de sécurité
const SECURITY_ACTIONS = {
  SET_SECURITY_POLICY: 'SET_SECURITY_POLICY',
  LOG_SECURITY_EVENT: 'LOG_SECURITY_EVENT',
  UPDATE_THREAT_LEVEL: 'UPDATE_THREAT_LEVEL',
  SET_USER_PERMISSIONS: 'SET_USER_PERMISSIONS',
  AUDIT_ACTION: 'AUDIT_ACTION'
};

// État initial de sécurité
const initialState = {
  policies: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90
    },
    sessionPolicy: {
      timeout: 30 * 60 * 1000, // 30 minutes
      maxConcurrentSessions: 3
    },
    dataPolicy: {
      encryption: 'AES-256',
      backupFrequency: 'daily',
      retentionPeriod: 365
    }
  },
  auditLog: [],
  threatLevel: 'low',
  userPermissions: {},
  lastSecurityUpdate: new Date().toISOString()
};

// Reducer pour la gestion de sécurité
function securityReducer(state, action) {
  switch (action.type) {
    case SECURITY_ACTIONS.SET_SECURITY_POLICY:
      return {
        ...state,
        policies: {
          ...state.policies,
          ...action.payload
        },
        lastSecurityUpdate: new Date().toISOString()
      };

    case SECURITY_ACTIONS.LOG_SECURITY_EVENT:
      return {
        ...state,
        auditLog: [
          ...state.auditLog,
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type: action.payload.type,
            description: action.payload.description,
            userId: action.payload.userId,
            ipAddress: action.payload.ipAddress,
            userAgent: action.payload.userAgent,
            severity: action.payload.severity || 'info'
          }
        ].slice(-1000) // Garder seulement les 1000 derniers événements
      };

    case SECURITY_ACTIONS.UPDATE_THREAT_LEVEL:
      return {
        ...state,
        threatLevel: action.payload,
        lastSecurityUpdate: new Date().toISOString()
      };

    case SECURITY_ACTIONS.SET_USER_PERMISSIONS:
      return {
        ...state,
        userPermissions: {
          ...state.userPermissions,
          [action.payload.userId]: action.payload.permissions
        }
      };

    case SECURITY_ACTIONS.AUDIT_ACTION:
      return {
        ...state,
        auditLog: [
          ...state.auditLog,
          {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type: 'USER_ACTION',
            description: action.payload.action,
            userId: action.payload.userId,
            resource: action.payload.resource,
            result: action.payload.result,
            severity: 'info'
          }
        ].slice(-1000)
      };

    default:
      return state;
  }
}

// Provider de sécurité
export function SecurityProvider({ children }) {
  const [state, dispatch] = useReducer(securityReducer, initialState);

  // Fonctions de sécurité
  const logSecurityEvent = (eventData) => {
    dispatch({
      type: SECURITY_ACTIONS.LOG_SECURITY_EVENT,
      payload: {
        ...eventData,
        ipAddress: getClientIP(),
        userAgent: navigator.userAgent
      }
    });
  };

  const auditUserAction = (userId, action, resource, result = 'success') => {
    dispatch({
      type: SECURITY_ACTIONS.AUDIT_ACTION,
      payload: { userId, action, resource, result }
    });
  };

  const validatePassword = (password) => {
    const policy = state.policies.passwordPolicy;
    
    if (password.length < policy.minLength) return false;
    if (policy.requireUppercase && !/[A-Z]/.test(password)) return false;
    if (policy.requireLowercase && !/[a-z]/.test(password)) return false;
    if (policy.requireNumbers && !/\d/.test(password)) return false;
    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    
    return true;
  };

  const checkPermission = (userId, permission) => {
    const userPerms = state.userPermissions[userId];
    return userPerms && userPerms.includes(permission);
  };

  const updateThreatLevel = (level) => {
    dispatch({
      type: SECURITY_ACTIONS.UPDATE_THREAT_LEVEL,
      payload: level
    });
  };

  // Obtenir l'IP du client (simulation)
  const getClientIP = () => {
    return '127.0.0.1'; // En production, utiliser une vraie détection d'IP
  };

  // Monitoring de sécurité en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Vérifier les menaces potentielles
      const recentEvents = state.auditLog.filter(
        event => Date.now() - new Date(event.timestamp).getTime() < 5 * 60 * 1000
      );

      const failedLogins = recentEvents.filter(
        event => event.type === 'LOGIN_FAILED'
      ).length;

      if (failedLogins > 5) {
        updateThreatLevel('high');
      } else if (failedLogins > 2) {
        updateThreatLevel('medium');
      } else {
        updateThreatLevel('low');
      }
    }, 60000); // Vérifier chaque minute

    return () => clearInterval(interval);
  }, [state.auditLog]);

  const value = {
    ...state,
    dispatch,
    logSecurityEvent,
    auditUserAction,
    validatePassword,
    checkPermission,
    updateThreatLevel,
    SECURITY_ACTIONS
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

// Hook pour utiliser le contexte de sécurité
export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

export default SecurityContext;
