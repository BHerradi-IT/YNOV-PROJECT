import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const storedToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (storedToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(storedToken);
        
        // Vérifier si le token est encore valide
        try {
          const tokenData = JSON.parse(atob(storedToken.split('.')[1]));
          if (tokenData.exp * 1000 < Date.now()) {
            // Token expiré
            logout();
          }
        } catch (tokenError) {
          // Erreur de parsing du token, on déconnecte
          logout();
        }
      } catch (error) {
        console.error('Erreur parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    if (!userData || !userToken) {
      console.error('Login failed: missing user data or token');
      return false;
    }
    
    setUser(userData);
    setToken(userToken);
    
    // Stocker le token et les données utilisateur dans localStorage
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log('✅ User logged in successfully:', userData.email);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    console.log('✅ User logged out successfully');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const getAuthHeaders = () => {
    if (!token) {
      return {
        'Content-Type': 'application/json'
      };
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    getAuthHeaders,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
