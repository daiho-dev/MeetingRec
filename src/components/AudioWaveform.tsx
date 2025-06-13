import React from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording }) => {
  const bars = Array.from({ length: 40 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center h-16 gap-1">
      {bars.map((bar) => (
        <div
          key={bar}
          className={`bg-blue-400 rounded-full transition-all duration-300 ${
            isRecording 
              ? 'animate-pulse' 
              : 'opacity-30'
          }`}
          style={{
            width: '3px',
            height: isRecording 
              ? `${Math.random() * 40 + 8}px` 
              : '8px',
            animationDelay: `${bar * 50}ms`,
            animationDuration: `${800 + Math.random() * 400}ms`
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;