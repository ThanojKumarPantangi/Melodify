import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import {signupAPi} from "../services/auth.service.js"
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";

// Reusable Input Component
const InputField = ({ label, id, icon: Icon, type = 'text', value, onChange, placeholder }) => {
  return (
    <div className="space-y-1.5 flex flex-col">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
          <Icon size={20} />
        </div>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
        />
      </div>
    </div>
  );
};

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error automatically when user corrects inputs
    if (error) setError('');
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.username || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setIsLoading(true);

            const result = await signupAPi(formData);

            const message = result?.data?.message || "Signup successful";

            toast.success(message);
            setFormData({ username: '', password: '', confirmPassword: '' });
            setError('');

        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Signup failed";

            setError(message);
            toast.error(message);

        } finally {
            setIsLoading(false);
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
      className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 selection:bg-indigo-500/30"
    >
      <motion.div 
        variants={cardVariants}
        className="w-full max-w-md bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 p-8 relative overflow-hidden"
      >
        {/* Subtle decorative glow effect */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div variants={itemVariants} className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Create an Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Join us today and get started.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <motion.div variants={itemVariants}>
            <InputField
              label="Username"
              id="username"
              icon={User}
              placeholder="e.g. alex_smith"
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
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <InputField
              label="Confirm Password"
              id="confirmPassword"
              type="password"
              icon={Lock}
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </motion.div>

          {/* Validation Error Animation */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-sm border border-red-200 dark:border-red-900/50"
              >
                <AlertCircle size={16} className="shrink-0" />
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="mt-6 text-center relative z-10">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors hover:underline underline-offset-4"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}