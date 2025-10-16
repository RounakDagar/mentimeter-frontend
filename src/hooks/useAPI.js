import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8080';

export const useAPI = () => {
  const { token } = useAuth();
  
    const apiCall = async (endpoint, options = {}) => {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers
        }
      });
  
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    };
  
    return { apiCall };
};