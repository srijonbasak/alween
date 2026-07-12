'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface VimeoVideoProps {
  url: string;
}

export const getVimeoId = (url: string): string | null => {
  const match = url.match(/(?:videos\/|video\/|\b|^)([0-9]+)/);
  return match ? match[1] : null;
};

export const VimeoVideo: React.FC<VimeoVideoProps> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = getVimeoId(url);

  if (!videoId) {
    return (
      <div className="flex h-56 w-full items-center justify-center bg-stone-900 border border-stone-850 rounded text-xs text-stone-500">
        No active video walkthrough configured.
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-stone-950 border border-stone-850">
      {isPlaying ? (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`}
          className="absolute inset-0 h-full w-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div 
          onClick={() => setIsPlaying(true)}
          className="group absolute inset-0 flex cursor-pointer items-center justify-center bg-cover bg-center transition-all duration-500 hover:scale-[1.01]"
          style={{ 
            backgroundImage: `linear-gradient(to top, rgba(12,10,9,0.85), rgba(12,10,9,0.3)), url('https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=1200')` 
          }}
        >
          {/* Aesthetic overlays */}
          <div className="absolute top-6 left-6 text-left">
            <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase">VISUAL ATMOSPHERE</span>
            <h4 className="font-serif text-lg font-semibold text-stone-200 mt-1">Lab Extractions & Distillation</h4>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/40 group-hover:scale-105 group-hover:bg-primary group-hover:text-background transition-all duration-300">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[10px] text-stone-400 tracking-wider">
            <span>ALWEEN LABORATORY LAB TOUR</span>
            <span>PLAY VIDEO (ZERO INITIAL PAYLOAD WEIGHT)</span>
          </div>
        </div>
      )}
    </div>
  );
};
