import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, User, Music } from 'lucide-react';
import { useAppSelector,useAppDispatch } from '../app/hooks.js';
import {getRecentSongs} from "../services/recent.service.js";
import {getPlaylistApi} from "../services/playlist.service.js";
import {fetchPlaylistStart,fetchPlaylistSuccess,fetchPlaylistFailure} from "../features/playlist/playlistSlice.js";
import {fetchRecentStart,fetchRecentSuccess,fetchRecentFailure} from "../features/recent/recentSlice.js";
import {setCurrentSong} from "../features/player/playerSlice.js";
import {useNavigate} from "react-router-dom";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const pageVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5 } }
};

// --- COMPONENTS ---

const SongCard = ({ song }) => {
  const dispatch = useAppDispatch();
  const handlePlay = (song) => {
    dispatch(setCurrentSong(song));
  };
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col gap-3 rounded-xl bg-neutral-900/40 p-3 transition-colors hover:bg-neutral-800/60 cursor-pointer"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-md">
        <img
          src={song.thumbnail}
          alt={song.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
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
        </div>
      </div>
      
      <div className="flex flex-col px-1">
        <h3 className="truncate text-sm font-semibold text-neutral-100">{song.title}</h3>
        <p className="truncate text-xs text-neutral-400">{song.artist}</p>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="flex flex-col gap-3 rounded-xl bg-neutral-900/20 p-3 animate-pulse">
    <div className="aspect-square w-full rounded-lg bg-neutral-800/50" />
    <div className="flex flex-col gap-2 px-1">
      <div className="h-4 w-3/4 rounded bg-neutral-800/50" />
      <div className="h-3 w-1/2 rounded bg-neutral-800/50" />
    </div>
  </div>
);

const SongSection = ({ title, songs }) => {
  return (
    <motion.section variants={itemVariants} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
      
      {songs.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {songs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 py-12 text-center">
          <Music className="mb-3 h-10 w-10 text-neutral-600" />
          <p className="text-sm font-medium text-neutral-300">Start listening to build your music library 🎧</p>
        </div>
      )}
    </motion.section>
  );
};

export default function Home() {
  const dispatch = useAppDispatch();
  const { songs: recentSongs, isLoading } = useAppSelector(state => state.recent);
  const {songs: playlistSongs} = useAppSelector(state => state.playlist);
  
  const RECENT_SONGS = Array.isArray(recentSongs)
  ? recentSongs.map(song => ({
      id: song.id,
      title: song.title,
      artist: 'Unknown Artist',
      thumbnail: song.thumbnail,
      audioUrl: song.audioUrl,
    }))
  : [];

  const PLAYLIST_SONGS = Array.isArray(playlistSongs)
  ? playlistSongs.map(song => ({
      id: song.id,
      title: song.title,
      artist: 'Unknown Artist',
      thumbnail: song.thumbnail,
      audioUrl: song.audioUrl,
    }))
  : [];

  const hasRecentSongs = RECENT_SONGS.length > 0;
  const hasPlaylistSongs = PLAYLIST_SONGS.length > 0;
  const navigate=useNavigate();

  const username = useAppSelector(
    (state) => state.auth.user?.username?.toUpperCase()
  );

  // Synchronous greeting calculation - fixes the cascading render issue
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  const greeting = getGreeting();

  useEffect(() => {
    if (!username) return;

    const fetchRecent = async () => {
      try {
        dispatch(fetchRecentStart());
        const res = await getRecentSongs();
        const data = res.data?.songs?.map(song => ({
          id: song.videoId,
          title: song.title,
          artist: 'Unknown Artist',
          thumbnail: song.thumbnail,
          audioUrl: song.audioUrl,
        })) || [];

        dispatch(fetchRecentSuccess(data));
      } catch (err) {
        dispatch(fetchRecentFailure(err.message));
      }
    };

    fetchRecent();
  }, [username, dispatch]);

  // Playlist
  useEffect(() => {
    if (!username) return;

    const fetchPlaylist = async () => {
      try {
        dispatch(fetchPlaylistStart());
        const res = await getPlaylistApi();
        const data = res.data?.songs?.map(song => ({
          id: song.videoId,
          title: song.title,
          artist: 'Unknown Artist',
          thumbnail: song.thumbnail,
          audioUrl: song.audioUrl,
        })) || [];
        dispatch(fetchPlaylistSuccess(data));
      } catch (err) {
        dispatch(fetchPlaylistFailure(err.message));
      }
    };

    fetchPlaylist();
  }, [username, dispatch]);

  return (
    <div className="min-h-screen w-full bg-neutral-950 font-sans text-neutral-50 selection:bg-indigo-500/30">
      {/* Subtle Background Mesh Gradient */}
      <div className="pointer-events-none fixed top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-indigo-900/20 mix-blend-screen blur-[120px]" />
        <div className="absolute top-[10%] right-[5%] h-[400px] w-[400px] rounded-full bg-purple-900/10 mix-blend-screen blur-[120px]" />
      </div>

      <motion.main 
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 lg:px-8"
      >
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-10">
          
          {/* 1. Header Section */}
          <motion.header variants={itemVariants} className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">{greeting}</h1>
              <p className="text-sm font-medium text-neutral-400">Welcome back, {username}</p>
            </div>
            
          </motion.header>

          {/* 2. Search Shortcut */}
          <motion.div variants={itemVariants} className="w-full" onClick={()=>navigate("/search")}>
            <div className="group relative flex cursor-text items-center rounded-full bg-neutral-900/60 px-4 py-3 border border-neutral-800 transition-colors hover:bg-neutral-800/80 hover:border-neutral-700">
              <Search className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-neutral-200" />
              <span className="ml-3 text-sm text-neutral-500 transition-colors group-hover:text-neutral-300">
                What do you want to listen to?
              </span>
            </div>
          </motion.div>

          {/* Skeletons or Content */}
          {isLoading ? (
            <motion.div variants={containerVariants} className="flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <div className="h-7 w-48 rounded-md bg-neutral-900 animate-pulse" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="h-7 w-48 rounded-md bg-neutral-900 animate-pulse" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {[...Array(5)].map((_, i) => <SkeletonCard key={`t-${i}`} />)}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} className="flex flex-col gap-10">
              {/* Recently Played */}
              {hasRecentSongs && (
                <SongSection title="Recently Played" songs={RECENT_SONGS} />
              )}

              {/* Discover Music */}
              {(hasPlaylistSongs && !hasRecentSongs) && (
                <SongSection title="Playlist" songs={PLAYLIST_SONGS} />
              )}

            </motion.div>
          )}

        </motion.div>
      </motion.main>
    </div>
  );
}