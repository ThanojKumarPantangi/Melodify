import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Music, ListMusic } from 'lucide-react';

const NotFound = () => {
  // Placeholder image URL - a colorful headphones photo as illustrative placeholder
  const illustrationUrl = "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80";

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-neutral-100 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center flex flex-col items-center gap-y-12 w-full max-w-4xl">
        {/* Image Section with responsive scaling and animations */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
        >
          <img
            src={illustrationUrl}
            alt="Colorful Headphones Illustration"
            className="w-full h-auto rounded-3xl shadow-2xl shadow-neutral-950/30"
          />
        </motion.div>

        {/* Text Content with fade and slide up animation */}
        <motion.div
          className="space-y-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-neutral-50 flex items-center gap-3">
            <Music className="w-12 h-12 text-emerald-500" strokeWidth={3}/>
            404 - Page Not Found
          </h1>
          
          <p className="text-xl sm:text-2xl text-neutral-300 max-w-xl">
            Oops! Looks like this page doesn’t exist.
          </p>
          
          <div className="text-base sm:text-lg text-emerald-300 flex items-center gap-2 font-medium">
            Maybe the music got lost 🎶 
            <ListMusic className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Actions with fade and slide up animation, button hover/tap effects, and icons */}
        <motion.div
          className="flex items-center justify-center gap-6 mt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <motion.button
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-emerald-600 text-neutral-950 font-bold text-base hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950/30"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'} // Navigate to Home
          >
            <Home className="w-5 h-5" />
            Go to Home
          </motion.button>
          
          <motion.button
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-neutral-700 text-neutral-100 font-medium text-base hover:bg-neutral-600 transition-colors shadow-md shadow-neutral-950/20"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/search'} // Navigate to Search
          >
            <Search className="w-5 h-5" />
            Go to Search
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;