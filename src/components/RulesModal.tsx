import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, Clock, ShieldAlert, Target, Sparkles } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 shadow-[0_0_50px_rgba(79,70,229,0.25)] text-white"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-['Orbitron'] text-white">Carrom Game Rules</h2>
                <p className="text-xs text-slate-400 font-['Rajdhani']">Official mechanics & scoring guide</p>
              </div>
            </div>

            {/* Coin Points Grid */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-indigo-300 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Coin Values & Scoring
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {/* Red */}
                <div className="flex flex-col items-center p-3.5 rounded-2xl bg-gradient-to-b from-rose-950/50 to-slate-900 border border-rose-500/30 text-center">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 border-2 border-amber-300 shadow-[0_0_15px_rgba(244,63,94,0.6)] mb-2 flex items-center justify-center font-bold text-xs text-slate-950">
                    ♛
                  </div>
                  <span className="text-xs font-semibold text-rose-300">Red Queen</span>
                  <span className="text-xl font-black text-amber-300 font-['Orbitron']">50 pts</span>
                  <span className="text-[10px] text-slate-400 mt-1">Requires Cover!</span>
                </div>

                {/* White */}
                <div className="flex flex-col items-center p-3.5 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-400/30 text-center">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-100 to-slate-300 border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.4)] mb-2" />
                  <span className="text-xs font-semibold text-slate-200">White Coin</span>
                  <span className="text-xl font-black text-cyan-300 font-['Orbitron']">20 pts</span>
                  <span className="text-[10px] text-slate-400 mt-1">Starlight Piece</span>
                </div>

                {/* Black */}
                <div className="flex flex-col items-center p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-black border border-indigo-950 text-center">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-950 to-slate-800 border-2 border-indigo-400/40 shadow-[0_0_8px_rgba(99,102,241,0.3)] mb-2" />
                  <span className="text-xs font-semibold text-slate-400">Black Coin</span>
                  <span className="text-xl font-black text-indigo-300 font-['Orbitron']">10 pts</span>
                  <span className="text-[10px] text-slate-400 mt-1">Dark Matter</span>
                </div>
              </div>
            </div>

            {/* Queen Rule & Turn Timer */}
            <div className="space-y-3 mb-6 text-sm">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Queen Cover Rule</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    Pocketing the Red Queen (50 points) requires a <strong>cover</strong>! You must pocket another coin in the same strike or on your very next turn. If you fail to cover, the Queen returns to the center circle.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <Clock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">30-Second Turn Timer</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    Every player has exactly <strong>30 seconds</strong> to aim and take their shot. If time runs out, your turn is forfeited and automatically passes to your opponent or the computer.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white">Fouls & Penalties</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    Pocketing the striker is a foul! A penalty of 10 points is applied (or a previously pocketed coin is returned to center), and the turn ends immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 font-bold font-['Orbitron'] text-slate-950 hover:brightness-110 active:scale-[0.98] transition shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              Ready to Play
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
