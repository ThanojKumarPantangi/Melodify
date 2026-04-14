
import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

interface AuthWrapperProps {
  onLogin: (userData: any) => void;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  const switchMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      {isLogin ? (
        <Login onLogin={onLogin} onSwitch={switchMode} />
      ) : (
        <Signup onLogin={onLogin} onSwitch={switchMode} />
      )}
    </>
  );
};

export default AuthWrapper;
