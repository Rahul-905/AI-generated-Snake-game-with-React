import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: "SYS_REQ_01.WAV",
    artist: "ROOT_ACCESS",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "bg-[#00ffff]",
    iconColor: "text-[#00ffff]",
    iconGlow: "drop-shadow-[0_0_5px_#00ffff]",
    accent: "accent-[#00ffff]"
  },
  {
    id: 2,
    title: "MEM_DUMP_02.WAV",
    artist: "GHOST_IN_RAM",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "bg-[#ff00ff]",
    iconColor: "text-[#ff00ff]",
    iconGlow: "drop-shadow-[0_0_5px_#ff00ff]",
    accent: "accent-[#ff00ff]"
  },
  {
    id: 3,
    title: "KERNEL_PANIC.WAV",
    artist: "NULL_POINTER",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "bg-white",
    iconColor: "text-white",
    iconGlow: "drop-shadow-[0_0_5px_#ffffff]",
    accent: "accent-white"
  }
];

interface MusicPlayerProps {
  onPlayStateChange: (isPlaying: boolean) => void;
}

export default function MusicPlayer({ onPlayStateChange }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
    onPlayStateChange(isPlaying);
  }, [isPlaying, currentTrackIndex, onPlayStateChange]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const skipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setProgress(0);
    setIsPlaying(true);
  };

  const skipBackward = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    skipForward();
  };

  return (
    <div className="w-full max-w-md bg-black border-4 border-[#ff00ff] p-6 shadow-[8px_8px_0px_#00ffff] relative overflow-hidden group font-mono">
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Album Art Placeholder */}
        <div className={`w-24 h-24 mb-6 flex items-center justify-center border-2 border-dashed ${isPlaying ? 'border-[#00ffff] animate-[spin_4s_linear_infinite]' : 'border-gray-600'}`}>
          <div className="w-12 h-12 bg-black border border-gray-600 flex items-center justify-center">
            <Music size={20} className={`${currentTrack.iconColor} ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-6 w-full border-b border-gray-800 pb-4">
          <h3 className={`text-lg md:text-xl font-bold ${currentTrack.iconColor} tracking-widest mb-2 uppercase`}>
            {currentTrack.title}
          </h3>
          <p className="text-xs text-gray-500 tracking-widest uppercase">
            USR: {currentTrack.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-900 border border-gray-700 mb-6 overflow-hidden">
          <div 
            className={`h-full ${currentTrack.color} transition-all duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button 
            onClick={skipBackward}
            className={`p-2 ${currentTrack.iconColor} border border-transparent hover:border-current transition-all duration-75`}
          >
            <SkipBack size={24} />
          </button>
          
          <button 
            onClick={togglePlay}
            className={`p-4 bg-black border-2 ${currentTrack.iconColor} shadow-[4px_4px_0px_currentColor] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_currentColor] transition-all duration-75`}
          >
            {isPlaying ? (
              <Pause size={28} className="fill-current" />
            ) : (
              <Play size={28} className="fill-current ml-1" />
            )}
          </button>
          
          <button 
            onClick={skipForward}
            className={`p-2 ${currentTrack.iconColor} border border-transparent hover:border-current transition-all duration-75`}
          >
            <SkipForward size={24} />
          </button>
        </div>

        {/* Volume Control */}
        <div className={`flex items-center gap-3 w-full max-w-[200px] ${currentTrack.iconColor} transition-colors duration-75`}>
          <Volume2 size={16} />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            defaultValue="1"
            onChange={(e) => {
              if (audioRef.current) {
                audioRef.current.volume = parseFloat(e.target.value);
              }
            }}
            className={`w-full h-1 bg-gray-900 border border-gray-700 appearance-none cursor-pointer ${currentTrack.accent}`}
          />
        </div>
      </div>
    </div>
  );
}
