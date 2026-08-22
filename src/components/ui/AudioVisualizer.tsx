'use client';

import React from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  volume?: number;
}

export function AudioVisualizer({ isRecording, volume = 0 }: AudioVisualizerProps) {
  if (!isRecording) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 py-2">
      {[...Array(9)].map((_, i) => {
        // Vary heights based on audio volume or animate
        const dynamicScale = Math.max(0.2, (volume / 100) * (1 + (i % 3) * 0.4));
        return (
          <span
            key={i}
            className="w-1.5 bg-emerald-500 rounded-full transition-all duration-75"
            style={{
              height: isRecording ? `${Math.min(36, Math.max(8, dynamicScale * 40))}px` : '6px',
              animation: isRecording ? `soundBar ${0.6 + (i % 5) * 0.2}s ease-in-out infinite` : 'none',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        );
      })}
    </div>
  );
}
