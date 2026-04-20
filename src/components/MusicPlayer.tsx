import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'AUDIO_STREAM_01',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'CYBER_WAVE_02',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 3,
    title: 'DATA_PULSE_03',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  },
];

export function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setProgress(0);
  };

  const handleSkipPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    handleSkipNext();
  };

  return (
    <div className="col-span-12 row-span-1 z-10 flex items-center justify-between gap-4 md:gap-8 bg-black border-4 border-[#FF00FF] px-4 md:px-8 py-3 md:py-4 w-full h-full shadow-[4px_4px_0_0_#00FFFF] font-mono">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      <div className="flex items-center gap-4 w-[40%] md:w-1/4">
        <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-[#00FFFF] bg-black flex items-center justify-center shrink-0 tear">
          <Music className={`w-5 h-5 md:w-6 md:h-6 text-[#FF00FF] ${isPlaying ? 'animate-bounce' : ''}`} />
        </div>
        <div className="min-w-0 hidden sm:block">
          <p className="text-sm md:text-lg font-bold text-[#00FFFF] truncate uppercase glitch-text" data-text={currentTrack.title}>
            {currentTrack.title}
          </p>
          <p className="text-[10px] md:text-xs text-[#FF00FF] bg-black border border-[#FF00FF] px-1 inline-block uppercase mt-1">
            {isPlaying ? 'SIG: ACQUIRED' : 'SIG: LOST'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 md:gap-3">
        <div className="flex items-center justify-center gap-6 md:gap-8">
          <button
            onClick={handleSkipPrev}
            className="p-1 md:p-2 border-2 border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black focus:outline-none transition-none box-glitch"
          >
             <SkipBack className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
          </button>
          <button
            onClick={handlePlayPause}
            className="px-4 py-1 md:px-6 md:py-2 border-2 border-[#FF00FF] bg-black text-[#FF00FF] flex items-center justify-center hover:bg-[#FF00FF] hover:text-black focus:outline-none transition-none box-glitch"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 md:w-6 md:h-6 ml-1" fill="currentColor" />
            )}
          </button>
          <button
            onClick={handleSkipNext}
            className="p-1 md:p-2 border-2 border-[#00FFFF] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black focus:outline-none transition-none box-glitch"
          >
            <SkipForward className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-xl mx-auto hidden sm:flex">
          <div className="flex-1 h-2 md:h-3 bg-black border-2 border-[#00FFFF] relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-[#FF00FF] tear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="w-[40%] md:w-1/4 flex items-center justify-end gap-3">
        <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-[#FF00FF] hidden sm:block hover:animate-ping" />
        <div className="w-16 md:w-24 h-2 md:h-3 bg-black border-2 border-[#FF00FF] relative flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="absolute top-0 left-0 h-full bg-[#00FFFF]" style={{ width: `${volume * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
