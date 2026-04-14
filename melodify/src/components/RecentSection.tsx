import React from 'react';
import SongListItem from './SongListItem';

interface Song {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface RecentSectionProps {
  recentlyPlayed: Song[];
  onPlaySong: (song: Song) => void;
}

const RecentSection: React.FC<RecentSectionProps> = ({
  recentlyPlayed,
  onPlaySong,
}) => {
  return (
    <div className="p-6 space-y-8 min-h-screen pb-36">
      <div>
        <h1 className="text-4xl font-bold text-white mb-8">Recently Played</h1>
        
        {recentlyPlayed.length > 0 ? (
          <div className="space-y-2">
            {recentlyPlayed.map((song, index) => (
              <SongListItem
                key={`recent-${song.videoId}`}
                song={song}
                index={index + 1}
                onPlay={() => onPlaySong(song)}
                showRemoveButton={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No recently played songs</p>
            <p className="text-gray-500 text-sm mt-2">Start listening to see your recent tracks here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSection;
