import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerStats, GameMode, QueenStatus, AIDifficulty, ControlMode } from '../types/carrom';
import { 
  Clock, 
  RotateCcw, 
  Menu, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShieldAlert, 
  Bot, 
  User, 
  Zap, 
  Target, 
  Smile, 
  Sliders, 
  HandMetal,
  LogOut
} from 'lucide-react';
import { soundManager } from '../audio/soundEffects';
import { triggerSubtleTickHaptic } from '../utils/haptics';

interface GameTopHUDProps {
  mode: GameMode;
  difficulty?: AIDifficulty;
  player1: PlayerStats;
  player2: PlayerStats;
  activePlayerId: string;
  turnTimeLeft: number;
  queenStatus: QueenStatus;
  foulMessage: string | null;
  onMenu: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onLeaveGame: () => void;
}

export const GameTopHUD: React.FC<GameTopHUDProps> = ({
  mode,
  difficulty,
  player1,
  player2,
  activePlayerId,
  turnTimeLeft,
  queenStatus,
  foulMessage,
  onMenu,
  onRestart,
  isMuted,
  onToggleMute,
  onLeaveGame,
}) => {
  const isP1Turn = activePlayerId === 'player1';

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
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300">
            {mode === 'computer' ? `BOT MATCH (${difficulty?.toUpperCase()})` : '2 PLAYERS'}
          </span>
        </div>
      </div>

      {/* Top Players Duel Bar */}
      <div className="flex items-center justify-between gap-1.5 p-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-amber-500/20 shadow-lg">
        {/* Player 1 Card (Left) */}
        <div
          className={`relative flex-1 flex items-center gap-2 p-1.5 rounded-xl transition-all duration-300 ${
            isP1Turn
              ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/80'
              : 'bg-slate-950/50 opacity-75'
          }`}
        >
          {/* Avatar */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shrink-0 shadow-md">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-cyan-300">
              <User className="w-5 h-5" />
            </div>
            {isP1Turn && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold font-['Orbitron'] text-white truncate">{player1.name}</span>
              {isP1Turn && (
                <span className="text-[8px] px-1 rounded bg-cyan-400/20 text-cyan-300 font-mono uppercase shrink-0">
                  TURN
                </span>
              )}
            </div>

            {/* Miniclip-style Assigned Coin Badge & Remaining count */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1 ${
                  player1.assignedColor === 'white'
                    ? 'bg-slate-100 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {player1.assignedColor === 'white' ? '⚪' : '⚫'}
                <span>{player1.assignedColor?.toUpperCase()}</span>
                <span className="opacity-80">({player1.coinsRemaining})</span>
              </span>
              <span className="text-[9px] text-amber-300 font-mono">♛{player1.redPocketed}</span>
            </div>
          </div>

          <div className="text-right shrink-0 pr-1">
            <span className="text-xl font-black font-['Orbitron'] text-cyan-300 leading-none">
              {player1.score}
            </span>
          </div>
        </div>

        {/* Center: 30-Second Turn Countdown Dial */}
        <div className="flex flex-col items-center justify-center px-1.5 py-0.5 shrink-0">
          <div
            className={`relative w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${
              turnTimeLeft <= 5
                ? 'border-rose-500 bg-rose-950/80 shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                : 'border-amber-400 bg-slate-950/90 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
            }`}
          >
            <span
              className={`font-mono text-base font-black ${
                turnTimeLeft <= 5 ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {turnTimeLeft}
            </span>
            <span className="absolute -bottom-1 text-[7px] font-mono uppercase tracking-tighter text-slate-400">
              SEC
            </span>
          </div>
        </div>

        {/* Player 2 / AI Card (Right) */}
        <div
          className={`flex-1 flex items-center justify-between gap-2 p-1.5 rounded-xl transition-all duration-300 ${
            !isP1Turn
              ? 'bg-gradient-to-l from-amber-950/80 to-slate-900 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/80'
              : 'bg-slate-950/50 opacity-75'
          }`}
        >
          <div className="text-left shrink-0 pl-1">
            <span className="text-xl font-black font-['Orbitron'] text-amber-300 leading-none">
              {player2.score}
            </span>
          </div>

          <div className="min-w-0 flex-1 text-right">
            <div className="flex items-center justify-end gap-1">
              {!isP1Turn && (
                <span className="text-[8px] px-1 rounded bg-amber-400/20 text-amber-300 font-mono uppercase shrink-0">
                  TURN
                </span>
              )}
              <span className="text-xs font-bold font-['Orbitron'] text-white truncate">
                {mode === 'computer' ? 'Robot Bot' : player2.name}
              </span>
            </div>

            {/* Miniclip-style Assigned Coin Badge & Remaining count */}
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-[9px] text-amber-300 font-mono">♛{player2.redPocketed}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1 ${
                  player2.assignedColor === 'white'
                    ? 'bg-slate-100 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {player2.assignedColor === 'white' ? '⚪' : '⚫'}
                <span>{player2.assignedColor?.toUpperCase()}</span>
                <span className="opacity-80">({player2.coinsRemaining})</span>
              </span>
            </div>
          </div>

          {/* Avatar */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shrink-0 shadow-md">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-300">
              {mode === 'computer' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            {!isP1Turn && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            )}
          </div>
        </div>
      </div>

      {/* Floating Status Badges (Queen cover / Foul Alert) */}
      <AnimatePresence>
        {queenStatus.needsCover && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="py-1 px-3 rounded-xl bg-rose-950/90 border border-amber-400/60 flex items-center justify-between text-[11px] text-amber-200 shadow-md"
          >
            <span className="font-bold font-['Orbitron'] flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin" />
              ♛ QUEEN POCKETED! Pocket your assigned coin to cover (+50 pts)!
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
            <span className="font-semibold truncate uppercase">{foulMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface GameBottomControlsProps {
  mode: GameMode;
  strikerX: number;
  onStrikerXChange: (x: number) => void;
  power: number;
  onPowerChange: (p: number) => void;
  onShoot: () => void;
  canShoot: boolean;
  onRestart: () => void;
  onMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  controlMode?: ControlMode;
  onToggleControlMode?: () => void;
  onTriggerEmojiReaction?: (emoji: string) => void;
}

export const GameBottomControls: React.FC<GameBottomControlsProps> = ({
  mode,
  strikerX,
  onStrikerXChange,
  power,
  onPowerChange,
  onShoot,
  canShoot,
  onRestart,
  onMenu,
  isMuted,
  onToggleMute,
  controlMode = 'hand',
  onToggleControlMode,
  onTriggerEmojiReaction,
}) => {
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
        {/* Row 1: Striker Baseline Placement Slider */}
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

        {/* Row 2: Striker Power Control Gauge + Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Power Gauge */}
          <div className="flex-1 flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800">
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

          {/* Hand-Control Mode Toggle Button */}
          {onToggleControlMode && (
            <button
              onClick={onToggleControlMode}
              className={`p-2 rounded-xl transition active:scale-95 border ${
                controlMode === 'hand'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={controlMode === 'hand' ? 'Hand-Control Mode (Miniclip Pull-Back Active)' : 'Precision Slider Mode Active'}
            >
              <HandMetal className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* Quick Chat / Reaction Button */}
          <div className="relative">
            <button
              onClick={() => setShowChatMenu(!showChatMenu)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700"
              title="Chat / Emoji Reaction"
            >
              <Smile className="w-4 h-4 text-amber-400" />
            </button>

            {/* Quick Emoji Reaction Popover */}
            <AnimatePresence>
              {showChatMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  className="absolute bottom-11 right-0 p-2 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl z-50 flex items-center gap-1.5"
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

          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause / Menu Button */}
          <button
            onClick={onMenu}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition active:scale-95 border border-slate-700"
            title="Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* STRIKE Button */}
          <button
            onClick={onShoot}
            disabled={!canShoot}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black font-['Orbitron'] text-xs hover:brightness-110 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>STRIKE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
