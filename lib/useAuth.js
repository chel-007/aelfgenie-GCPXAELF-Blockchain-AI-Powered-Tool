"use client"
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../lib/UserContext';

const useAuth = () => {
    const { setUser } = useUser();
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      const expirationTime = localStorage.getItem('tokenExpiration');
  
      if (token && expirationTime) {
        const currentTime = new Date().getTime();
  
        if (currentTime > parseInt(expirationTime, 10)) {
          // Token has expired
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiration');
          setUser(null);
        } else {
          // Token is valid
          const decoded = jwtDecode(token);
          setUser(decoded);
        }
      }
    }, [setUser]);
  };
  
  export default useAuth;
