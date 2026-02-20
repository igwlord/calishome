import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Play,
  Pause,
  ChevronRight,
  RotateCcw,
  Flame,
  Home,
  Trophy,
  Target,
  Info,
  X,
  Dumbbell,
  Footprints,
  Activity,
  HeartPulse,
  Zap,
  BarChart2,
  Calendar,
  Settings,
  Clock,
  ChevronUp,
  Layers,
  Check,
  AlertTriangle,
} from "lucide-react";
import WaterTracker from "./src/components/WaterTracker";
type WeekLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Category = "push" | "legs" | "core" | "fullbody" | "rest";
type Phase = "getReady" | "work" | "rest" | "finished";
type Tab = "home" | "workout";

interface Exercise {
  id: string;
  name: string;
  category: Category;
  met: number;
  steps: string[];
  query: string;
}

interface RoutineExercise extends Exercise {
  sets: number;
  reps: number | string;
}

interface UserData {
  streak: number;
  totalWorkouts: number;
  totalCalories: number;
  lastWorkoutDate: string | null;
  history: Array<{
    date: string;
    calories: number;
    week: WeekLevel;
    day: number;
  }>;
  currentWeek: WeekLevel;

  dailyChecklist: { date: string; exercises: string[] };
  waterIntake: number; // 0-10 glasses
  lastWaterDate: string | null;
}

interface DailyPlan {
  title: string;
  tag: string;
  exercises: RoutineExercise[];
}

// --- CONFIGURACIÓN ---
const USER_WEIGHT_KG = 67;
const GOAL_DAYS = 60;

// --- MOTIVATIONAL TIPS DATABASE ---
const MOTIVATIONAL_TIPS = [
  "¡El dolor es temporal, la gloria es eterna!",
  "Controla la bajada, explota la subida.",
  "No pares cuando duela, para cuando termines.",
  "Tu única competencia eres tú ayer.",
  "Respira profundo, oxigena tus músculos.",
  "Calidad sobre cantidad. ¡Técnica perfecta!",
  "Cada repetición te acerca a tu meta.",
  "Si fuera fácil, todo el mundo lo haría.",
  "Siente el músculo trabajar, conecta mente y cuerpo.",
  "Mantén el core apretado, protege tu espalda.",
  "¡Un segundo más! Tú puedes.",
  "La disciplina es hacer lo que odias como si lo amaras.",
  "Suda ahora, brilla después.",
  "No cuentes los días, haz que los días cuenten.",
  "El cuerpo logra lo que la mente cree.",
  "Concéntrate. Estás aquí para mejorar.",
  "¡Vamos! Esa última repetición es la que cuenta.",
  "Mantén la postura, eres un atleta.",
  "Desafía tus límites hoy.",
  "El cansancio está en tu mente.",
  "Hazlo por ti, por nadie más.",
  "Construyendo la mejor versión de ti mismo.",
  "Inhala fuerza, exhala debilidad.",
  "¡Dale duro! No vinimos a jugar.",
  "La constancia es la clave del éxito.",
  "¡Rompe tus barreras mentales!",
  "Siéntete orgulloso de estar aquí hoy.",
  "Aprieta en el punto de máxima tensión.",
  "Movimiento controlado, resultados asegurados.",
  "¡Eres más fuerte de lo que crees!",
  "Transforma el sudor en fuerza.",
  "Hoy es un buen día para superarse.",
];

// --- THEME ENGINE ---
const THEMES: Record<
  WeekLevel,
  {
    primary: string;
    dim: string;
    gradient: string;
    text: string;
    shadow: string;
    badge: string;
    border: string;
  }
> = {
  1: { primary: "bg-emerald-500", dim: "bg-emerald-900/20", gradient: "from-emerald-900", text: "text-emerald-400", shadow: "shadow-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20", border: "border-emerald-500/30" },
  2: { primary: "bg-sky-500", dim: "bg-sky-900/20", gradient: "from-sky-900", text: "text-sky-400", shadow: "shadow-sky-500/20", badge: "bg-sky-500/10 text-sky-300 border-sky-500/20", border: "border-sky-500/30" },
  3: { primary: "bg-violet-600", dim: "bg-violet-900/20", gradient: "from-violet-900", text: "text-violet-400", shadow: "shadow-violet-500/20", badge: "bg-violet-500/10 text-violet-300 border-violet-500/20", border: "border-violet-500/30" },
  4: { primary: "bg-amber-500", dim: "bg-amber-900/20", gradient: "from-amber-900", text: "text-amber-400", shadow: "shadow-amber-500/20", badge: "bg-amber-500/10 text-amber-300 border-amber-500/20", border: "border-amber-500/30" },
  5: { primary: "bg-rose-600", dim: "bg-rose-900/20", gradient: "from-rose-900", text: "text-rose-400", shadow: "shadow-rose-500/20", badge: "bg-rose-500/10 text-rose-300 border-rose-500/20", border: "border-rose-500/30" },
  6: { primary: "bg-fuchsia-600", dim: "bg-fuchsia-900/20", gradient: "from-fuchsia-900", text: "text-fuchsia-400", shadow: "shadow-fuchsia-500/20", badge: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20", border: "border-fuchsia-500/30" },
  7: { primary: "bg-orange-600", dim: "bg-orange-900/20", gradient: "from-orange-900", text: "text-orange-400", shadow: "shadow-orange-500/20", badge: "bg-orange-500/10 text-orange-300 border-orange-500/20", border: "border-orange-500/30" },
  8: { primary: "bg-red-600", dim: "bg-red-900/20", gradient: "from-red-900", text: "text-red-400", shadow: "shadow-red-500/20", badge: "bg-red-500/10 text-red-300 border-red-500/20", border: "border-red-500/30" }
};

// --- MOTOR DE AUDIO ---
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
};

