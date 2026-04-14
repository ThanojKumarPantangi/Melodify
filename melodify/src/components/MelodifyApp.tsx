import React, { useState, useEffect, useCallback } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import MainContent from './MainContent';
import PlayerControls from './PlayerControls';
import Header from './Header';
import { useToast } from './ToastContext';

interface User {
  username: string;
}

interface Song {
  videoId: string;
  title: string;
  thumbnail: string;
  audioUrl?: string;
  snippet?: {
    title: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
  id?: {
    videoId: string;
  };
}

interface MelodifyAppProps {
  user: User;
  onLogout: () => void;
}

const API_BASE_URL = 'http://localhost:3000';

const MelodifyApp: React.FC<MelodifyAppProps> = ({ user, onLogout }) => {
  const { showToast } = useToast();
  const [currentSection, setCurrentSection] = useState('home');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Song | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioUrlCache, setAudioUrlCache] = useState<Record<string, string>>({});
  const [userProfile, setUserProfile] = useState<any>(null);
  const [playQueue, setPlayQueue] = useState<Song[]>([]); // ✅ Fixed: Inside component

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (!savedUsername || savedUsername !== user.username) {
      localStorage.setItem('username', user.username);
    }
  }, [user.username]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const search = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.items || []);
    } catch (err) {
      console.error('Search error:', err);
      showToast('Search failed', 'error');
    }
  };

  const playSong = async (song: Song) => {
    try {
      const videoId = song.id?.videoId || song.videoId;
      if (!videoId) throw new Error('No video ID found');

      let audioUrlToPlay = audioUrlCache[videoId];

      if (!audioUrlToPlay) {
        const audioRes = await fetch(`${API_BASE_URL}/audio?videoId=${videoId}`);
        const audioData = await audioRes.json();
        if (!audioData.audioUrl) throw new Error('No audio URL received');

        audioUrlToPlay = audioData.audioUrl;
        setAudioUrlCache(prev => ({ ...prev, [videoId]: audioUrlToPlay }));
      }

      setAudioUrl(audioUrlToPlay);

      const completeSong = {
        videoId,
        title: song.snippet?.title || song.title,
        thumbnail: song.snippet?.thumbnails?.default?.url || song.thumbnail,
        audioUrl: audioUrlToPlay
      };

      setNowPlaying(completeSong);
      addToRecent(completeSong);
    } catch (err: any) {
      console.error('Play error:', err);
      showToast(`Failed to play song: ${err.message}`, 'error');
    }
  };

  const handlePlayAll = async (songs: Song[]) => {
    if (!songs.length) return;
    await playSong(songs[0]);
    setPlayQueue(songs);
  };

  const handleNextInQueue = () => {
    if (!nowPlaying || !playQueue.length) return;

    const currentIndex = playQueue.findIndex(song => song.videoId === nowPlaying.videoId);
    const nextSong = playQueue[currentIndex + 1];

    if (nextSong) {
      playSong(nextSong);
    } else {
      setPlayQueue([]); // end of queue
    }
  };

    const handleSkipForward = () => {
      if (!nowPlaying || !playQueue.length) return;

      const currentIndex = playQueue.findIndex(song => song.videoId === nowPlaying.videoId);
      const nextSong = playQueue[currentIndex + 1];
      if (nextSong) {
        playSong(nextSong);
      }
    };

    const handleSkipBack = () => {
      if (!nowPlaying || !playQueue.length) return;

      const currentIndex = playQueue.findIndex(song => song.videoId === nowPlaying.videoId);
      const prevSong = playQueue[currentIndex - 1];
      if (prevSong) {
        playSong(prevSong);
      } else {
        // Restart the current song if it's the first one
        const audio = document.querySelector('audio');
        if (audio) audio.currentTime = 0;
      }
    };


  const addToPlaylist = async (song: Song) => {
    try {
      const videoId = song.id?.videoId || song.videoId;
      const title = song.snippet?.title || song.title;
      const thumbnail = song.snippet?.thumbnails?.default?.url || song.thumbnail;

      let audioUrlToUse = audioUrlCache[videoId];

      if (!audioUrlToUse) {
        const audioRes = await fetch(`${API_BASE_URL}/audio?videoId=${videoId}`);
        const audioData = await audioRes.json();
        if (!audioData.audioUrl) throw new Error('Failed to get audio URL');

        audioUrlToUse = audioData.audioUrl;
        setAudioUrlCache(prev => ({ ...prev, [videoId]: audioUrlToUse }));
      }

      const response = await fetch(`${API_BASE_URL}/playlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          videoId,
          title,
          thumbnail,
          audioUrl: audioUrlToUse
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add to playlist');
      }

      showToast('Added to playlist!', 'success');
      loadPlaylist();
    } catch (err: any) {
      console.error('Add to playlist error:', err);
      showToast(err.message, 'error');
    }
  };

  const addToRecent = async (song: Song) => {
    try {
      if (!song.videoId || !song.title || !song.thumbnail || !song.audioUrl) {
        throw new Error('Incomplete song data for recently played');
      }

      const response = await fetch(`${API_BASE_URL}/recent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          videoId: song.videoId,
          title: song.title,
          thumbnail: song.thumbnail,
          audioUrl: song.audioUrl
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update recently played');
      }

      loadRecentlyPlayed();
    } catch (err) {
      console.error('Add to recent error:', err);
    }
  };

  const loadPlaylist = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/playlist/${user.username}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load playlist');
      setPlaylist(data.songs || []);
    } catch (err: any) {
      console.error('Load playlist error:', err);
      showToast(err.message, 'error');
    }
  }, [user.username, showToast]);

  const loadRecentlyPlayed = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recent/${user.username}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Request failed with status ${response.status}`
        }));
        throw new Error(errorData.error || 'Failed to load recently played');
      }

      const data = await response.json();
      setRecentlyPlayed(data.songs || []);
    } catch (err: any) {
      console.error('Load recent error:', err);
    }
  }, [user.username]);

  const removeFromPlaylist = async (videoId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/playlist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, videoId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to remove from playlist');
      }

      showToast('Removed from playlist', 'success');
      loadPlaylist();
    } catch (err: any) {
      console.error('Remove from playlist error:', err);
      showToast(`Couldn't remove song: ${err.message}`, 'error');
    }
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.username}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch user profile');
      }
      const data = await response.json();
      setUserProfile(data);
    } catch (err) {
      console.error('Fetch user profile error:', err);
    }
  }, [user.username]);

  useEffect(() => {
    loadPlaylist();
    loadRecentlyPlayed();
    fetchUserProfile();
  }, [loadPlaylist, loadRecentlyPlayed, fetchUserProfile]);

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Header
          user={user}
          onLogout={() => {
            localStorage.removeItem('username');
            onLogout();
          }}
          query={query}
          setQuery={setQuery}
          onSearch={search}
          onSectionChange={setCurrentSection}
        />

        <div className="flex pt-20">
          <AppSidebar
            currentSection={currentSection}
            onSectionChange={setCurrentSection}
            playlist={playlist}
            recentlyPlayed={recentlyPlayed}
          />

          <main className="flex-1 flex flex-col bg-gradient-to-b from-gray-900 to-black overflow-x-hidden">
            <MainContent
              currentSection={currentSection}
              onSectionChange={setCurrentSection}
              greeting={getGreeting()}
              query={query}
              setQuery={setQuery}
              onSearch={search}
              searchResults={searchResults}
              playlist={playlist}
              recentlyPlayed={recentlyPlayed}
              onPlaySong={playSong}
              onPlayAll={handlePlayAll}
              onAddToPlaylist={addToPlaylist}
              onRemoveFromPlaylist={removeFromPlaylist}
              user={user}
              onLogout={() => {
                localStorage.removeItem('username');
                onLogout();
              }}
            />
          </main>
        </div>

        {nowPlaying && audioUrl && (
          <PlayerControls
            nowPlaying={nowPlaying}
            audioUrl={audioUrl}
            onSongEnd={handleNextInQueue} // ✅ queue support
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}

          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default MelodifyApp;
