import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlayerStats, 
  QueenStatus, 
  PracticeState 
} from '../types/carrom';
import { 
  RotateCcw, 
  RotateCw, 
  Undo2, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Sliders, 
  Target, 
  Zap, 
  ShieldAlert, 
  Crown, 
  LogOut, 
  Trophy,
  Smile
} from 'lucide-react';
import { soundManager } from '../audio/soundEffects';
import { triggerSubtleTickHaptic } from '../utils/haptics';

interface PracticeTopHUDProps {
  player: PlayerStats;
  queenStatus: QueenStatus;
  practiceState: PracticeState;
  foulMessage: string | null;
  onLeaveGame: () => void;
}

export const PracticeTopHUD: React.FC<PracticeTopHUDProps> = ({
  player,
  queenStatus,
  practiceState,
  foulMessage,
  onLeaveGame,
}) => {
  const totalPocketed = player.redPocketed + player.whitePocketed + player.blackPocketed;

  return (
    <div className="w-full max-w-2xl mx-auto px-2 pt-1 pb-0.5 flex flex-col gap-1 shrink-0 z-20 select-none">
      {/* Top Header Bar with LEAVE GAME in top-left */}
      <div className="flex items-center justify-between px-0.5">
        <button
          type="button"
          onClick={() => {
            soundManager.playTick();
            triggerSubtleTickHaptic();
            onLeaveGame();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-['Orbitron'] font-bold tracking-wider shadow-md active:scale-95 transition cursor-pointer"
          title="Leave Game"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-400" />
          <span>LEAVE GAME</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg bg-slate-950/70 border border-slate-800 text-cyan-300">
            PRACTICE ARENA
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1.5 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-500/20 shadow-lg">
        {/* Score Card */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono text-slate-400">PRACTICE SCORE</span>
            <span className="text-xl sm:text-2xl font-black font-['Orbitron'] text-cyan-300 leading-none">
              {player.score}
            </span>
          </div>

          <div className="border-l border-slate-800 pl-2 ml-1 flex flex-col">
            <span className="text-[8px] uppercase font-mono text-amber-400 flex items-center gap-0.5">
              <Trophy className="w-2.5 h-2.5" /> BEST
            </span>
            <span className="text-xs font-bold font-mono text-amber-300 leading-tight">
              {Math.max(practiceState.bestScore, player.score)}
            </span>
          </div>
        </div>

        {/* Center: Untimed Badge */}
        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
          <span className="text-xs font-bold">∞</span>
          <span className="hidden xs:inline">No Timer</span>
        </div>

        {/* Pocket Breakdown & Shots */}
        <div className="flex items-center gap-2.5 text-right">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-mono text-slate-400">
              POCKETED ({totalPocketed}/19)
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-mono mt-0.5">
              <span className="text-amber-300">♛{player.redPocketed}</span>
              <span className="text-slate-200">⚪{player.whitePocketed}</span>
              <span className="text-slate-400">⚫{player.blackPocketed}</span>
            </div>
          </div>
          <div className="border-l border-slate-800 pl-2 flex flex-col items-end">
            <span className="text-[9px] uppercase font-mono text-slate-400">SHOTS</span>
            <span className="text-xs font-bold font-mono text-white leading-tight">
              {practiceState.shotsTaken}
            </span>
          </div>
        </div>
      </div>

      {/* Queen Cover Alert */}
      <AnimatePresence>
        {queenStatus.needsCover && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="py-1 px-3 rounded-xl bg-rose-950/90 border border-amber-400/60 flex items-center justify-between text-[11px] text-amber-200 shadow-md"
          >
            <span className="font-bold font-['Orbitron'] flex items-center gap-1.5 truncate">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
              ♛ QUEEN POCKETED! Pocket any coin to cover (+50 pts)!
            </span>
            <span className="text-[9px] uppercase font-mono px-1.5 rounded bg-rose-500/30 text-rose-300 shrink-0">
              Cover Next
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {foulMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-1 px-3 rounded-xl bg-rose-950/90 border border-rose-500 flex items-center gap-1.5 text-[11px] text-rose-200 shadow-md"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="font-medium truncate">{foulMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface PracticeBottomControlsProps {
  practiceState: PracticeState;
  onUpdatePracticeState: (updater: (prev: PracticeState) => PracticeState) => void;
  strikerX: number;
  onStrikerXChange: (x: number) => void;
  power: number;
  onPowerChange: (p: number) => void;
  onShoot: () => void;
  canShoot: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onRestartPractice: () => void;
  onResetCoins: () => void;
  onExitPractice: () => void;
  onOpenTips: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerEmojiReaction?: (emoji: string) => void;
}

export const PracticeBottomControls: React.FC<PracticeBottomControlsProps> = ({
  practiceState,
  onUpdatePracticeState,
  strikerX,
  onStrikerXChange,
  power,
  onPowerChange,
  onShoot,
  canShoot,
  canUndo,
  onUndo,
  onRestartPractice,
  onResetCoins,
  onExitPractice,
  onOpenTips,
  isMuted,
  onToggleMute,
  onTriggerEmojiReaction,
}) => {
  const [showAidsMenu, setShowAidsMenu] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);

  const quickEmojis = ['👍', '🔥', '🎯', '😂', '👏', '😱'];

  const handleSendEmoji = (emoji: string) => {
    onTriggerEmojiReaction?.(emoji);
    setShowChatMenu(false);
    soundManager.playTick();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 pb-1.5 pt-0.5 flex flex-col gap-1.5 shrink-0 z-20 select-none">
      <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-500/20 flex flex-col gap-1.5 shadow-xl">
        {/* Row 1: Striker Baseline Slider */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 shrink-0">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xs:inline">Striker:</span>
          </div>
          <input
            type="range"
            min={200}
            max={600}
            step={2}
            value={strikerX}
            disabled={!canShoot}
            onChange={(e) => {
              onStrikerXChange(Number(e.target.value));
              soundManager.playTick();
              triggerSubtleTickHaptic();
            }}
            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
          />
          <span className="text-[10px] font-mono text-cyan-300 w-8 text-right shrink-0">
            {Math.round(((strikerX - 200) / 400) * 100)}%
          </span>
        </div>

        {/* Row 2: Striker Power Control Gauge + Functional Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Power Gauge */}
          <div className="flex-1 flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-xl border border-slate-800">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <input
              type="range"
              min={0.15}
              max={1.0}
              step={0.02}
              value={power}
              disabled={!canShoot}
              onChange={(e) => {
                onPowerChange(Number(e.target.value));
                triggerSubtleTickHaptic();
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 disabled:opacity-40"
            />
            <span className="text-[10px] font-mono text-amber-300 shrink-0">
              {Math.round(power * 100)}%
            </span>
          </div>

          {/* Re-rack Coins */}
          <button
            onClick={onResetCoins}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700"
            title="Re-rack Coins to Center"
          >
            <RotateCw className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Undo Last Shot */}
          <button
            onClick={onUndo}
            disabled={!canUndo || !canShoot}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo Last Shot"
          >
            <Undo2 className="w-4 h-4 text-purple-400" />
          </button>

          {/* Training Aids Toggle Button */}
          <div className="relative">
            <button
              onClick={() => setShowAidsMenu(!showAidsMenu)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700"
              title="Training Aids"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
            </button>

            {/* Aids Dropdown */}
            <AnimatePresence>
              {showAidsMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  className="absolute bottom-11 right-0 w-56 p-2.5 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl z-50 text-xs space-y-2"
                >
                  <div className="font-bold text-white font-['Orbitron'] text-[10px] pb-1 border-b border-slate-800 flex items-center justify-between">
                    <span>TRAINING AIDS</span>
                    <span className="text-amber-400 text-[9px]">TOGGLES</span>
                  </div>

                  <label className="flex items-center justify-between cursor-pointer py-0.5">
                    <span className="text-slate-300">Aim Guideline</span>
                    <input
                      type="checkbox"
                      checked={practiceState.showGuideLine}
                      onChange={(e) =>
                        onUpdatePracticeState((p) => ({ ...p, showGuideLine: e.target.checked }))
                      }
                      className="accent-cyan-400 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-0.5">
                    <span className="text-slate-300">Collision Preview</span>
                    <input
                      type="checkbox"
                      checked={practiceState.showCollisionPreview}
                      onChange={(e) =>
                        onUpdatePracticeState((p) => ({ ...p, showCollisionPreview: e.target.checked }))
                      }
                      className="accent-cyan-400 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer py-0.5 border-t border-slate-800 pt-1.5">
                    <span className="text-slate-300">Strict Rules</span>
                    <input
                      type="checkbox"
                      checked={practiceState.strictRules}
                      onChange={(e) =>
                        onUpdatePracticeState((p) => ({ ...p, strictRules: e.target.checked }))
                      }
                      className="accent-amber-400 rounded cursor-pointer"
                    />
                  </label>

                  <button
                    onClick={() => {
                      setShowAidsMenu(false);
                      onOpenTips();
                    }}
                    className="w-full py-1 text-center bg-slate-800 rounded-lg text-[10px] text-amber-300 hover:bg-slate-700 mt-1"
                  >
                    💡 Open Master Tips
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Chat / Reaction Popover */}
          <div className="relative">
            <button
              onClick={() => setShowChatMenu(!showChatMenu)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700"
              title="Chat / Emoji"
            >
              <Smile className="w-4 h-4 text-emerald-400" />
            </button>

            <AnimatePresence>
              {showChatMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  className="absolute bottom-11 right-0 p-2 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl z-50 flex items-center gap-1"
                >
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleSendEmoji(emoji)}
                      className="text-lg p-1.5 rounded-lg hover:bg-slate-800 active:scale-90 transition cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Exit Button */}
          <button
            onClick={onExitPractice}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-rose-950/70 hover:border-rose-500 text-slate-300 hover:text-rose-300 transition active:scale-95 border border-slate-700"
            title="Exit Practice"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
          </button>

          {/* STRIKE Button */}
          <button
            onClick={onShoot}
            disabled={!canShoot}
            className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black font-['Orbitron'] text-xs hover:brightness-110 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>STRIKE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