const playTone = (
  freq = 440,
  type: OscillatorType = "sine",
  duration = 0.1,
  vol = 0.1,
) => {
  try {
    initAudio();
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Envelope for click-free sound
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + duration,
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio Error:", e);
  }
};

// --- BASE DE DATOS DE EJERCICIOS ---
const EXERCISE_DB: Record<string, Exercise> = {
  pushups: { id: 'pushups', name: 'Push Up (Flexiones)', category: 'push', met: 6.0, steps: ['Manos ancho hombros', 'Cuerpo recto', 'Baja a 90°', 'Sube empujando'], query: 'como hacer flexiones perfectas' },
  diamond_pushups: { id: 'diamond_pushups', name: 'Diamond Push Up', category: 'push', met: 6.5, steps: ['Manos juntas', 'Codos pegados al cuerpo', 'Baja hasta las manos'], query: 'diamond push ups technique' },
  decline_pushups: { id: 'decline_pushups', name: 'Decline Push Up', category: 'push', met: 6.5, steps: ['Pies elevados', 'Baja controlado', 'Empuja fuerte'], query: 'decline push ups form' },
  squats: { id: 'squats', name: 'Bodyweight Squat', category: 'legs', met: 5.5, steps: ['Peso en talones', 'Pecho abierto', 'Baja rompiendo paralelo'], query: 'bodyweight squat correct form' },
  lunges: { id: 'lunges', name: 'Reverse Lunge', category: 'legs', met: 6.0, steps: ['Paso largo atrás', 'Talón delantero manda', 'Torso recto'], query: 'reverse lunge technique' },
  plank: { id: 'plank', name: 'Plank', category: 'core', met: 3.3, steps: ['Glúteos fuertes', 'Respiración nasal', 'Alineación perfecta'], query: 'perfect plank form' },
  burpees: { id: 'burpees', name: 'Burpee (controlado)', category: 'fullbody', met: 9.8, steps: ['Plancha alta', 'Sin colapsar lumbar', 'Ponte de pie sin salto'], query: 'controlled burpee form' },
  rest: { id: 'rest', name: 'Descanso Activo', category: 'rest', met: 2.0, steps: ['Camina libremente', 'Respira profundo', 'Hidrátate'], query: 'active rest stretching' },
};

