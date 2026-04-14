import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import HomeSection from './HomeSection';
import SearchSection from './SearchSection';
import RecentSection from './RecentSection';
import PlaylistSection from './PlaylistSection';

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

interface User {
  username: string;
}

interface MainContentProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  greeting: string;
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
  searchResults: Song[];
  playlist: Song[];
  recentlyPlayed: Song[];
  onPlaySong: (song: Song) => void;
  onPlayAll: (songs: Song[]) => void; // ✅ Added
  onAddToPlaylist: (song: Song) => void;
  onRemoveFromPlaylist: (videoId: string) => void;
  user: User;
  onLogout: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  currentSection,
  onSectionChange,
  greeting,
  query,
  setQuery,
  onSearch,
  searchResults,
  playlist,
  recentlyPlayed,
  onPlaySong,
  onPlayAll,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  user,
  onLogout,
}) => {
  const { open, toggleSidebar } = useSidebar();

  const renderSection = () => {
    switch (currentSection) {
      case 'search':
        return (
          <SearchSection
            query={query}
            setQuery={setQuery}
            onSearch={onSearch}
            searchResults={searchResults}
            onPlaySong={onPlaySong}
            onAddToPlaylist={onAddToPlaylist}
          />
        );
      case 'recent':
        return (
          <RecentSection
            recentlyPlayed={recentlyPlayed}
            onPlaySong={onPlaySong}
          />
        );
      case 'playlist':
        return (
          <PlaylistSection
            playlist={playlist}
            onPlaySong={onPlaySong}
            onPlayAll={onPlayAll} // ✅ Passed here
            onRemoveFromPlaylist={onRemoveFromPlaylist}
          />
        );
      default:
        return (
          <HomeSection
            greeting={greeting}
            user={user}
            query={query}
            setQuery={setQuery}
            onSearch={onSearch}
            onSectionChange={onSectionChange}
            playlist={playlist}
            recentlyPlayed={recentlyPlayed}
            onPlaySong={onPlaySong}
          />
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-24 bg-gradient-to-b from-gray-900 to-black min-h-screen">
      <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-900 to-black">
        {renderSection()}
      </div>
    </div>
  );
};

export default MainContent;
