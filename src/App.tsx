/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative font-sans flex flex-col">
      {/* Glitch Art Overlays */}
      <div className="static-noise"></div>
      <div className="scanlines"></div>
      
      {/* Raw Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffff10_1px,transparent_1px),linear-gradient(to_bottom,#ff00ff10_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      
      {/* Header */}
      <header className="relative z-10 w-full p-6 flex justify-between items-center border-b-4 border-cyan-500 bg-black">
        <div className="glitch-wrapper">
          <h1 
            className="text-2xl md:text-4xl font-mono tracking-tighter text-white glitch-text"
            data-text="SYS.EXEC(SNAKE)"
          >
            SYS.EXEC(SNAKE)
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-black px-4 py-2 border-2 border-[#ff00ff] shadow-[4px_4px_0px_#ff00ff]">
          <span className="text-[#00ffff] font-mono text-xs md:text-sm uppercase tracking-widest">MEM_ADDR:</span>
          <span className="text-xl md:text-2xl font-mono text-[#ff00ff]">
            0x{score.toString(16).padStart(4, '0').toUpperCase()}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
        
        {/* Left: Music Player */}
        <div className="w-full lg:w-1/3 flex justify-center lg:justify-end">
          <MusicPlayer onPlayStateChange={setIsPlayingMusic} />
        </div>

        {/* Right: Game */}
        <div className="w-full lg:w-2/3 flex justify-center lg:justify-start">
          <SnakeGame onScoreChange={setScore} isPlayingMusic={isPlayingMusic} />
        </div>

      </main>
    </div>
  );
}
