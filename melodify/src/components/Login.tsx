
import React, { useState } from 'react';
import { useToast } from './ToastContext';

interface LoginProps {
  onLogin: (userData: any) => void;
  onSwitch: () => void;
}

const API_BASE_URL = 'http://localhost:3000';

const Login: React.FC<LoginProps> = ({ onLogin, onSwitch }) => {
  const { showToast } = useToast();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    authKey: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      onLogin(userData);
      // After successful login
      localStorage.setItem('username', userData.username);
      showToast('Login successful!', 'success');
      
    } catch (err) {
      showToast('Invalid username, password, or auth key', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Melodify</h1>
          <h2 className="text-xl text-white/80">Login to your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2" htmlFor="authKey">
              Authentication Key
            </label>
            <input
              type="text"
              id="authKey"
              name="authKey"
              value={credentials.authKey}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
              placeholder="Enter your 6-digit Auth Key"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Login
          </button>
        </form>

        <p className="text-white/80 text-center mt-8">
          Don't have an account?{' '}
          <button
            onClick={onSwitch}
            className="text-purple-300 hover:text-purple-200 font-medium underline focus:outline-none transition-colors duration-200"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
