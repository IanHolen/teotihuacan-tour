'use client';

import { useEffect, useRef } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface AudioPlayerProps {
  audioUrl: string | null;
  title: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function AudioPlayer({ audioUrl, title }: AudioPlayerProps) {
  const { isPlaying, currentTime, duration, isLoading, hasError, play, seek, toggle } =
    useAudioPlayer();
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (audioUrl && audioUrl !== prevUrlRef.current) {
      prevUrlRef.current = audioUrl;
      play(audioUrl);
    }
  }, [audioUrl, play]);

  if (!audioUrl) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-white border-t border-[#E8E2D9] shadow-lg px-4 flex items-center gap-3">
      <button
        onClick={toggle}
        disabled={isLoading}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-[#C4956A] flex items-center justify-center transition-colors hover:bg-[#B07D52] disabled:opacity-50"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeLinecap="round" />
          </svg>
        ) : isPlaying ? (
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm text-[#2D2D2D] truncate font-medium">
          {title}{hasError && <span className="text-red-500 ml-2 text-xs">Audio no disponible</span>}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9B9B9B] w-10 text-right flex-shrink-0">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1 h-1 appearance-none bg-[#E8E2D9] rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C4956A]"
          />
          <span className="text-xs text-[#9B9B9B] w-10 flex-shrink-0">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