// --- RUTINAS INTELIGENTES ---
const getDailyPlan = (week: WeekLevel, dayNumber: number): DailyPlan => {
  // dayNumber: 1, 2, 3, 4
  const planData: Record<WeekLevel, Record<number, { title: string; tag: string; exercises: Array<{id: string, sets: number, reps: number | string}> }>> = {
    1: {
      1: { title: "Push + Core", tag: "Fuerza Base", exercises: [{id: 'pushups', sets: 3, reps: 12}, {id: 'diamond_pushups', sets: 3, reps: 8}, {id: 'plank', sets: 3, reps: '40s'}] },
      2: { title: "Legs", tag: "Tren Inferior", exercises: [{id: 'squats', sets: 4, reps: 15}, {id: 'lunges', sets: 3, reps: 12}] },
      3: { title: "Posterior + Core", tag: "Estabilidad", exercises: [{id: 'lunges', sets: 3, reps: 14}, {id: 'plank', sets: 3, reps: '45s'}] },
      4: { title: "Full Body", tag: "Metabólico", exercises: [{id: 'burpees', sets: 3, reps: 8}, {id: 'pushups', sets: 3, reps: 10}] }
    },
    2: {
      1: { title: "Push + Core", tag: "+5% Volumen", exercises: [{id: 'pushups', sets: 3, reps: 14}, {id: 'diamond_pushups', sets: 3, reps: 10}, {id: 'plank', sets: 3, reps: '45s'}] },
      2: { title: "Legs", tag: "+5% Volumen", exercises: [{id: 'squats', sets: 4, reps: 18}, {id: 'lunges', sets: 3, reps: 14}] },
      3: { title: "Posterior + Core", tag: "+5% Volumen", exercises: [{id: 'lunges', sets: 3, reps: 16}, {id: 'plank', sets: 3, reps: '50s'}] },
      4: { title: "Full Body", tag: "+5% Volumen", exercises: [{id: 'burpees', sets: 3, reps: 9}, {id: 'pushups', sets: 3, reps: 12}] }
    },
    3: {
      1: { title: "Push + Core", tag: "Progresión Técnica", exercises: [{id: 'pushups', sets: 4, reps: 12}, {id: 'diamond_pushups', sets: 3, reps: 10}, {id: 'plank', sets: 3, reps: '50s'}] },
      2: { title: "Legs", tag: "Progresión Técnica", exercises: [{id: 'squats', sets: 4, reps: 18}, {id: 'lunges', sets: 4, reps: 14}] },
      3: { title: "Posterior + Core", tag: "Progresión Técnica", exercises: [{id: 'lunges', sets: 3, reps: 16}, {id: 'plank', sets: 3, reps: '60s'}] },
      4: { title: "Full Body", tag: "Progresión Técnica", exercises: [{id: 'burpees', sets: 3, reps: 10}, {id: 'pushups', sets: 3, reps: 14}] }
    },
    4: {
      1: { title: "Push + Core", tag: "Deload", exercises: [{id: 'pushups', sets: 2, reps: 10}, {id: 'plank', sets: 2, reps: '40s'}] },
      2: { title: "Legs", tag: "Deload", exercises: [{id: 'squats', sets: 3, reps: 12}] },
      3: { title: "Posterior + Core", tag: "Deload", exercises: [{id: 'lunges', sets: 2, reps: 12}] },
      4: { title: "Full Body", tag: "Deload", exercises: [{id: 'burpees', sets: 2, reps: 6}] }
    },
    5: {
      1: { title: "Push + Core", tag: "Strength Control", exercises: [{id: 'decline_pushups', sets: 4, reps: 10}, {id: 'diamond_pushups', sets: 3, reps: 12}] },
      2: { title: "Legs", tag: "Strength Control", exercises: [{id: 'squats', sets: 4, reps: 20}, {id: 'lunges', sets: 3, reps: 16}] },
      3: { title: "Posterior + Core", tag: "Strength Control", exercises: [{id: 'plank', sets: 3, reps: '60s'}] },
      4: { title: "Full Body", tag: "Strength Control", exercises: [{id: 'burpees', sets: 3, reps: 10}] }
    },
    6: {
      1: { title: "Push + Core", tag: "Tempo + Tensión", exercises: [{id: 'pushups', sets: 4, reps: 12}, {id: 'plank', sets: 3, reps: '70s'}] },
      2: { title: "Legs", tag: "Tempo + Tensión", exercises: [{id: 'squats', sets: 4, reps: 18}] },
      3: { title: "Posterior + Core", tag: "Tempo + Tensión", exercises: [{id: 'plank', sets: 3, reps: '70s'}] },
      4: { title: "Full Body", tag: "Tempo + Tensión", exercises: [{id: 'burpees', sets: 3, reps: 10}] }
    },
    7: {
      1: { title: "Push + Core", tag: "High Volume", exercises: [{id: 'pushups', sets: 5, reps: 20}, {id: 'plank', sets: 3, reps: '75s'}] },
      2: { title: "Legs", tag: "High Volume", exercises: [{id: 'squats', sets: 4, reps: 22}, {id: 'lunges', sets: 4, reps: 18}] },
      3: { title: "Posterior + Core", tag: "High Volume", exercises: [{id: 'plank', sets: 3, reps: '75s'}] },
      4: { title: "Full Body", tag: "High Volume", exercises: [{id: 'burpees', sets: 3, reps: 12}] }
    },
    8: {
      1: { title: "Push + Core", tag: "Peak Control", exercises: [{id: 'pushups', sets: 4, reps: 18}, {id: 'diamond_pushups', sets: 3, reps: 14}] },
      2: { title: "Legs", tag: "Peak Control", exercises: [{id: 'squats', sets: 4, reps: 22}, {id: 'lunges', sets: 4, reps: 20}] },
      3: { title: "Posterior + Core", tag: "Peak Control", exercises: [{id: 'plank', sets: 3, reps: '80s'}] },
      4: { title: "Full Body", tag: "Peak Control", exercises: [{id: 'burpees', sets: 3, reps: 12}, {id: 'pushups', sets: 3, reps: 20}] }
    }
  };
  
  const weekData = planData[week];
  const dayPlan = weekData ? weekData[dayNumber] : null;
  if (!dayPlan) return { title: "Descanso Activo", tag: "Recuperación", exercises: [{...EXERCISE_DB['rest'], sets: 1, reps: 'Libre'}] };

  return {
    title: dayPlan.title,
    tag: dayPlan.tag,
    exercises: dayPlan.exercises.map(ex => ({
      ...EXERCISE_DB[ex.id],
      sets: ex.sets,
      reps: ex.reps
    }))
  };
};

// --- COMPONENTES UI ---

const BottomNav: React.FC<{ activeTab: Tab; onChange: (t: Tab) => void }> = ({
  activeTab,
  onChange,
}) => (
  <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-2xl border-t border-white/10 pb-safe-bottom z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
    <div className="flex justify-around items-center h-20 max-w-md mx-auto">
      <button
        onClick={() => onChange("home")}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-colors duration-300 group ${activeTab === "home" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === "home" ? "bg-white/10" : "bg-transparent"}`}
        >
          <Home
            size={24}
            strokeWidth={activeTab === "home" ? 2.5 : 2}
            className="transition-transform group-active:scale-90"
          />
        </div>
        <span className="text-[10px] font-bold tracking-widest">INICIO</span>
      </button>

      <button
        onClick={() => onChange("workout")}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-colors duration-300 group ${activeTab === "workout" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === "workout" ? "bg-white/10" : "bg-transparent"}`}
        >
          <Dumbbell
            size={24}
            strokeWidth={activeTab === "workout" ? 2.5 : 2}
            className="transition-transform group-active:scale-90"
          />
        </div>
        <span className="text-[10px] font-bold tracking-widest">RUTINA</span>
      </button>
    </div>
  </div>
);

