import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: localStorage.getItem('accessToken') || '',
    publicKey: localStorage.getItem('publicKey') || '',
  });

  useEffect(() => {
    if (auth.accessToken) {
      localStorage.setItem('accessToken', auth.accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }

    if (auth.publicKey) {
      localStorage.setItem('publicKey', auth.publicKey);
    } else {
      localStorage.removeItem('publicKey');
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};