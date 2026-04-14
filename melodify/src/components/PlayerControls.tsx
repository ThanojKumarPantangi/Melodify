import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, Repeat, Shuffle
} from 'lucide-react';

interface Song {
  videoId: string;
  title: string;
  thumbnail: string;
  audioUrl?: string;
}

interface PlayerControlsProps {
  nowPlaying: Song;
  audioUrl: string;
  onSongEnd?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  nowPlaying,
  audioUrl,
  onSongEnd,
  onSkipBack,
  onSkipForward
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleEnded = () => {
    if (isLooping) {
      audioRef.current?.play(); // replay the same song
    } else if (onSongEnd) {
      onSongEnd(); // play next in queue
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = audioUrl;
    audio.load();
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(console.error);

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: nowPlaying.title,
        artwork: [
          { src: nowPlaying.thumbnail, sizes: '96x96', type: 'image/png' },
          { src: nowPlaying.thumbnail, sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audio.play();
        setIsPlaying(true);
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        audio.pause();
        setIsPlaying(false);
      });

      navigator.mediaSession.setActionHandler('seekbackward', () => {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
      });

      navigator.mediaSession.setActionHandler('seekforward', () => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        audio.currentTime = 0;
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        audio.currentTime = audio.duration;
      });
    }
  }, [audioUrl, nowPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [isLooping, onSongEnd]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  };

  const toggleShuffle = () => {
    setIsShuffling(!isShuffling);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-purple-900/50 to-gray-900 backdrop-blur-md border-t border-purple-800/30 p-4 z-50">
      <audio ref={audioRef} />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between max-w-screen-xl mx-auto">
        {/* Now Playing Info */}
        <div className="flex items-center space-x-3 min-w-0 md:w-1/3">
          <img
            src={nowPlaying.thumbnail}
            alt={nowPlaying.title}
            className="w-12 h-12 rounded-lg object-cover shadow-lg"
          />
          <div className="min-w-0">
            <h4 className="text-white font-medium truncate text-sm">
              {nowPlaying.title}
            </h4>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center w-full md:w-1/3">
          <div className="flex items-center justify-center space-x-4 mb-2">
            {/* <button
              onClick={toggleShuffle}
              className={`transition-colors ${isShuffling ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button> */}

            <button
              onClick={onSkipBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
              )}
            </button>

            <button
              onClick={onSkipForward}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={toggleLoop}
              className={`transition-colors ${isLooping ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
            >
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full px-2">
            <span className="text-xs text-gray-400 min-w-[32px] text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <div className="h-1 bg-gray-600 rounded-full">
                <div
                  className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-100"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-gray-400 min-w-[32px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex justify-center items-center space-x-4 mt-3 md:mt-0 md:w-1/3 md:justify-end">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <div className="relative w-20">
              <div className="h-1 bg-gray-600 rounded-full">
                <div
                  className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  style={{ width: `${volume}%` }}
                />
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={handleVolumeChange}
                className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
