import React from 'react';
import SongCard from './SongCard';

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

interface SearchSectionProps {
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
  searchResults: Song[];
  onPlaySong: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  query,
  searchResults,
  onPlaySong,
  onAddToPlaylist,
}) => {
  return (
    <div className="p-6 space-y-8 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">Search</h1>

      {searchResults.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Search Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {searchResults.map((song) => (
              <SongCard
                key={song.id?.videoId || song.videoId}
                song={song}
                onPlay={() => onPlaySong(song)}
                onAdd={() => onAddToPlaylist(song)}
                showAddButton={true}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-400">Use the top search bar to find music 🎵</p>
      )}
    </div>
  );
};

export default SearchSection;
