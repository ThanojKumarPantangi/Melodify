import React from 'react';
import SongCard from './SongCard';

interface Song {
  videoId: string;
  title: string;
  thumbnail: string;
  audioUrl?: string;
}

interface User {
  username: string;
}

interface HomeSectionProps {
  greeting: string;
  user: User;
  query: string;
  setQuery: (query: string) => void;
  onSearch: () => void;
  onSectionChange: (section: string) => void;
  playlist: Song[];
  recentlyPlayed: Song[];
  onPlaySong: (song: Song) => void;
}

const HomeSection: React.FC<HomeSectionProps> = ({
  greeting,
  user,
  onSectionChange,
  playlist,
  recentlyPlayed,
  onPlaySong,
}) => {
  const quickCategories = [
    {
      title: "Popular Now",
      color: "from-yellow-500 to-orange-600",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"
    },
    {
      title: "Rock Hits",
      color: "from-red-500 to-pink-600",
      image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&h=400&fit=crop"
    },
    {
      title: "Pop Favorites",
      color: "from-purple-500 to-blue-600",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop"
    },
    {
      title: "Electronic Vibes",
      color: "from-cyan-500 to-blue-600",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop"
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">
          {greeting} <span className="text-purple-400">{user.username.charAt(0).toUpperCase() + user.username.slice(1)}</span> 👋
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickCategories.map((category, index) => (
            <div
              key={index}
              onClick={() => onSectionChange('search')}
              className={`relative h-20 rounded-lg bg-gradient-to-r ${category.color} overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200 group`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
              <div className="relative h-full flex items-center px-4">
                <span className="text-white font-semibold text-sm">
                  {category.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {recentlyPlayed.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recently Played</h2>
            <button
              onClick={() => onSectionChange('recent')}
              className="text-gray-400 hover:text-white font-medium transition-colors duration-200"
            >
              Show all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentlyPlayed.slice(0, 5).map((song) => (
              <SongCard
                key={`recent-${song.videoId}`}
                song={song}
                onPlay={() => onPlaySong(song)}
                showAddButton={false}
              />
            ))}
          </div>
        </div>
      )}

      {playlist.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Playlist</h2>
            <button
              onClick={() => onSectionChange('playlist')}
              className="text-gray-400 hover:text-white font-medium transition-colors duration-200"
            >
              Show all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {playlist.slice(0, 5).map((song) => (
              <SongCard
                key={`playlist-home-${song.videoId}`}
                song={song}
                onPlay={() => onPlaySong(song)}
                showAddButton={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSection;
