import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameMode, AIDifficulty } from '../types/carrom';
import { 
  Play, 
  Users, 
  Bot, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Cpu, 
  Flame,
  ChevronRight,
  Maximize2,
  Minimize2,
  Check
} from 'lucide-react';
import { soundManager } from '../audio/soundEffects';

interface MainMenuProps {
  onStartGame: (mode: GameMode, difficulty?: AIDifficulty, playerColor?: 'white' | 'black') => void;
  onOpenRules: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onOpenRules }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>('medium');
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>('white');
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleModeClick = (mode: GameMode) => {
    soundManager.playTick();
    setSelectedMode(mode);
  };

  const handleLaunch = () => {
    if (!selectedMode) return;
    soundManager.playTick();
    onStartGame(
      selectedMode, 
      selectedMode === 'computer' ? selectedDifficulty : undefined,
      selectedColor
    );
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full flex flex-col justify-between p-3 sm:p-5 overflow-hidden select-none z-20">
      {/* Top Header Bar */}
      <header className="w-full max-w-3xl mx-auto flex items-center justify-between py-1 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <span className="font-['Orbitron'] font-black text-base sm:text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
              CARROM ARENA
            </span>
            <span className="hidden xs:inline-block ml-2 text-[9px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded">
              PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition active:scale-95"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-slate-300" />}
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition active:scale-95"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Hub Box (Sized to fit perfectly inside viewport without scrolling) */}
      <motion.main
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl mx-auto rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 p-4 sm:p-6 shadow-[0_0_60px_rgba(30,27,75,0.8)] flex flex-col justify-between my-auto max-h-[85dvh]"
      >
        {/* Banner Title */}
        <div className="text-center mb-3 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <Flame className="w-3.5 h-3.5" /> SELECT GAME MODE
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-['Orbitron'] text-white tracking-tight">
            CHOOSE YOUR MATCH
          </h2>
          <p className="text-slate-400 font-['Rajdhani'] text-xs sm:text-sm mt-0.5">
            Red = 50 pts • White = 20 pts • Black = 10 pts
          </p>
        </div>

        {/* Exactly Three Mode Options */}
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 mb-3">
          {/* Option 1: Practice Mode */}
          <button
            onClick={() => handleModeClick('practice')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left border transition-all duration-200 flex items-center justify-between cursor-pointer ${
              selectedMode === 'practice'
                ? 'bg-gradient-to-r from-cyan-950/80 via-slate-900 to-cyan-950/80 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-[1.01]'
                : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
                <Play className="w-5 h-5 fill-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base font-['Orbitron'] text-white">Option 1: Practice Mode</h3>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-500/20 text-cyan-300 uppercase">
                    Solo
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-['Rajdhani'] mt-0.5">
                  Play alone. Unlimited shots, no timer, no AI opponent. Perfect angles and technique.
                </p>
              </div>
            </div>
            <div className="shrink-0 ml-2">
              {selectedMode === 'practice' ? (
                <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </button>

          {/* Option 2: 2 Player Mode */}
          <button
            onClick={() => handleModeClick('2players')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left border transition-all duration-200 flex items-center justify-between cursor-pointer ${
              selectedMode === '2players'
                ? 'bg-gradient-to-r from-purple-950/80 via-slate-900 to-purple-950/80 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.01]'
                : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base font-['Orbitron'] text-white">Option 2: 2 Player Mode</h3>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-purple-500/20 text-purple-300 uppercase">
                    Pass & Play
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-['Rajdhani'] mt-0.5">
                  Two friends play offline on same device. Take turns with 30s timer, independent scores & fouls.
                </p>
              </div>
            </div>
            <div className="shrink-0 ml-2">
              {selectedMode === '2players' ? (
                <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center text-slate-950">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </button>

          {/* Option 3: Play Against AI */}
          <button
            onClick={() => handleModeClick('computer')}
            className={`p-3.5 sm:p-4 rounded-2xl text-left border transition-all duration-200 flex items-center justify-between cursor-pointer ${
              selectedMode === 'computer'
                ? 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.01]'
                : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base font-['Orbitron'] text-white">Option 3: Play Against AI</h3>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-500/20 text-amber-300 uppercase">
                    Bot Duel
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-['Rajdhani'] mt-0.5">
                  Play against smart computer opponent. User shoots first; AI takes turn only after pieces settle.
                </p>
              </div>
            </div>
            <div className="shrink-0 ml-2">
              {selectedMode === 'computer' ? (
                <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-slate-950">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-500" />
              )}
            </div>
          </button>
        </div>

        {/* AI Difficulty Settings (ONLY displayed when Play Against AI is selected!) */}
        <AnimatePresence>
          {selectedMode === 'computer' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 mb-3"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold font-['Orbitron'] text-amber-300 uppercase tracking-wider">
                  AI Difficulty Level
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Easy */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDifficulty('easy');
                    soundManager.playTick();
                  }}
                  className={`p-2 rounded-xl text-center border transition cursor-pointer ${
                    selectedDifficulty === 'easy'
                      ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-bold font-['Orbitron'] text-xs text-emerald-400">Easy</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Beginner (1-10)</span>
                </button>

                {/* Medium */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDifficulty('medium');
                    soundManager.playTick();
                  }}
                  className={`p-2 rounded-xl text-center border transition cursor-pointer ${
                    selectedDifficulty === 'medium'
                      ? 'bg-amber-950/70 border-amber-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-bold font-['Orbitron'] text-xs text-amber-400">Medium</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Skilled (11-20)</span>
                </button>

                {/* Hard */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDifficulty('hard');
                    soundManager.playTick();
                  }}
                  className={`p-2 rounded-xl text-center border transition cursor-pointer ${
                    selectedDifficulty === 'hard'
                      ? 'bg-rose-950/70 border-rose-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="block font-bold font-['Orbitron'] text-xs text-rose-400">Hard</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">PRO Master</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Automatic Coin Assignment Selector */}
        {(selectedMode === '2players' || selectedMode === 'computer') && (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 mb-2.5">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold font-['Orbitron'] text-slate-200 uppercase">
                Player 1 Assigned Coin
              </span>
              <span className="text-[10px] text-slate-400 font-['Rajdhani']">
                Player 2 / AI gets {selectedColor === 'white' ? 'Black ⚫' : 'White ⚪'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedColor('white');
                  soundManager.playTick();
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedColor === 'white'
                    ? 'bg-slate-100 text-slate-950 shadow-md ring-1 ring-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>⚪ White</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedColor('black');
                  soundManager.playTick();
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedColor === 'black'
                    ? 'bg-slate-900 border border-indigo-400 text-indigo-300 shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>⚫ Black</span>
              </button>
            </div>
          </div>
        )}

        {/* Start Game Action Button */}
        <button
          onClick={handleLaunch}
          disabled={!selectedMode}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black font-['Orbitron'] text-base sm:text-lg tracking-wider hover:brightness-110 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>{selectedMode ? 'ENTER ARENA' : 'SELECT A MODE'}</span>
        </button>
      </motion.main>

      {/* Footer Safe Space */}
      <footer className="text-center text-[10px] text-slate-500 font-mono py-1 shrink-0">
        Authentic Wooden Board • Real 2D Physics • Android Optimized
      </footer>
    </div>
  );
};
