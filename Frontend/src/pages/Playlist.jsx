import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, ListMusic, Search, Clock } from 'lucide-react';
import { useAppDispatch,useAppSelector } from '../app/hooks';
import { removeFromPlaylist,addToPlaylist } from '../features/playlist/playlistSlice';
import {removePlaylistApi} from "../services/playlist.service.js";
import toast from 'react-hot-toast';
import { addRecentSongApi } from '../services/recent.service.js';
import { setCurrentSong } from '../features/player/playerSlice.js';
import { addToRecent,removeFromRecent } from '../features/recent/recentSlice.js';

// --- ANIMATION VARIANTS ---
const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function Playlist() {
  const playlistSongs=useAppSelector(state=>state.playlist.songs); 
  const dispatch=useAppDispatch();

  const PLAYLIST_SONGS = Array.isArray(playlistSongs)
  ? playlistSongs.map(song => ({
      id: song.id,
      title: song.title,
      artist: 'Unknown Artist',
      thumbnail: song.thumbnail,
      audioUrl: song.audioUrl,
    }))
  : [];

  const handleRemove = async(song) => {
    try {
      if(!song?.id) return;
      const toastId=toast.loading("Removing from playlist...");
      dispatch(removeFromPlaylist(song?.id));
      const res=await removePlaylistApi(song?.id);
      toast.success(res.data.message,{id:toastId});
    } catch (error) {
      dispatch(addToPlaylist(song))
      toast.error(error.message,{id:toastId});
    }
  };

  async function handlePlay(song) {
    if(!song) return;
    const toastId = toast.loading("Fetching song...");
    try {
      dispatch(setCurrentSong(song));
      dispatch(addToRecent(song));

      try {
        await addRecentSongApi(song);
      } catch (err) {
        dispatch(removeFromRecent(song.id)); 
      }

      toast.success("Song loaded!", { id: toastId });
    } catch (error) {
      toast.error(error?.message||"Failed to play song", { id: toastId })
    }
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 font-sans text-neutral-50 selection:bg-indigo-500/30">
      {/* Subtle Background Mesh Gradient */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-[10%] left-[20%] h-[600px] w-[600px] rounded-full bg-emerald-900/10 mix-blend-screen blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] h-[400px] w-[400px] rounded-full bg-indigo-900/10 mix-blend-screen blur-[120px]" />
      </div>

      <motion.main 
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-10">
          
          {/* 1. Header Section */}
          <header className="flex items-end justify-between border-b border-neutral-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
                <ListMusic className="h-8 w-8 text-white" />
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-white">Your Playlist</h1>
                <p className="text-sm font-medium text-neutral-400">
                  {PLAYLIST_SONGS.length > 0 ? `${PLAYLIST_SONGS.length} saved songs` : 'No songs yet'}
                </p>
              </div>
            </div>
          </header>

          {/* 2. Conditional Rendering: Grid or Empty State */}
          {PLAYLIST_SONGS.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              <AnimatePresence mode="popLayout">
                {PLAYLIST_SONGS.map((song) => (
                  <motion.div
                    key={song.id}
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    whileHover={{ y: -6 }}
                    className="group relative flex flex-col gap-3 rounded-2xl bg-neutral-900/50 p-4 border border-neutral-800/50 shadow-sm transition-all hover:bg-neutral-800 hover:shadow-xl hover:shadow-black/50 hover:border-neutral-700"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl shadow-md bg-neutral-800">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl hover:bg-emerald-400 transition-colors"
                        >
                          <Play onClick={()=>handlePlay(song)} className="h-6 w-6 fill-current ml-1" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 px-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-bold text-neutral-100">{song.title}</h3>
                          <p className="truncate text-sm text-neutral-400">{song.artist}</p>
                        </div>
                        
                        {/* Remove Button */}
                        <button 
                          onClick={() => handleRemove(song)}
                          className="mt-0.5 rounded-full p-2 text-neutral-500 hover:bg-neutral-700/50 hover:text-red-400 transition-colors"
                          title="Remove from playlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Duration */}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                        <Clock className="h-3 w-3" />
                        <span>{song.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            // Empty State
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 20 }}
              className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 px-6 py-24 text-center backdrop-blur-sm"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-800/80 shadow-inner">
                <ListMusic className="h-10 w-10 text-neutral-500" />
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Your playlist is empty 🎧</h2>
              <p className="mb-8 max-w-sm text-neutral-400">
                You haven't added any songs yet. Start exploring and build the perfect collection.
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-neutral-200"
              >
                <Search className="h-4 w-4" />
                Browse Music
              </motion.button>
            </motion.div>
          )}

        </div>
      </motion.main>
    </div>
  );
}