import React, { useState, useEffect } from "react";
import { Trophy } from "lucide-react";

interface WaterTrackerProps {
  initialGlasses?: number;
  goal?: number;          // meta diaria de vasos (default 8)
  onUpdate: (count: number) => void;
}

const GLASS_VOLUME_ML = 250;

const WaterTracker: React.FC<WaterTrackerProps> = ({
  initialGlasses = 0,
  goal = 8,
  onUpdate,
}) => {
  const [glasses, setGlasses] = useState(initialGlasses);
  const [showCelebration, setShowCelebration] = useState(false);

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

    if (newCount === goal && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const currentVolume = glasses * GLASS_VOLUME_ML;
  const goalVolume = goal * GLASS_VOLUME_ML;
  const progress = Math.min(100, (currentVolume / goalVolume) * 100);

  return (
    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-5 relative overflow-hidden shadow-lg transition-all duration-300">
      <div className="flex justify-between items-end mb-4 relative z-10">
        <div>
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">
            Hidratación
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white leading-none">
              {(currentVolume / 1000).toFixed(2)}
            </span>
            <span className="text-xs font-bold text-zinc-500">/ {(goalVolume / 1000).toFixed(2)}L</span>
          </div>
        </div>
        <div className="text-right">
           <span className={`text-lg font-black ${progress >= 100 ? "text-cyan-400 animate-pulse" : "text-blue-500"}`}>
             {Math.round(progress)}%
           </span>
        </div>
      </div>

      <div className="flex gap-2 relative z-10 w-full justify-between items-center">
        {Array.from({ length: goal }).map((_, i) => {
          const isFilled = i < glasses;
          return (
            <button
              key={i}
              onClick={() => handleGlassClick(i)}
              className={`
                group relative flex-1 aspect-[6/10] rounded-b-[8px] rounded-t-[2px] border-[1.5px] transition-all duration-300 active:scale-90 touch-manipulation overflow-hidden bg-white/5 backdrop-blur-sm
                ${
                  isFilled
                    ? "border-blue-500/50 shadow-[0_5px_15px_rgba(59,130,246,0.25)]"
                    : "border-white/10 hover:border-white/20 shadow-inner"
                }
              `}
              aria-label={`Vaso ${i + 1}`}
            >
              {/* Liquid */}
              <div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-[600ms] transform origin-bottom z-0 ease-[cubic-bezier(0.34,1.56,0.64,1)]`}
                style={{ 
                  height: '95%',
                  transform: isFilled ? 'scaleY(1)' : 'scaleY(0)',
                  opacity: isFilled ? 1 : 0
                }}
              />
              {isFilled && (
                <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/40 rounded-full animate-pulse" />
              )}
              {isFilled && (
                <div className="absolute bottom-3 left-1 w-0.5 h-0.5 bg-white/60 rounded-full animate-bounce" />
              )}
              {/* Glass Reflection */}
              <div className="absolute top-[5%] left-[15%] w-[10%] h-[90%] bg-gradient-to-b from-white/30 to-transparent rounded-full blur-[1px] pointer-events-none z-10" />
              <div className="absolute top-[10%] right-[10%] w-[5%] h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-full blur-[1px] pointer-events-none z-10" />
            </button>
          );
        })}
      </div>

      {showCelebration && (
        <div className="absolute inset-0 bg-cyan-900/90 z-20 flex flex-col items-center justify-center animate-in fade-in rounded-3xl backdrop-blur-sm">
          <Trophy className="text-white w-10 h-10 mb-2 animate-bounce" />
          <span className="text-white font-black tracking-widest uppercase text-sm">
            ¡Meta Lograda!
          </span>
        </div>
      )}
    </div>
  );
};

export default WaterTracker;
