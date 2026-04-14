
import React from 'react';
import { Play, Plus } from 'lucide-react';

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

interface SongCardProps {
  song: Song;
  onPlay: () => void;
  onAdd?: () => void;
  showAddButton?: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ 
  song, 
  onPlay, 
  onAdd, 
  showAddButton = false 
}) => {
  const title = song.snippet?.title || song.title;
  const thumbnail = song.snippet?.thumbnails?.default?.url || song.thumbnail;

  return (
    <div className="group relative bg-gray-900/40 hover:bg-gray-800/60 p-4 rounded-lg transition-all duration-300 cursor-pointer">
      <div className="relative mb-4">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full aspect-square object-cover rounded-lg shadow-lg" 
        />
        <button
          onClick={onPlay}
          className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-lg"
        >
          <Play className="w-4 h-4 text-black ml-1" />
        </button>
      </div>
      
      <h3 className="text-white font-medium text-sm mb-2 line-clamp-2 leading-tight">
        {title}
      </h3>
      
      {showAddButton && onAdd && (
        <button 
          onClick={onAdd}
          className="w-full flex items-center justify-center space-x-2 mt-3 px-3 py-2 bg-purple-600/80 hover:bg-purple-600 text-white font-medium rounded-lg transition-all duration-200 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      )}
    </div>
  );
};

export default SongCard;
