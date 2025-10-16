import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);
const API_BASE_URL = 'http://localhost:8080'; 

export const AuthProvider = ({ children }) => {
  
    const [user, setUser] = useState(null);
      const [token, setToken] = useState(localStorage.getItem('token'));
      const [loading, setLoading] = useState(true);
    
      useEffect(() => {
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ username: payload.sub });
          } catch (e) {
            localStorage.removeItem('token');
            setToken(null);
          }
        }
        setLoading(false);
      }, [token]);
    
      const login = async (username, password) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        
        if (res.ok) {
          const newToken = await res.text();
          localStorage.setItem('token', newToken);
          setToken(newToken);
          const payload = JSON.parse(atob(newToken.split('.')[1]));
          setUser({ username: payload.sub });
          return true;
        }
        return false;
      };
    
      const register = async (username, email, password) => {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, provider: 'LOCAL' })
        });
        
        if (res.ok) {
          const newToken = await res.text();
          localStorage.setItem('token', newToken);
          setToken(newToken);
          const payload = JSON.parse(atob(newToken.split('.')[1]));
          setUser({ username: payload.sub });
          return true;
        }
        return false;
      };
    
      const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      };
    
      return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
          {children}
        </AuthContext.Provider>
      );
};

export const useAuth = () => useContext(AuthContext);