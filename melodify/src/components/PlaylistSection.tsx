import React from 'react';
import { Play } from 'lucide-react';
import SongListItem from './SongListItem';

interface Song {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface PlaylistSectionProps {
  playlist: Song[];
  onPlaySong: (song: Song) => void;
  onPlayAll: (songs: Song[]) => void;
  onRemoveFromPlaylist: (videoId: string) => void;
}

const PlaylistSection: React.FC<PlaylistSectionProps> = ({
  playlist,
  onPlaySong,
  onPlayAll,
  onRemoveFromPlaylist,
}) => {
  return (
    <div className="p-6 space-y-8 min-h-screen pb-36">
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Your Playlist</h1>

        {playlist.length > 0 ? (
          <>
            <button
              onClick={() => onPlayAll(playlist)}
              className="flex items-center space-x-3 mb-8 px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium rounded-full transition-all duration-300 transform hover:scale-105"
            >
              <Play className="w-5 h-5" />
              <span>Play All</span>
            </button>

            <div className="space-y-2">
              {playlist.map((song, index) => (
                <SongListItem
                  key={`playlist-${song.videoId}`}
                  song={song}
                  index={index + 1}
                  onPlay={() => onPlaySong(song)}
                  onRemove={() => onRemoveFromPlaylist(song.videoId)}
                  showRemoveButton={true}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">Your playlist is empty</p>
            <p className="text-gray-500 text-sm mt-2">Add songs to your playlist to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
};


export default PlaylistSection;
