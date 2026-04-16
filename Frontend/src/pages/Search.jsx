import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, Play, X, Music, SearchX, Loader2,Plus } from 'lucide-react';
import useDebounce from '../hooks/useDebounce.js';
import { searchApi } from '../services/search.service.js';
import { audioApi } from '../services/audio.service.js';
import { addRecentSongApi } from '../services/recent.service.js';
import {addPlaylistApi} from "../services/playlist.service.js"
import toast from "react-hot-toast"
import { useAppDispatch } from '../app/hooks.js';
import { setCurrentSong } from '../features/player/playerSlice.js';
import { addToRecent,removeFromRecent } from '../features/recent/recentSlice.js';
import { addToPlaylist,removeFromPlaylist } from '../features/playlist/playlistSlice.js';

// --- ANIMATION VARIANTS ---
const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const fadeStateVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

// --- COMPONENTS ---

const SongCard = ({ song }) => {
  const dispatch = useAppDispatch();

  async function handlePlay(song) {
    if(!song) return;
    const toastId = toast.loading("Fetching song...");
    try {
      const res=await audioApi(song?.id)
      const songData={
        id:song?.id,
        title:song?.title,
        thumbnail:song?.thumbnail,
        audioUrl:res?.data?.audioUrl,
      }
      dispatch(setCurrentSong(songData));
      dispatch(addToRecent(songData));

      try {
        await addRecentSongApi(songData);
      } catch (err) {
        dispatch(removeFromRecent(songData.id)); 
      }

      toast.success("Song loaded!", { id: toastId });
    } catch (error) {
      toast.error(error?.message||"Failed to play song", { id: toastId })
    }
  }

  async function handleAddToPlaylist(song) {
    if(!song) return;
    try {
      const toastId=toast.loading("Adding to playlist...");
      dispatch(addToPlaylist(song));
      const res=await addPlaylistApi(song);
      toast.success(res.data.message,{id:toastId});
    } catch (error) {
      removeFromPlaylist(song?.id);
      toast.error(error.message,{id:toastId});
    }
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col gap-3 rounded-xl bg-neutral-900/40 p-3 transition-colors hover:bg-neutral-800/60 cursor-pointer border border-transparent hover:border-neutral-700 shadow-sm hover:shadow-xl hover:shadow-black/40"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-md bg-neutral-800">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay Buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          
          {/* Play Button */}
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handlePlay(song);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-xl"
          >
            <Play className="h-6 w-6 fill-current ml-1" />
          </motion.div>

          {/*  Add to Playlist Button */}
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToPlaylist(song); 
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-xl"
          >
            <Plus className="h-6 w-6" />
          </motion.div>

        </div>
      </div>

      <div className="flex flex-col px-1">
        <h3 className="truncate text-sm font-semibold text-neutral-100">
          {song.title}
        </h3>
        <p className="truncate text-xs text-neutral-400">
          {song.artist}
        </p>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="flex flex-col gap-3 rounded-xl bg-neutral-900/20 p-3 animate-pulse border border-neutral-800/50">
    <div className="aspect-square w-full rounded-lg bg-neutral-800/50" />
    <div className="flex flex-col gap-2 px-1">
      <div className="h-4 w-3/4 rounded bg-neutral-800/50" />
      <div className="h-3 w-1/2 rounded bg-neutral-800/50" />
    </div>
  </div>
);

export default function Search() {
  const [query, setQuery] = useState('');
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim() === '') {
      handleClearSearch();
    }
  };

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
      setIsLoading(true);

      const fetchSongs = async () => {
        try {
          const res = await searchApi(debouncedQuery, controller.signal);
          const items = res.data?.items || [];

          const result = items
            .filter(item => item.id.kind === "youtube#video")
            .map(item => ({
              id: item.id.videoId,
              title: item.snippet.title,
              artist: item.snippet.channelTitle,
              thumbnail: item.snippet.thumbnails?.medium?.url,
          }));

          setResults(result);

        } catch (err) {
          if (err.name !== "AbortError") {
            console.error(err);
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchSongs();

      return () => controller.abort();
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen w-full bg-neutral-950 font-sans text-neutral-50 selection:bg-indigo-500/30">
      {/* Subtle Background Mesh Gradient */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-[10%] left-[50%] -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-fuchsia-900/10 mix-blend-screen blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-900/10 mix-blend-screen blur-[120px]" />
      </div>

      <motion.main 
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-10">
          
          {/* 1. Header Section */}
          <header className="flex flex-col items-center text-center gap-2 pt-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Search</h1>
            <p className="text-sm font-medium text-neutral-400">Find your favorite songs and artists</p>
          </header>

          {/* 2. Search Input */}
          <div className="mx-auto w-full max-w-2xl">
            <div className="group relative flex items-center rounded-full bg-neutral-900/60 p-1 border border-neutral-800 shadow-sm transition-all focus-within:bg-neutral-900 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 hover:border-neutral-700">
              <div className="pl-5 pr-3 text-neutral-400 group-focus-within:text-indigo-400 transition-colors">
                <SearchIcon className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search songs, artists..."
                className="w-full bg-transparent py-4 pr-4 text-base text-neutral-100 placeholder-neutral-500 focus:outline-none"
                autoComplete="off"
              />
              
              {/* Clear Button */}
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleClearSearch}
                    className="mr-3 rounded-full p-2 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 3. Conditional Rendering Area */}
          <div className="min-h-[400px] w-full">
            <AnimatePresence mode="wait">
              
              {/* State A: Initial (No search yet) */}
              {!debouncedQuery && !isLoading && (
                <motion.div 
                  key="initial"
                  variants={fadeStateVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex h-full flex-col items-center justify-center pt-20 text-center"
                >
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-900/50 border border-neutral-800/50 shadow-inner">
                    <Music className="h-10 w-10 text-neutral-600" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">Start searching for music 🎧</h2>
                  <p className="max-w-sm text-neutral-400">
                    Type a song title or artist name in the search bar above to explore our catalog.
                  </p>
                </motion.div>
              )}

              {/* State B: Loading */}
              {debouncedQuery && isLoading && (
                <motion.div 
                  key="loading"
                  variants={fadeStateVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center gap-2 text-indigo-400 font-medium">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Searching...
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                </motion.div>
              )}

              {/* State C: Results Found */}
              {debouncedQuery && !isLoading && results.length > 0 && (
                <motion.div 
                  key="results"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex flex-col gap-6"
                >
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Top Results
                  </h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {results.map((song) => (
                      <SongCard key={song.id} song={song} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* State D: No Results */}
              {debouncedQuery && !isLoading && results.length === 0 && (
                <motion.div 
                  key="empty"
                  variants={fadeStateVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="flex h-full flex-col items-center justify-center pt-20 text-center"
                >
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-900/50 border border-neutral-800/50 shadow-inner">
                    <SearchX className="h-10 w-10 text-neutral-600" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">No results found</h2>
                  <p className="max-w-sm text-neutral-400">
                    We couldn't find any matches for "<span className="text-neutral-200">{debouncedQuery}</span>". Try searching something else.
                  </p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </motion.main>
    </div>
  );
}