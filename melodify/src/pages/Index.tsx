import React, { useEffect, useState } from 'react';
import AuthWrapper from '../components/AuthWrapper';
import MelodifyApp from '../components/MelodifyApp';
import { ToastProvider } from '../components/ToastContext';

const Index = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUser({ username: storedUsername });
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('username', userData.username);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-white">
        {user ? (
          <MelodifyApp user={user} onLogout={handleLogout} />
        ) : (
          <AuthWrapper onLogin={handleLogin} />
        )}
      </div>
    </ToastProvider>
  );
};

export default Index;
