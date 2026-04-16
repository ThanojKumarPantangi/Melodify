import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Play, Clock, Search, MoreHorizontal } from 'lucide-react';
import { useAppSelector,useAppDispatch } from '../app/hooks.js';
import { setCurrentSong } from '../features/player/playerSlice.js';

// --- ANIMATION VARIANTS ---
const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function Recent() {
  const recentSongs = useAppSelector(state=>state.recent.songs);
  const dispatch = useAppDispatch();

  const RECENT_SONGS = Array.isArray(recentSongs)
  ? recentSongs.map(song => ({
      id: song.id,
      title: song.title,
      artist: 'Unknown Artist',
      thumbnail: song.thumbnail,
      audioUrl: song.audioUrl,
    }))
  : [];

  async function handlePlay(song) {
    if(!song) return;
    dispatch(setCurrentSong(song));
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 font-sans text-neutral-50 selection:bg-indigo-500/30">
      {/* Subtle Background Mesh Gradient */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-900/10 mix-blend-screen blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-900/10 mix-blend-screen blur-[120px]" />
      </div>

      <motion.main 
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-8">
          
          {/* 1. Header Section */}
          <header className="flex items-end justify-between border-b border-neutral-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
                <History className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-white">Recently Played</h1>
                <p className="text-sm font-medium text-neutral-400">
                  {RECENT_SONGS.length > 0 ? 'Your recently played tracks' : 'No recent activity'}
                </p>
              </div>
            </div>
            
          </header>

          {/* 2. Conditional Rendering: List or Empty State */}
          {RECENT_SONGS.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-2"
            >
              <AnimatePresence mode="popLayout">
                {RECENT_SONGS.map((song) => (
                  <motion.div
                    key={song.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    whileHover={{ scale: 1.01 }}
                    className="group relative flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-neutral-900/80 hover:shadow-lg cursor-pointer border border-transparent hover:border-neutral-800"
                  >
                    {/* Thumbnail & Play Overlay */}
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-800 shadow-sm">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                        <Play onClick={()=>handlePlay(song)} className="h-6 w-6 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                    
                    {/* Song Info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <h3 className="truncate text-base font-semibold text-neutral-100 group-hover:text-indigo-400 transition-colors">{song.title}</h3>
                      <p className="truncate text-sm text-neutral-400">{song.artist}</p>
                    </div>
                    
                    {/* Time Indicator & Actions (Desktop/Tablet) */}
                    <div className="hidden sm:flex items-center gap-6 pr-2 text-neutral-500">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{song.time}</span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-white rounded-full hover:bg-neutral-800">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Time Indicator (Mobile) */}
                    <div className="flex sm:hidden items-center pr-1 text-xs text-neutral-500">
                      {song.time}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            // Empty State
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: 'spring', damping: 20 }}
              className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/20 px-6 py-24 text-center backdrop-blur-sm mt-4"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 shadow-inner border border-neutral-800/50">
                <History className="h-10 w-10 text-neutral-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">No recently played songs 🎧</h2>
              <p className="mb-8 max-w-sm text-neutral-400">
                Start listening to music, and your history will seamlessly appear right here.
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-colors hover:bg-indigo-400"
              >
                <Search className="h-4 w-4" />
                Explore Music
              </motion.button>
            </motion.div>
          )}

        </div>
      </motion.main>
    </div>
  );
}