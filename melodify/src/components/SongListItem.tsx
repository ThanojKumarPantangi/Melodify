
import React from 'react';
import { Play, Trash2 } from 'lucide-react';

interface Song {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface SongListItemProps {
  song: Song;
  index: number;
  onPlay: () => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

const SongListItem: React.FC<SongListItemProps> = ({
  song,
  index,
  onPlay,
  onRemove,
  showRemoveButton = false,
}) => {
  return (
    <div className="group flex items-center space-x-4 p-4 rounded-lg hover:bg-white/5 transition-all duration-200">
      <div className="w-8 text-gray-400 text-sm font-medium group-hover:hidden">
        {index}
      </div>
      <button
        onClick={onPlay}
        className="w-8 h-8 hidden group-hover:flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform duration-200"
      >
        <Play className="w-4 h-4 ml-1" />
      </button>
      
      <img 
        src={song.thumbnail} 
        alt={song.title} 
        className="w-12 h-12 rounded object-cover" 
      />
      
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{song.title}</h4>
      </div>
      
      {showRemoveButton && onRemove && (
        <button
          onClick={onRemove}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SongListItem;