const ExerciseGuideModal: React.FC<{
  exercise: Exercise;
  onClose: () => void;
  theme: (typeof THEMES)[WeekLevel];
}> = ({ exercise, onClose, theme }) => {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-t-3xl sm:rounded-3xl border-t sm:border ${theme.border} shadow-2xl flex flex-col max-h-[90dvh] animate-in slide-in-from-bottom-10 duration-300 cursor-auto bg-zinc-900 overflow-hidden relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} to-zinc-900 opacity-20 pointer-events-none`}
        />

        <div className="p-6 pb-0 flex items-start justify-between relative z-10">
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-1 rounded-md ${theme.badge} ${theme.border}`}
            >
              {exercise.category}
            </span>
            <h3 className="text-2xl font-black text-white mt-2 leading-none">
              {exercise.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 text-slate-400 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 relative z-10">
          <div className="space-y-3">
            {exercise.steps.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div
                  className={`w-6 h-6 rounded-full ${theme.dim} ${theme.text} flex items-center justify-center text-xs font-bold border ${theme.border} shrink-0 mt-0.5 font-mono`}
                >
                  {idx + 1}
                </div>
                <p className="text-zinc-300 text-sm font-medium leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <a
            href={`https://www.youtube.com/results?search_query=${exercise.query}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-red-600/90 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-red-900/20"
          >
            <Play fill="currentColor" size={16} /> VER EN YOUTUBE
          </a>
        </div>

        <div className="p-6 pt-2 pb-safe-bottom sm:pb-6 relative z-10">
          <button
            onClick={onClose}
            className={`w-full py-4 ${theme.primary} text-white font-bold rounded-xl active:scale-[0.98] transition-transform shadow-lg ${theme.shadow}`}
          >
            ENTENDIDO
          </button>
        </div>
      </div>
    </div>
  );
};

// --- WORKOUT SCREEN ---

interface WorkoutScreenProps {
  week: WeekLevel;
  day: number;
  onExit: () => void;
  onComplete: (calories: number) => void;
}

const WorkoutScreen: React.FC<WorkoutScreenProps> = ({
  week,
  day,
  onExit,
  onComplete,
}) => {
  const workoutPlan = useMemo(
    () => getDailyPlan(week, day),
    [week, day],
  );
  const theme = THEMES[week];

  const settings = { work: 45, rest: 15 };

  const [phase, setPhase] = useState<Phase>("getReady");
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(true);
  const [kcal, setKcal] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  // Initialize randomized tips for this session
  const [sessionTips] = useState(() =>
    [...MOTIVATIONAL_TIPS].sort(() => 0.5 - Math.random()),
  );

  // Haptic Feedback Helper
  const triggerHaptic = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    const requestWakeLock = async () => {
      if ("wakeLock" in navigator) {
        try {
          const sentinel = await navigator.wakeLock.request("screen");
          setWakeLock(sentinel);
        } catch (err) {
          console.warn("Wake Lock error:", err);
        }
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    // Timer only runs if isActive is true AND no modals are open (guide or exit confirm)
    const isPausedByModal = showGuide || showExitConfirm;

    if (isActive && timeLeft > 0 && !isPausedByModal && phase !== "finished") {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          const nextTime = t - 1;

          // Audio Feedback Logic
          if (phase === "work") {
            if (nextTime < 10 && nextTime > 0) {
              // Descending subtle tone: Pitch drops as time drops
              // 9s -> 850Hz, 1s -> 450Hz
              const pitch = 400 + nextTime * 50;
              playTone(pitch, "sine", 0.15, 0.05);
            }
          } else {
            // Standard countdown for Rest/GetReady
            if (nextTime <= 3 && nextTime > 0) {
              playTone(600, "square", 0.1, 0.1);
            }
          }

          return nextTime;
        });

        if (phase === "work") {
          const ex = workoutPlan.exercises[currentExIndex];
          setKcal((k) => k + (ex.met * 3.5 * USER_WEIGHT_KG) / 200 / 60);
        }
      }, 1000);
    } else if (timeLeft === 0 && !isPausedByModal && phase !== "finished") {
      handlePhaseChange();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isActive,
    timeLeft,
    phase,
    showGuide,
    showExitConfirm,
    workoutPlan.exercises,
    currentExIndex,
  ]);

  const handlePhaseChange = useCallback(() => {
    if (phase === "getReady") {
      setPhase("work");
      setTimeLeft(settings.work);
      playTone(880, "square", 0.3, 0.1); // Strong Start
      triggerHaptic(50);
    } else if (phase === "work") {
      if (currentExIndex < workoutPlan.exercises.length - 1) {
        setPhase("rest");
        setTimeLeft(settings.rest);
        playTone(1500, "triangle", 0.1, 0.1); // Short Sharp Confirmation for Rest
        triggerHaptic(50);
      } else {
        setPhase("finished");
        playTone(880, "square", 0.1, 0.1);
        setTimeout(() => playTone(1100, "square", 0.2, 0.1), 150);
        triggerHaptic([50, 50, 50]);
        onComplete(Math.ceil(kcal));
      }
    } else if (phase === "rest") {
      setPhase("work");
      setCurrentExIndex((p) => p + 1);
      setTimeLeft(settings.work);
      playTone(880, "square", 0.3, 0.1); // Back to Work
      triggerHaptic(50);
    }
  }, [
    phase,
    currentExIndex,
    workoutPlan.exercises.length,
    settings,
    kcal,
    onComplete,
  ]);

  const handleSkip = () => {
    triggerHaptic(15); // Click feel
    setTimeLeft(0);
  };

  const handlePrev = () => {
    triggerHaptic(15); // Click feel
    if (currentExIndex > 0) {
      setCurrentExIndex((p) => p - 1);
      setPhase("getReady");
      setTimeLeft(10);
      setIsActive(true);
    }
  };

  const toggleTimer = () => {
    triggerHaptic(15); // Click feel
    setIsActive(!isActive);
  };

  // --- EXIT LOGIC ---
  const handleExitRequest = () => {
    // Pause the timer immediately
    setIsActive(false);
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    onExit();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
    // Note: We leave isActive as false (paused) so the user has to manually tap play to resume.
    // This matches the "deja todo como esta hasta q le de play" requirement.
  };

  if (phase === "finished") {
    return (
      <div className="h-dvh w-full flex flex-col items-center justify-center p-8 bg-black animate-in zoom-in duration-300">
        <div className="max-w-md w-full flex flex-col items-center">
          <Trophy className="w-24 h-24 text-amber-500 mb-6 drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]" />
          <h2 className="text-3xl font-black text-white mb-2 text-center tracking-tight">
            ¡MISIÓN CUMPLIDA!
          </h2>
          <div className="flex gap-4 w-full mb-8 mt-4">
            <div className="flex-1 bg-zinc-900 rounded-2xl p-4 text-center border border-zinc-800 shadow-lg">
              <div className="text-3xl font-bold text-white tracking-tighter">
                {Math.ceil(kcal)}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                Kcal
              </div>
            </div>
            <div className="flex-1 bg-zinc-900 rounded-2xl p-4 text-center border border-zinc-800 shadow-lg">
              <div className="text-3xl font-bold text-white tracking-tighter">
                {workoutPlan.exercises.length}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                Ejercicios
              </div>
            </div>
          </div>
          <button
            onClick={onExit}
            className="w-full py-5 bg-white text-black font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-gray-200 transition-colors"
          >
            GUARDAR PROGRESO
          </button>
        </div>
      </div>
    );
  }

  const ex = workoutPlan.exercises[currentExIndex];
  const nextEx = workoutPlan.exercises[currentExIndex + 1];
  const isResting = phase === "rest" || phase === "getReady";
  const totalDuration =
    phase === "getReady"
      ? 10
      : phase === "work"
        ? settings.work
        : settings.rest;
  const pct = ((totalDuration - timeLeft) / totalDuration) * 100;
  const activeModalExercise = isResting
    ? phase === "getReady"
      ? ex
      : nextEx || ex
    : ex;

  // Get random tip for current exercise index
  const currentTip = sessionTips[currentExIndex % sessionTips.length];

  return (
    <div
      className={`h-dvh w-full flex flex-col relative transition-colors duration-700 overflow-hidden landscape:flex-row landscape:items-center landscape:justify-center ${isResting ? "bg-zinc-950" : `bg-gradient-to-b ${theme.gradient} to-black`}`}
    >
      {showGuide && (
        <ExerciseGuideModal
          exercise={activeModalExercise}
          onClose={() => setShowGuide(false)}
          theme={theme}
        />
      )}

      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 w-full max-w-xs rounded-3xl border border-white/10 shadow-2xl p-6 flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500 border border-red-500/20">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-black text-white text-center mb-2">
              ¿Abandonar?
            </h3>
            <p className="text-center text-zinc-400 text-sm mb-6 leading-relaxed">
              Estás pausando la rutina. Si sales,{" "}
              <span className="text-white font-bold">
                perderás las {Math.floor(kcal)} calorías
              </span>{" "}
              acumuladas en esta sesión.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={cancelExit}
                className="w-full py-3.5 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform"
              >
                CONTINUAR
              </button>
              <button
                onClick={confirmExit}
                className="w-full py-3.5 bg-zinc-800 text-red-400 font-bold rounded-xl active:scale-95 transition-transform border border-white/5 hover:bg-zinc-700"
              >
                SALIR Y PERDER PROGRESO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Adaptive Positioning */}
      <div className="w-full p-4 pt-safe-top flex justify-between items-center z-20 shrink-0 landscape:absolute landscape:top-0 landscape:left-0 landscape:w-full">
        <button
          onClick={handleExitRequest}
          className="p-3 bg-white/5 rounded-full backdrop-blur-sm active:scale-95 transition-transform border border-white/5"
        >
          <Home className="w-5 h-5 text-zinc-300" />
        </button>
        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-sm font-bold text-white font-mono">
            {Math.floor(kcal)}
          </span>
        </div>
      </div>

      {/* Progress - Adaptive Positioning */}
      <div className="w-full px-6 flex items-center gap-1.5 z-10 mt-2 shrink-0 h-6 landscape:absolute landscape:top-16 landscape:left-0 landscape:w-full landscape:mt-0">
        {workoutPlan.exercises.map((_, i) => {
          const isCompleted = i < currentExIndex;
          const isCurrent = i === currentExIndex;

          return (
            <div
              key={i}
              className={`
                flex-1 rounded-full flex items-center justify-center transition-all duration-500
                ${isCompleted ? `${theme.primary} h-2.5` : isCurrent ? "bg-white h-3 shadow-[0_0_10px_white]" : "bg-white/10 h-1.5"}
              `}
            >
              {isCompleted && (
                <Check size={8} strokeWidth={4} className="text-black/50" />
              )}
            </div>
          );
        })}
      </div>

      {/* Timer & Main Visual - Adaptive Sizing */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-0 landscape:flex-1 landscape:mt-12 landscape:h-full landscape:justify-center">
        <button
          onClick={toggleTimer}
          className="relative w-[min(70vw,300px)] landscape:w-[min(60vh,300px)] landscape:h-[min(60vh,300px)] aspect-square flex items-center justify-center mb-6 landscape:mb-0 active:scale-[0.98] transition-transform touch-manipulation outline-none"
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-2xl overflow-visible">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              stroke="#27272a"
              strokeWidth="6%"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              stroke="currentColor"
              strokeWidth="6%"
              fill="transparent"
              strokeDasharray="289%"
              strokeDashoffset={`${289 * (pct / 100)}%`}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-linear ${isResting ? "text-emerald-500" : theme.text} ${isActive ? (timeLeft <= 4 ? "animate-pulse-glow-fast" : "animate-pulse-glow") : ""}`}
            />
          </svg>

          <div className="flex flex-col items-center z-10">
            <span
              className={`text-7xl sm:text-8xl font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-lg ${timeLeft < 4 && isActive ? "animate-pulse text-red-500" : ""}`}
            >
              {timeLeft}
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 mt-2">
              {isResting ? "DESCANSO" : "TRABAJO"}
            </span>
          </div>

          {(!isActive || showGuide || showExitConfirm) && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-full backdrop-blur-sm animate-in fade-in">
              <Pause className="fill-white text-white w-12 h-12 drop-shadow-lg" />
            </div>
          )}
        </button>
      </div>

      {/* Info & Footer Controls - Adaptive Layout */}
      <div className="w-full flex flex-col items-center landscape:w-1/2 landscape:h-full landscape:justify-center landscape:pr-8 landscape:pl-4">
        <div className="text-center w-full max-w-sm flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-500 px-4 mb-4 landscape:mb-8">
          <div className="flex flex-col items-center justify-center gap-3 mb-2 w-full relative px-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight text-center line-clamp-2">
              {isResting
                ? phase === "getReady"
                  ? ex.name
                  : nextEx?.name || "FIN"
                : ex.name}
            </h2>
            
            <div className="flex items-center justify-center gap-3">
              {/* Sets & Reps Details */}
              {(!isResting || phase === "getReady") && (
                 <div className="text-emerald-400 font-bold tracking-widest text-sm uppercase px-4 py-1.5 bg-emerald-900/40 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                   {ex.sets} Sets × {ex.reps === "Libre" ? "Libre" : `${ex.reps} Reps`}
                 </div>
              )}
              {isResting && phase === "rest" && nextEx && (
                 <div className="text-emerald-400 font-bold tracking-widest text-sm uppercase px-4 py-1.5 bg-emerald-900/40 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                   Sgte: {nextEx.sets} Sets × {nextEx.reps === "Libre" ? "Libre" : `${nextEx.reps} Reps`}
                 </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGuide(true);
                }}
                className="shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform hover:bg-white/20"
              >
                <Info size={18} className={theme.text} />
              </button>
            </div>
          </div>

          <div className="h-12 flex items-center justify-center">
            <p
              className={`text-zinc-400 font-medium text-sm sm:text-base italic transition-all duration-500 ${isResting ? "opacity-50" : "opacity-100"}`}
            >
              "
              {isResting
                ? nextEx
                  ? "Prepárate para el siguiente"
                  : "¡Casi terminamos!"
                : currentTip}
              "
            </p>
          </div>
        </div>

        <div className="p-6 pb-safe-bottom bg-gradient-to-t from-black via-black/90 to-transparent z-20 flex gap-4 w-full max-w-md mx-auto shrink-0 landscape:bg-none landscape:p-0 landscape:w-full">
          <button
            onClick={handlePrev}
            disabled={currentExIndex === 0 && phase === "getReady"}
            className="h-14 w-14 flex items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800 active:scale-95 disabled:opacity-30 disabled:scale-100 shadow-lg transition-transform"
          >
            <RotateCcw className="w-5 h-5 text-zinc-300" />
          </button>

          <button
            onClick={handleSkip}
            className={`
              flex-1 h-14 rounded-2xl font-black text-lg tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-xl
              ${isResting ? "bg-emerald-600 text-white shadow-emerald-900/40 hover:bg-emerald-500" : `${theme.primary} text-white ${theme.shadow} brightness-110`}
            `}
          >
            {isResting ? "EMPEZAR" : "SALTAR"}
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- TRAINING VIEW (New Tab) ---
const TrainingView: React.FC<{
  week: WeekLevel;
  setWeek: (w: WeekLevel) => void;
  day: number;
  setDay: (d: number) => void;
  userData: UserData;
  onToggleCheck: (exName: string) => void;
}> = ({ week, setWeek, day, setDay, userData, onToggleCheck }) => {
  const dailyPlan = useMemo(() => getDailyPlan(week, day), [week, day]);
  const theme = THEMES[week];
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const isRoutineComplete = useMemo(() => {
    if (userData.history.length === 0) return false;
    const todayIso = new Date().toISOString().split('T')[0];
    return userData.history.some(h => h.week === week && h.day === day && h.date.split('T')[0] === todayIso);
  }, [userData.history, week, day]);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto pb-32 pt-safe-top">
      {selectedEx && (
        <ExerciseGuideModal
          exercise={selectedEx}
          onClose={() => setSelectedEx(null)}
          theme={theme}
        />
      )}

      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-8 mt-4 max-w-sm mx-auto w-full">
        <button 
          onClick={() => setWeek(Math.max(1, week - 1) as WeekLevel)}
          className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-full active:scale-95 text-zinc-400 disabled:opacity-30 disabled:pointer-events-none transition-transform"
          disabled={week === 1}
        >
           <ChevronRight className="rotate-180" size={24} />
        </button>
        <div className="text-center">
           <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Semana {week}</h2>
           <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase mt-0.5">Progreso General</p>
        </div>
        <button 
          onClick={() => setWeek(Math.min(8, week + 1) as WeekLevel)}
          className="w-12 h-12 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-full active:scale-95 text-zinc-400 disabled:opacity-30 disabled:pointer-events-none transition-transform"
          disabled={week === 8}
        >
           <ChevronRight size={24} />
        </button>
      </div>

      {/* Day Progress Bubble Navigation */}
      <div className="relative w-full max-w-[280px] mx-auto mb-10 h-12 flex items-center justify-between px-2">
        {/* Background Line */}
        <div className="absolute top-1/2 left-6 right-6 h-1.5 -translate-y-1/2 bg-zinc-900 border-y border-zinc-800 z-0 rounded-full" />
        
        {[1, 2, 3, 4].map((d) => {
          const todayIso = new Date().toISOString().split('T')[0];
          const isDayComp = userData.history.some(h => h.week === week && h.day === d && h.date.split('T')[0] === todayIso);
          const isSelected = day === d;
          
          return (
             <button
               key={d}
               onClick={() => setDay(d)}
               className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-black transition-all duration-300 transform
                  ${isDayComp ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]" : 
                    isSelected ? "bg-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.3)] ring-4 ring-black" : 
                    "bg-zinc-900 border-2 border-zinc-700 text-zinc-500 shadow-lg hover:border-zinc-500"}
               `}
             >
               {isDayComp ? <Check size={20} strokeWidth={4} /> : d}
             </button>
          )
        })}
      </div>

      {/* Main Routine Card */}
      <div className={`relative bg-gradient-to-br ${theme.gradient} to-black p-1 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-all duration-500 mx-auto w-full max-w-sm mb-4`}>
         <div className="bg-zinc-950/95 backdrop-blur-3xl rounded-[28px] p-5 sm:p-6 text-center relative overflow-hidden border border-white/5">
            
            {/* Background Icon */}
            <Dumbbell className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-[-15deg] pointer-events-none" />

            <div className="relative z-10">
              <span className={`text-[10px] font-bold tracking-widest uppercase ${theme.text} bg-white/5 px-3 py-1 rounded-full mb-3 inline-block shadow-inner`}>
                 Día {day} • {dailyPlan.tag}
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-none uppercase tracking-tight">{dailyPlan.title}</h3>
              <p className="text-zinc-400 text-xs font-bold mb-6 flex items-center justify-center gap-2">
                 <Clock size={12} className="text-zinc-500"/> ~25 MIN
                 <span className="text-zinc-700">•</span>
                 <Target size={12} className="text-zinc-500"/> {dailyPlan.exercises.length} EJERCICIOS
              </p>

              {/* Compact List inside Card */}
              <div className="flex flex-col gap-2.5 mb-2 relative">
                  {/* Completion Overlay matching the card */}
                  {isRoutineComplete && (
                    <div className="absolute inset-x-0 inset-y-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[2px] rounded-2xl border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)] animate-in fade-in duration-500">
                      <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                        <Check className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" strokeWidth={3} />
                      </div>
                      <h3 className="text-xl font-black text-white px-2 text-center tracking-tighter uppercase drop-shadow-md">
                        ¡Completado!
                      </h3>
                    </div>
                  )}

                  {dailyPlan.exercises.map((ex, i) => {
                      const isManuallyChecked = userData.dailyChecklist.exercises.includes(ex.name) && userData.dailyChecklist.date === new Date().toDateString();
                      const isCompleted = isRoutineComplete || isManuallyChecked;
                      
                      return (
                        <div key={i} onClick={() => setSelectedEx(ex)} className={`group relative flex items-center gap-3 bg-black/40 p-2.5 sm:p-3 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer overflow-hidden ${isCompleted ? "border-emerald-500/30 bg-emerald-900/10" : "border-white/5 hover:bg-zinc-900/40"}`}>
                           
                           {isCompleted && (
                             <div className="absolute inset-0 bg-emerald-500/5 z-0 pointer-events-none" />
                           )}

                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border relative z-10 ${isCompleted ? "bg-emerald-500 text-black border-transparent shadow-[0_0_10px_rgba(16,185,129,0.3)]" : `bg-zinc-900 border-white/10 ${theme.text}`}`}>
                              {isCompleted ? <Check size={18} strokeWidth={3} /> : ex.category === "push" ? <Zap size={16} /> : ex.category === "legs" ? <Footprints size={16} /> : ex.category === "core" ? <Activity size={16} /> : <Dumbbell size={16} />}
                           </div>
                           <div className="flex-1 text-left relative z-10 min-w-0">
                               <div className={`text-sm font-bold truncate transition-colors ${isCompleted ? "text-emerald-400" : "text-zinc-200 group-hover:text-white"}`}>{ex.name}</div>
                               <div className={`text-[10px] uppercase font-bold tracking-wider truncate mt-0.5 ${isCompleted ? "text-emerald-500/70" : "text-zinc-500"}`}>
                                 {ex.sets} × {ex.reps} {isCompleted && "• HECHO"}
                               </div>
                           </div>
                           
                           <button onClick={(e) => { e.stopPropagation(); onToggleCheck(ex.name); }} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors border ${isCompleted ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:bg-white/10"}`}>
                              {isCompleted ? <RotateCcw size={14} /> : <Check size={14} />}
                           </button>
                        </div>
                      );
                  })}
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- STATS VIEW ---
const StatsView: React.FC<{
  userData: UserData;
  onWaterUpdate: (count: number) => void;
}> = ({ userData, onWaterUpdate }) => {
  return (
    <div className="h-full p-6 overflow-y-auto pb-24 text-white">
      <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-6">
        Tu Progreso
      </h2>


      {/* Water Tracker */}
      <div className="mb-6">
        <WaterTracker
          initialGlasses={userData.waterIntake}
          onUpdate={onWaterUpdate}
        />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-center items-center relative overflow-hidden text-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Flame size={14} className="text-orange-500" />
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              Racha
            </span>
          </div>
          <div className="text-xl font-black text-white">
            {userData.streak} <span className="text-xs font-bold text-zinc-500">D</span>
          </div>
        </div>

        <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-center items-center relative overflow-hidden text-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity size={14} className="text-emerald-500" />
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              Kcal
            </span>
          </div>
          <div className="text-xl font-black text-white">
            {(userData.totalCalories / 1000).toFixed(1)}k
          </div>
        </div>

        <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-center items-center relative overflow-hidden text-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Trophy size={14} className="text-yellow-500" />
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              Total
            </span>
          </div>
          <div className="text-xl font-black text-white">
            {userData.totalWorkouts}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-zinc-400 mt-4">
        <Calendar size={16} />
        <h3 className="text-sm font-bold uppercase tracking-wider">
          Historial Reciente
        </h3>
      </div>

      <div className="space-y-3">
        {[...userData.history]
          .reverse()
          .slice(0, 10)
          .map((entry, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-white/5"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-2 h-2 rounded-full ${entry.difficulty === "spartan" ? "bg-rose-500" : entry.difficulty === "intermediate" ? "bg-violet-500" : "bg-emerald-500"}`}
                />
                <div>
                  <div className="text-white font-bold text-sm">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                    Semana {entry.week} - Día {entry.day}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-mono font-bold">
                  {Math.ceil(entry.calories)}{" "}
                  <span className="text-xs text-zinc-500">kcal</span>
                </div>
              </div>
            </div>
          ))}
        {userData.history.length === 0 && (
          <div className="text-zinc-500 text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-sm">Sin actividad reciente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [week, setWeek] = useState<WeekLevel>(1);
  const [day, setDay] = useState<number>(1);
  const [isWorkoutMode, setIsWorkoutMode] = useState(false);
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem("chronos_v8_data");
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed
      ? { ...parsed, currentWeek: parsed.currentWeek || 1 }
      : {
          streak: 0,
          totalWorkouts: 0,
          totalCalories: 0,
          lastWorkoutDate: null,
          history: [],
          currentWeek: 1,
          dailyChecklist: { date: new Date().toDateString(), exercises: [] },
          waterIntake: 0,
          lastWaterDate: new Date().toDateString(),
        };
  });

  useEffect(() => {
    localStorage.setItem("chronos_v8_data", JSON.stringify(userData));
  }, [userData]);

  // Check streak on load
  useEffect(() => {
    if (userData.lastWorkoutDate) {
      const last = new Date(userData.lastWorkoutDate);
      const diff = Math.floor(
        (new Date().getTime() - last.getTime()) / (1000 * 3600 * 24),
      );
      if (diff > 1) {
        setUserData((prev) => ({ ...prev, streak: 0 }));
      }
    }

    // Reset water intake if new day
    const today = new Date().toDateString();
    if (userData.lastWaterDate !== today) {
      setUserData((prev) => ({
        ...prev,
        waterIntake: 0,
        lastWaterDate: today,
      }));
    }
  }, []);

  const handleWorkoutComplete = (calories: number) => {
    const today = new Date().toDateString();
    setUserData((prev) => {
      const isNewDay = prev.lastWorkoutDate !== today;
      let nextDay = day + 1;
      let nextWeek = week;
      if (nextDay > 4) {
        nextDay = 1;
        if (nextWeek < 8) nextWeek = (nextWeek + 1) as WeekLevel;
      }
      setDay(nextDay);
      setWeek(nextWeek);

      return {
        ...prev,
        currentWeek: nextWeek,
        streak: isNewDay ? prev.streak + 1 : prev.streak,
        totalWorkouts: prev.totalWorkouts + 1,
        totalCalories: prev.totalCalories + calories,
        lastWorkoutDate: today,
        history: [
          ...prev.history,
          { date: new Date().toISOString(), calories, week, day },
        ],
      };
    });
    setIsWorkoutMode(false);
    setActiveTab("home");
  };

  const toggleChecklist = (exName: string) => {
    const today = new Date().toDateString();
    setUserData((prev) => {
      const isSameDay = prev.dailyChecklist.date === today;
      let currentList = isSameDay ? prev.dailyChecklist.exercises : [];

      if (currentList.includes(exName)) {
        currentList = currentList.filter((n) => n !== exName);
      } else {
        currentList = [...currentList, exName];
      }

      return {
        ...prev,
        dailyChecklist: { date: today, exercises: currentList },
      };
    });
  };

  const handleWaterUpdate = (count: number) => {
    setUserData((prev) => ({
      ...prev,
      waterIntake: count,
      lastWaterDate: new Date().toDateString(),
    }));
  };

  if (isWorkoutMode) {
    return (
      <WorkoutScreen
        week={week}
        day={day}
        onExit={() => setIsWorkoutMode(false)}
        onComplete={handleWorkoutComplete}
      />
    );
  }

  return (
    <div className="h-dvh bg-black text-white flex flex-col font-sans selection:bg-emerald-500/30">
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "home" && (
          <StatsView userData={userData} onWaterUpdate={handleWaterUpdate} />
        )}
        {activeTab === "workout" && (
          <div className="h-full flex flex-col relative w-full overflow-hidden">
            {!isWorkoutMode && (
              <TrainingView
                week={week}
                setWeek={setWeek}
                day={day}
                setDay={setDay}
                userData={userData}
                onToggleCheck={toggleChecklist}
              />
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 pb-20 z-50 pointer-events-none flex justify-center">
              <button
                onClick={() => setIsWorkoutMode(true)}
                className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-colors active:scale-95 text-lg tracking-widest pointer-events-auto shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
              >
                 <Dumbbell size={20} /> INICIAR RUTINA
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default App;
