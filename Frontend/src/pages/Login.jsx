import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Key, Loader2, AlertCircle } from 'lucide-react';
import {loginApi} from "../services/auth.service.js"
import toast from 'react-hot-toast';
import {useDispatch,useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import {loginStart, loginSuccess, loginFailure} from "../features/auth/authSlice.js";

const InputField = ({ label, id, icon: Icon, type = 'text', value, onChange, placeholder }) => {
  return (
    <div className="space-y-1.5 flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
          <Icon size={20} />
        </div>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
        />
      </div>
    </div>
  );
};

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    authKey: ''
  });
  const isLoading=useSelector(state=>state.auth.loading)
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username || !formData.password || !formData.authKey) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      dispatch(loginStart());

      const response = await loginApi(formData);

      const user = response?.data?.user;
      const token = response?.data?.token;
      const message = response?.data?.message;

      // Redux handles localStorage internally
      dispatch(loginSuccess({ user, token }));

      toast.success(message || "Login successful");

      // Redirect
      navigate("/home");

    } catch (error) {
      const errMsg = error?.message || "Login failed";

      dispatch(loginFailure(errMsg));
      toast.error(errMsg);
    }
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        duration: 0.5, 
        when: "beforeChildren",
        staggerChildren: 0.1 
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 selection:bg-blue-500/30"
    >
      <motion.div 
        variants={cardVariants}
        className="w-full max-w-md bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-8 relative overflow-hidden"
      >
        {/* Subtle decorative glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div variants={itemVariants} className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Enter your credentials to access the system.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <motion.div variants={itemVariants}>
            <InputField
              label="Username"
              id="username"
              icon={User}
              placeholder="e.g. john_doe"
              value={formData.username}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <InputField
              label="Password"
              id="password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <InputField
              label="Authentication Key"
              id="authKey"
              icon={Key}
              placeholder="xxxx-xxxx-xxxx"
              value={formData.authKey}
              onChange={handleChange}
            />
          </motion.div>

          {/* Error Message Animation */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/50"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              whileHover={!isLoading ? { scale: 1.015 } : {}}
              whileTap={!isLoading ? { scale: 0.985 } : {}}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </motion.button>
          </motion.div>
        </form>
        <motion.div variants={itemVariants} className="mt-6 text-center relative z-10">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Don’t have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors hover:underline underline-offset-4"
            >
              Signup
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}