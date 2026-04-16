import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ListMusic,
} from "lucide-react";

import {
  togglePlay,
  nextSong,
  prevSong,
  setVolume,
} from "../../features/player/playerSlice.js";

import { useAppDispatch, useAppSelector } from "../../app/hooks.js";
import useAudio from "../../hooks/useAudio"; // 👈 NEW

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export default function PlayerBar() {
  const dispatch = useAppDispatch();

  const { currentSong, isPlaying, volume } = useAppSelector(
    (state) => state.player
  );

  const { progress, duration, seek } = useAudio(); // 👈 use hook

  const [isMuted, setIsMuted] = useState(false);

  const hasSong = Boolean(currentSong);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    dispatch(setVolume(isMuted ? 1 : 0));
  };

  const buttonHover = { scale: 1.1 };
  const buttonTap = { scale: 0.9 };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 h-20 sm:h-24 bg-zinc-900/90 backdrop-blur-xl border-t border-white/10 text-white"
    >
      <div className="h-full w-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* LEFT */}
        <div className="flex items-center gap-4 w-1/3 min-w-[120px]">
          {hasSong ? (
            <>
              <img
                src={currentSong.thumbnail}
                alt="cover"
                className="h-14 w-14 rounded-md object-cover"
              />
              <div className="truncate">
                <p className="font-semibold truncate">{currentSong.title}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-zinc-500">
              <ListMusic />
              No song selected
            </div>
          )}
        </div>

        {/* CENTER */}
        <div className="flex flex-col items-center w-full max-w-xl">
          <div className="flex items-center gap-6 mb-2">
            
            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              disabled={!hasSong}
              onClick={() => dispatch(prevSong())}
            >
              <SkipBack />
            </motion.button>

            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              disabled={!hasSong}
              onClick={() => dispatch(togglePlay())}
              className="bg-white text-black p-2 rounded-full"
            >
              <AnimatePresence mode="wait">
                {isPlaying ? <Pause /> : <Play />}
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              disabled={!hasSong}
              onClick={() => dispatch(nextSong())}
            >
              <SkipForward />
            </motion.button>
          </div>

          {/* PROGRESS */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs w-10 text-right">
              {formatTime(progress)}
            </span>

            <input
              type="range"
              min="0"
              max={duration || 0}
              value={progress}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full"
            />

            <span className="text-xs w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex items-center gap-3 w-1/3 justify-end">
          
          <button onClick={toggleMute}>
            {volume === 0 ? <VolumeX /> : <Volume2 />}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={(e) =>
              dispatch(setVolume(Number(e.target.value) / 100))
            }
          />
        </div>
      </div>
    </motion.div>
  );
}