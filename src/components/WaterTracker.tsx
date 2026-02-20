import React, { useState, useEffect } from "react";
import { GlassWater, Check, Trophy } from "lucide-react";

interface WaterTrackerProps {
  initialGlasses?: number;
  onUpdate: (count: number) => void;
}

const TOTAL_GLASSES = 10;
const GLASS_VOLUME_ML = 250;
const GOAL_VOLUME_ML = 2500;

const WaterTracker: React.FC<WaterTrackerProps> = ({
  initialGlasses = 0,
  onUpdate,
}) => {
  const [glasses, setGlasses] = useState(initialGlasses);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setGlasses(initialGlasses);
  }, [initialGlasses]);

  const handleGlassClick = (index: number) => {
    let newCount = index + 1;
    if (index === glasses - 1) {
      newCount = index;
    }

    setGlasses(newCount);
    onUpdate(newCount);

    if (navigator.vibrate) navigator.vibrate(50);

    if (newCount === TOTAL_GLASSES && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const currentVolume = glasses * GLASS_VOLUME_ML;
  const progress = (currentVolume / GOAL_VOLUME_ML) * 100;

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 relative overflow-hidden shadow-lg transition-all duration-300">
      <div 
        className="flex justify-between items-end mb-4 relative z-10 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
            Hidratación
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white leading-none">
              {(currentVolume / 1000).toFixed(2)}
            </span>
            <span className="text-sm font-bold text-zinc-500">/ 2.5L</span>
          </div>
          {!isExpanded && (
            <p className="text-xs text-blue-400 mt-2">
              Faltan {TOTAL_GLASSES - glasses} vasos para la meta diaria. Toca para expandir.
            </p>
          )}
        </div>
        <div className="text-right flex flex-col items-end gap-2">
           <span
             className={`text-xl font-black ${progress >= 100 ? "text-cyan-400" : "text-blue-500"}`}
           >
             {Math.round(progress)}%
           </span>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-5 gap-y-4 gap-x-2 sm:gap-4 relative z-10 mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
          {Array.from({ length: TOTAL_GLASSES }).map((_, i) => {
            const isFilled = i < glasses;
            return (
              <button
                key={i}
                onClick={() => handleGlassClick(i)}
                className={`
                  group relative w-full aspect-[3/4] rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90 touch-manipulation
                  ${
                    isFilled
                      ? "bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-500/30"
                      : "bg-zinc-800/50 border border-white/5 hover:bg-zinc-800"
                  }
                `}
                aria-label={`Vaso ${i + 1}`}
              >
                {/* Liquid Animation */}
                {isFilled && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-xl overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-full bg-blue-500 h-full opacity-40 animate-pulse" />
                  </div>
                )}

                <GlassWater
                  size={24}
                  strokeWidth={2.5}
                  className={`relative z-10 transition-colors duration-300 ${isFilled ? "text-cyan-300" : "text-zinc-600 group-hover:text-zinc-500"}`}
                />

                {isFilled && i === glasses - 1 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_5px_cyan] animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="text-center animate-in zoom-in spin-in-3 duration-500">
            <Trophy
              size={48}
              className="text-yellow-400 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
            />
            <h4 className="text-white font-black text-xl tracking-tight">
              ¡META LOGRADA!
            </h4>
            <p className="text-zinc-300 text-xs font-bold uppercase mt-1">
              Hidratación al 100%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterTracker;
