import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lightbulb, Compass, Zap, RotateCw, Crown, Crosshair } from 'lucide-react';

interface PracticeTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PracticeTipsModal: React.FC<PracticeTipsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-3xl bg-slate-900 border border-amber-500/30 p-6 shadow-[0_0_50px_rgba(245,158,11,0.2)] text-white"
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
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-['Orbitron'] text-white">Carrom Master Tips</h2>
                <p className="text-xs text-slate-400 font-['Rajdhani']">Techniques, angles & pocketing mechanics</p>
              </div>
            </div>

            {/* Tips Cards */}
            <div className="space-y-3.5 mb-6 text-sm">
              {/* Tip 1: Ghost Ball & Cut Shots */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
                <Crosshair className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white font-['Orbitron'] text-xs text-cyan-300">
                    1. The Ghost Ball Principle (Cut Shots)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    To pocket a coin, do not aim at its center. Aim your striker at an imaginary &quot;ghost ball&quot; positioned directly behind the coin, aligned with the pocket center. The collision normal will direct the coin straight into the pocket.
                  </p>
                </div>
              </div>

              {/* Tip 2: Baseline Positioning */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
                <Compass className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white font-['Orbitron'] text-xs text-amber-300">
                    2. Baseline Lateral Positioning
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Use the baseline slider to slide your striker left or right before aiming. Finding an unobstructed straight or slight angle to the pocket dramatically increases your potting percentage over difficult sharp cut shots.
                  </p>
                </div>
              </div>

              {/* Tip 3: Force & Speed Control */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
                <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white font-['Orbitron'] text-xs text-emerald-300">
                    3. Shot Power Control
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Hard shots are not always best! For coins near the corner pockets, <strong>30% - 45% power</strong> provides maximum control and prevents the striker from bouncing out or falling into the pocket (foul). Reserve <strong>70% - 90% power</strong> for breaking clusters.
                  </p>
                </div>
              </div>

              {/* Tip 4: Rebounds & Bank Shots */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
                <RotateCw className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white font-['Orbitron'] text-xs text-purple-300">
                    4. Bank Shots & Cushion Rebounds
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    When a direct line to a coin is blocked by other pieces, rebound your striker off the side cushions. Remember: the angle of reflection roughly equals the angle of incidence.
                  </p>
                </div>
              </div>

              {/* Tip 5: Queen Cover Strategy */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5">
                <Crown className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white font-['Orbitron'] text-xs text-rose-300">
                    5. Securing the 50-Point Queen
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    Before attempting to pocket the Red Queen, make sure you have an easy coin near a pocket ready as your &quot;cover.&quot; If you pocket the Queen without an easy follow-up shot, you risk losing the 50 points as the Queen returns to center.
                  </p>
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 font-bold font-['Orbitron'] text-slate-950 hover:brightness-110 active:scale-[0.98] transition shadow-lg"
            >
              Got It, Continue Practice
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
