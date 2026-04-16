import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setCurrentTime,
  setDuration,
  nextSong,
} from "../features/player/playerSlice";

export default function useAudio() {
  const audioRef = useRef(null);
  const dispatch = useAppDispatch();

  const { currentSong, isPlaying, volume } = useAppSelector(
    (state) => state.player
  );

  const [progress, setProgress] = useState(0);
  const [duration, setLocalDuration] = useState(0);

  // Initialize audio once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  // ONLY load when song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audioUrl) return;

    audio.pause();
    audio.currentTime = 0;

    audio.src = currentSong.audioUrl;
    audio.load();

  }, [currentSong]); 

  // Play / Pause separately
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn("Play failed:", err);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong]);

  // Volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  // Events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const current = audio.currentTime || 0;
      setProgress(current);
      dispatch(setCurrentTime(current));
    };

    const setMeta = () => {
      const dur = audio.duration || 0;
      setLocalDuration(dur);
      dispatch(setDuration(dur));
    };

    const handleEnd = () => {
      dispatch(nextSong());
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setMeta);
    audio.addEventListener("ended", handleEnd);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setMeta);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [dispatch]);

  // Seek
  const seek = (time) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setProgress(time);
    dispatch(setCurrentTime(time));
  };

  return {
    progress,
    duration,
    seek,
  };
}