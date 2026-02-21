import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from "recharts";
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
import { ToastProvider, useToast } from "./src/components/Toast";
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAw219mME1tUInToBenaTz6sbOXwhjQ_A4",
  authDomain: "calishome-bb361.firebaseapp.com",
  projectId: "calishome-bb361",
  storageBucket: "calishome-bb361.firebasestorage.app",
  messagingSenderId: "490047922513",
  appId: "1:490047922513:web:399380d93731d7a34df370"
};

// Se inicializa, pero si los datos son inválidos, el AuthScreen manejará el bypass para que no rompa la app.
let app: any, auth: any, googleProvider: any, db: any;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase Init Error:", error);
}

// --- PANTALLA DE BIENVENIDA ---
const AuthScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      if (auth && googleProvider) {
        await signInWithPopup(auth, googleProvider);
      }
      setIsExiting(true);
      setTimeout(() => onLogin(), 600); // Wait for fade out
    } catch (err: any) {
      console.warn("Bypass Login (Faltan credenciales de Auth reales en firebaseConfig):", err);
      setIsExiting(true);
      setTimeout(() => onLogin(), 600);
    }
  };

  return (
    <div className={`h-dvh flex flex-col items-center justify-between bg-[#09090b] px-6 py-12 text-center relative overflow-hidden transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
      
      {/* Premium Background Image */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <img 
          src="/dumbbell-bg.png" 
          alt="Premium Calisthenics Equipment" 
          className="w-full h-full object-cover object-center opacity-40 mix-blend-lighten"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b]/40 z-10" />
      </div>

      {/* Top spacer */}
      <div className="flex-1 relative z-20" />

      {/* Main UI Content - Only Typography */}
      <div className="flex-none flex flex-col items-center justify-center w-full mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-20">
        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] animate-pulse-glow">
          CalisHome
        </h1>
        <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-3 drop-shadow-md">
          Athlete Edition
        </p>
      </div>

      {/* Bottom CTA Area - Dark Effect Button */}
      <div className="flex-1 flex flex-col items-center justify-end w-full max-w-sm gap-8 pb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both relative z-20">
        <button
          onClick={handleGoogleLogin}
          className="group w-full flex items-center justify-center gap-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-zinc-300 py-4 px-6 rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-zinc-800 hover:text-white hover:border-emerald-500/50 active:scale-95 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]"
        >
          <svg fill="currentColor" className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Ingresar con Google
        </button>
      </div>
    </div>
  );
};
type WeekLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Category = "push" | "legs" | "core" | "fullbody" | "rest" | "posterior";
type Phase = "getReady" | "work" | "rest" | "finished";
type Tab = "home" | "workout" | "settings";

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
  waterIntake: number;
  lastWaterDate: string | null;
  theme?: "claro" | "medio" | "oscuro";
  waterGoal: number;       // vasos por día (default 8)
  restSeconds: number;     // segundos de descanso entre series (default 15)
  waterHistory: Array<{ date: string; glasses: number }>;  // historial de hidratación
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
    gradient: string;
    text: string;
    shadow: string;
    badge: string;
    border: string;
  }
> = {
  1: { primary: "bg-emerald-500", gradient: "from-emerald-900", text: "text-emerald-400", shadow: "shadow-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20", border: "border-emerald-500/30" },
  2: { primary: "bg-sky-500", gradient: "from-sky-900", text: "text-sky-400", shadow: "shadow-sky-500/20", badge: "bg-sky-500/10 text-sky-300 border-sky-500/20", border: "border-sky-500/30" },
  3: { primary: "bg-violet-600", gradient: "from-violet-900", text: "text-violet-400", shadow: "shadow-violet-500/20", badge: "bg-violet-500/10 text-violet-300 border-violet-500/20", border: "border-violet-500/30" },
  4: { primary: "bg-amber-500", gradient: "from-amber-900", text: "text-amber-400", shadow: "shadow-amber-500/20", badge: "bg-amber-500/10 text-amber-300 border-amber-500/20", border: "border-amber-500/30" },
  5: { primary: "bg-rose-600", gradient: "from-rose-900", text: "text-rose-400", shadow: "shadow-rose-500/20", badge: "bg-rose-500/10 text-rose-300 border-rose-500/20", border: "border-rose-500/30" },
  6: { primary: "bg-fuchsia-600", gradient: "from-fuchsia-900", text: "text-fuchsia-400", shadow: "shadow-fuchsia-500/20", badge: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20", border: "border-fuchsia-500/30" },
  7: { primary: "bg-orange-600", gradient: "from-orange-900", text: "text-orange-400", shadow: "shadow-orange-500/20", badge: "bg-orange-500/10 text-orange-300 border-orange-500/20", border: "border-orange-500/30" },
  8: { primary: "bg-red-600", gradient: "from-red-900", text: "text-red-400", shadow: "shadow-red-500/20", badge: "bg-red-500/10 text-red-300 border-red-500/20", border: "border-red-500/30" }
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

const speakTone = (text: string) => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.1; // Un poco más rápido y dinámico
    window.speechSynthesis.speak(utterance);
  }
};

// --- BASE DE DATOS DE EJERCICIOS ---
const EXERCISE_DB: Record<string, Exercise> = {
  pushups: { id: 'pushups', name: 'Push Up (Flexiones)', category: 'push', met: 6.0, steps: ['Manos ancho hombros', 'Cuerpo recto', 'Baja a 90°', 'Sube empujando'], query: 'como hacer flexiones perfectas' },
  diamond_pushups: { id: 'diamond_pushups', name: 'Diamond Push Up', category: 'push', met: 6.5, steps: ['Manos juntas', 'Codos pegados al cuerpo', 'Baja hasta las manos'], query: 'diamond push ups technique' },
  decline_pushups: { id: 'decline_pushups', name: 'Decline Push Up', category: 'push', met: 6.5, steps: ['Pies elevados', 'Baja controlado', 'Empuja fuerte'], query: 'decline push ups form' },
  squats: { id: 'squats', name: 'Bodyweight Squat', category: 'legs', met: 5.5, steps: ['Peso en talones', 'Pecho abierto', 'Baja rompiendo paralelo'], query: 'bodyweight squat correct form' },
  lunges: { id: 'lunges', name: 'Reverse Lunge', category: 'legs', met: 6.0, steps: ['Paso largo atrás', 'Talón delantero manda', 'Torso recto'], query: 'reverse lunge technique' },
  squat_hold: { id: 'squat_hold', name: 'Squat Hold', category: 'legs', met: 3.5, steps: ['Bajá a 90° y sostené', 'Peso en talones', 'Espalda recta'], query: 'squat hold isometric' },
  plank: { id: 'plank', name: 'Plank', category: 'core', met: 3.3, steps: ['Glúteos fuertes', 'Respiración nasal', 'Alineación perfecta'], query: 'perfect plank form' },
  burpees: { id: 'burpees', name: 'Burpee (controlado)', category: 'fullbody', met: 9.8, steps: ['Plancha alta', 'Sin colapsar lumbar', 'Ponte de pie sin salto'], query: 'controlled burpee form' },
  good_mornings: { id: 'good_mornings', name: 'Good Mornings', category: 'posterior', met: 3.0, steps: ['Pies al ancho de hombros', 'Flexiona la cadera', 'Espalda recta siempre'], query: 'good mornings bodyweight' },
  rest: { id: 'rest', name: 'Descanso Activo', category: 'rest', met: 2.0, steps: ['Camina libremente', 'Respira profundo', 'Hidrátate'], query: 'active rest stretching' },
};

// --- RUTINAS INTELIGENTES (8 semanas desde rutina.md) ---
const getDailyPlan = (week: WeekLevel, dayNumber: number): DailyPlan => {
  // S1 Base data
  const S1: Record<number, { title: string; tag: string; exercises: Array<{id: string, sets: number, reps: number | string}> }> = {
    1: { title: "Push + Core", tag: "Fuerza Base", exercises: [
      {id: 'pushups', sets: 4, reps: 12}, {id: 'lunges', sets: 4, reps: '12/12'},
      {id: 'diamond_pushups', sets: 3, reps: 10}, {id: 'plank', sets: 3, reps: '45s'},
      {id: 'burpees', sets: 3, reps: 8},
    ]},
    2: { title: "Legs Dominante", tag: "Tren Inferior", exercises: [
      {id: 'squats', sets: 4, reps: 18}, {id: 'lunges', sets: 4, reps: '12/12'},
      {id: 'squat_hold', sets: 3, reps: '40s'}, {id: 'plank', sets: 3, reps: '45s'},
      {id: 'burpees', sets: 3, reps: 10},
    ]},
    3: { title: "Posterior + Core", tag: "Estabilidad", exercises: [
      {id: 'lunges', sets: 4, reps: '14/14'}, {id: 'pushups', sets: 4, reps: 12},
      {id: 'plank', sets: 3, reps: '60s'}, {id: 'squats', sets: 3, reps: 15},
      {id: 'burpees', sets: 6, reps: 6},
    ]},
    4: { title: "Full Body Control", tag: "Metabólico", exercises: [
      {id: 'pushups', sets: 4, reps: 14}, {id: 'squats', sets: 4, reps: 18},
      {id: 'diamond_pushups', sets: 3, reps: 12}, {id: 'plank', sets: 3, reps: '60s'},
      {id: 'burpees', sets: 3, reps: 8},
    ]},
  };

  // Week-specific plan builders
  const planData: Record<WeekLevel, Record<number, { title: string; tag: string; exercises: Array<{id: string, sets: number, reps: number | string}> }>> = {
    1: S1,
    // S2: +5% volume (+2 push, +3 squat, +2 lunge, +10s plank, +1 burpee)
    2: {
      1: { title: "Push + Core", tag: "+5% Volumen", exercises: [
        {id: 'pushups', sets: 4, reps: 14}, {id: 'lunges', sets: 4, reps: '14/14'},
        {id: 'diamond_pushups', sets: 3, reps: 12}, {id: 'plank', sets: 3, reps: '55s'},
        {id: 'burpees', sets: 3, reps: 9},
      ]},
      2: { title: "Legs Dominante", tag: "+5% Volumen", exercises: [
        {id: 'squats', sets: 4, reps: 21}, {id: 'lunges', sets: 4, reps: '14/14'},
        {id: 'squat_hold', sets: 3, reps: '50s'}, {id: 'plank', sets: 3, reps: '55s'},
        {id: 'burpees', sets: 3, reps: 11},
      ]},
      3: { title: "Posterior + Core", tag: "+5% Volumen", exercises: [
        {id: 'lunges', sets: 4, reps: '16/16'}, {id: 'pushups', sets: 4, reps: 14},
        {id: 'plank', sets: 3, reps: '70s'}, {id: 'squats', sets: 3, reps: 18},
        {id: 'burpees', sets: 6, reps: 7},
      ]},
      4: { title: "Full Body Control", tag: "+5% Volumen", exercises: [
        {id: 'pushups', sets: 4, reps: 16}, {id: 'squats', sets: 4, reps: 21},
        {id: 'diamond_pushups', sets: 3, reps: 14}, {id: 'plank', sets: 3, reps: '70s'},
        {id: 'burpees', sets: 3, reps: 9},
      ]},
    },
    // S3: Tempo Control — same reps as S2, plank 70s, tempo 3-1-1
    3: {
      1: { title: "Push + Core", tag: "Tempo 3-1-1", exercises: [
        {id: 'pushups', sets: 4, reps: 14}, {id: 'lunges', sets: 4, reps: '14/14'},
        {id: 'diamond_pushups', sets: 3, reps: 12}, {id: 'plank', sets: 3, reps: '70s'},
        {id: 'burpees', sets: 3, reps: 9},
      ]},
      2: { title: "Legs Dominante", tag: "Tempo 3-1-1", exercises: [
        {id: 'squats', sets: 4, reps: 21}, {id: 'lunges', sets: 4, reps: '14/14'},
        {id: 'squat_hold', sets: 3, reps: '50s'}, {id: 'plank', sets: 3, reps: '70s'},
        {id: 'burpees', sets: 3, reps: 11},
      ]},
      3: { title: "Posterior + Core", tag: "Tempo 3-1-1", exercises: [
        {id: 'lunges', sets: 4, reps: '16/16'}, {id: 'pushups', sets: 4, reps: 14},
        {id: 'plank', sets: 3, reps: '70s'}, {id: 'squats', sets: 3, reps: 18},
        {id: 'burpees', sets: 6, reps: 7},
      ]},
      4: { title: "Full Body Control", tag: "Tempo 3-1-1", exercises: [
        {id: 'pushups', sets: 4, reps: 16}, {id: 'squats', sets: 4, reps: 21},
        {id: 'diamond_pushups', sets: 3, reps: 14}, {id: 'plank', sets: 3, reps: '70s'},
        {id: 'burpees', sets: 3, reps: 9},
      ]},
    },
    // S4: Deload — -30% vol, no heavy finisher, technique only
    4: {
      1: { title: "Push + Core", tag: "Deload", exercises: [
        {id: 'pushups', sets: 3, reps: 10}, {id: 'lunges', sets: 3, reps: '10/10'},
        {id: 'plank', sets: 2, reps: '40s'},
      ]},
      2: { title: "Legs Dominante", tag: "Deload", exercises: [
        {id: 'squats', sets: 3, reps: 14}, {id: 'lunges', sets: 3, reps: '10/10'},
        {id: 'squat_hold', sets: 2, reps: '30s'},
      ]},
      3: { title: "Posterior + Core", tag: "Deload", exercises: [
        {id: 'lunges', sets: 3, reps: '10/10'}, {id: 'pushups', sets: 3, reps: 10},
        {id: 'plank', sets: 2, reps: '45s'},
      ]},
      4: { title: "Full Body Control", tag: "Deload", exercises: [
        {id: 'pushups', sets: 3, reps: 10}, {id: 'squats', sets: 3, reps: 14},
        {id: 'plank', sets: 2, reps: '40s'},
      ]},
    },
    // S5: Strength Control — A×5, B×4, decline pushups, lunges pausadas
    5: {
      1: { title: "Push + Core", tag: "Strength Control", exercises: [
        {id: 'decline_pushups', sets: 5, reps: 12}, {id: 'lunges', sets: 5, reps: '14/14'},
        {id: 'diamond_pushups', sets: 4, reps: 12}, {id: 'plank', sets: 4, reps: '60s'},
        {id: 'burpees', sets: 3, reps: 10},
      ]},
      2: { title: "Legs Dominante", tag: "Strength Control", exercises: [
        {id: 'squats', sets: 5, reps: 20}, {id: 'lunges', sets: 5, reps: '16/16'},
        {id: 'squat_hold', sets: 4, reps: '50s'}, {id: 'plank', sets: 4, reps: '60s'},
        {id: 'burpees', sets: 3, reps: 10},
      ]},
      3: { title: "Posterior + Core", tag: "Strength Control", exercises: [
        {id: 'lunges', sets: 5, reps: '16/16'}, {id: 'pushups', sets: 5, reps: 14},
        {id: 'plank', sets: 4, reps: '70s'}, {id: 'squats', sets: 4, reps: 18},
        {id: 'burpees', sets: 3, reps: 8},
      ]},
      4: { title: "Full Body Control", tag: "Strength Control", exercises: [
        {id: 'decline_pushups', sets: 5, reps: 14}, {id: 'squats', sets: 5, reps: 20},
        {id: 'diamond_pushups', sets: 4, reps: 14}, {id: 'plank', sets: 4, reps: '70s'},
        {id: 'burpees', sets: 3, reps: 10},
      ]},
    },
    // S6: Tensión y Densidad — descansos 30-35s, push 15, squat 22, plank 80s, burpees 10/min
    6: {
      1: { title: "Push + Core", tag: "Tensión + Densidad", exercises: [
        {id: 'pushups', sets: 4, reps: 15}, {id: 'lunges', sets: 4, reps: '16/16'},
        {id: 'diamond_pushups', sets: 3, reps: 14}, {id: 'plank', sets: 3, reps: '80s'},
        {id: 'burpees', sets: 3, reps: 10},
      ]},
      2: { title: "Legs Dominante", tag: "Tensión + Densidad", exercises: [
        {id: 'squats', sets: 4, reps: 22}, {id: 'lunges', sets: 4, reps: '16/16'},
        {id: 'squat_hold', sets: 3, reps: '60s'}, {id: 'plank', sets: 3, reps: '80s'},
        {id: 'burpees', sets: 3, reps: 10},
      ]},
      3: { title: "Posterior + Core", tag: "Tensión + Densidad", exercises: [
        {id: 'lunges', sets: 4, reps: '18/18'}, {id: 'pushups', sets: 4, reps: 15},
        {id: 'plank', sets: 3, reps: '80s'}, {id: 'squats', sets: 3, reps: 22},
        {id: 'burpees', sets: 6, reps: 10},
      ]},
      4: { title: "Full Body Control", tag: "Tensión + Densidad", exercises: [
        {id: 'pushups', sets: 4, reps: 15}, {id: 'squats', sets: 4, reps: 22},
        {id: 'diamond_pushups', sets: 3, reps: 14}, {id: 'plank', sets: 3, reps: '80s'},
        {id: 'burpees', sets: 3, reps: 10},
      ]},
    },
    // S7: High Volume — A×5, B×4, push 20, squat 25, lunge 18/18, plank 90s
    7: {
      1: { title: "Push + Core", tag: "High Volume", exercises: [
        {id: 'pushups', sets: 5, reps: 20}, {id: 'lunges', sets: 5, reps: '18/18'},
        {id: 'diamond_pushups', sets: 4, reps: 16}, {id: 'plank', sets: 4, reps: '90s'},
        {id: 'burpees', sets: 4, reps: 10},
      ]},
      2: { title: "Legs Dominante", tag: "High Volume", exercises: [
        {id: 'squats', sets: 5, reps: 25}, {id: 'lunges', sets: 5, reps: '18/18'},
        {id: 'squat_hold', sets: 4, reps: '60s'}, {id: 'plank', sets: 4, reps: '90s'},
        {id: 'burpees', sets: 4, reps: 10},
      ]},
      3: { title: "Posterior + Core", tag: "High Volume", exercises: [
        {id: 'lunges', sets: 5, reps: '18/18'}, {id: 'pushups', sets: 5, reps: 20},
        {id: 'plank', sets: 4, reps: '90s'}, {id: 'squats', sets: 4, reps: 25},
        {id: 'burpees', sets: 4, reps: 10},
      ]},
      4: { title: "Full Body Control", tag: "High Volume", exercises: [
        {id: 'pushups', sets: 5, reps: 20}, {id: 'squats', sets: 5, reps: 25},
        {id: 'diamond_pushups', sets: 4, reps: 16}, {id: 'plank', sets: 4, reps: '90s'},
        {id: 'burpees', sets: 4, reps: 12},
      ]},
    },
    // S8: Peak Control — specific per day from rutina.md
    8: {
      1: { title: "Push + Core", tag: "Peak Control", exercises: [
        {id: 'pushups', sets: 4, reps: 18}, {id: 'diamond_pushups', sets: 4, reps: 14},
        {id: 'plank', sets: 3, reps: '90s'}, {id: 'burpees', sets: 3, reps: 10},
      ]},
      2: { title: "Legs Dominante", tag: "Peak Control", exercises: [
        {id: 'squats', sets: 4, reps: 25}, {id: 'lunges', sets: 4, reps: '20/20'},
        {id: 'squat_hold', sets: 3, reps: '60s'}, {id: 'plank', sets: 3, reps: '90s'},
      ]},
      3: { title: "Posterior + Core", tag: "Peak Control", exercises: [
        {id: 'plank', sets: 3, reps: '100s'}, {id: 'pushups', sets: 4, reps: 15},
        {id: 'lunges', sets: 4, reps: '18/18'}, {id: 'squats', sets: 3, reps: 20},
      ]},
      4: { title: "Full Body Final", tag: "Peak Control", exercises: [
        {id: 'burpees', sets: 4, reps: 10}, {id: 'pushups', sets: 4, reps: 15},
        {id: 'squats', sets: 4, reps: 20}, {id: 'plank', sets: 3, reps: '90s'},
      ]},
    },
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

      <button
        onClick={() => onChange("settings")}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-colors duration-300 group ${activeTab === "settings" ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
      >
        <div
          className={`p-1.5 rounded-xl transition-all duration-300 ${activeTab === "settings" ? "bg-white/10" : "bg-transparent"}`}
        >
          <Settings
            size={24}
            strokeWidth={activeTab === "settings" ? 2.5 : 2}
            className="transition-transform group-active:scale-90"
          />
        </div>
        <span className="text-[10px] font-bold tracking-widest">AJUSTES</span>
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
  restSeconds: number;
}

const WorkoutScreen: React.FC<WorkoutScreenProps> = ({
  week,
  day,
  onExit,
  onComplete,
  restSeconds,
}) => {
  const workoutPlan = useMemo(
    () => getDailyPlan(week, day),
    [week, day],
  );
  const theme = THEMES[week];

  const WORK_SECONDS = 45;

  const [phase, setPhase] = useState<Phase>("getReady");
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
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
    let sentinel: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      if ("wakeLock" in navigator) {
        try {
          sentinel = await navigator.wakeLock.request("screen");
          setWakeLock(sentinel);
        } catch (err) {
          console.warn("Wake Lock error:", err);
        }
      }
    };
    requestWakeLock();
    return () => {
      if (sentinel) sentinel.release();
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const isPausedByModal = showGuide || showExitConfirm;
    const ex = workoutPlan.exercises[currentExIndex];
    const totalSets = typeof ex?.sets === 'number' ? ex.sets : 1;

    if (isActive && timeLeft > 0 && !isPausedByModal && phase !== "finished") {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          const nextTime = t - 1;
          if (phase === "work") {
            if (nextTime < 10 && nextTime > 0) {
              const pitch = 400 + nextTime * 50;
              playTone(pitch, "sine", 0.15, 0.05);
            }
          } else {
            if (nextTime <= 3 && nextTime > 0) {
              playTone(600, "square", 0.1, 0.1);
            }
          }
          return nextTime;
        });
        if (phase === "work" && ex) {
          setKcal((k) => k + (ex.met * 3.5 * USER_WEIGHT_KG) / 200 / 60);
        }
      }, 1000);
    } else if (timeLeft === 0 && !isPausedByModal && phase !== "finished") {
      // --- Phase transitions ---
      if (phase === "getReady") {
        setPhase("work");
        setTimeLeft(WORK_SECONDS);
        playTone(880, "square", 0.3, 0.1);
        triggerHaptic(50);
      } else if (phase === "work") {
        // Always go to rest unless it's the very last set of the last exercise
        if (currentSet < totalSets || currentExIndex < workoutPlan.exercises.length - 1) {
          setPhase("rest");
          setTimeLeft(restSeconds);
          playTone(1500, "triangle", 0.1, 0.1);
          triggerHaptic(50);
        } else {
          // Last set of last exercise → finished
          setPhase("finished");
          playTone(880, "square", 0.1, 0.1);
          setTimeout(() => playTone(1100, "square", 0.2, 0.1), 150);
          triggerHaptic([50, 50, 50]);
          onComplete(Math.ceil(kcal));
        }
      } else if (phase === "rest") {
        if (currentSet < totalSets) {
          // Next set of same exercise
          setCurrentSet((s) => s + 1);
          setPhase("work");
          setTimeLeft(WORK_SECONDS);
        } else {
          // All sets done → move to next exercise now (at end of rest)
          setCurrentExIndex((p) => p + 1);
          setCurrentSet(1);
          setPhase("work");
          setTimeLeft(WORK_SECONDS);
        }
        playTone(880, "square", 0.3, 0.1);
        triggerHaptic(50);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    isActive,
    timeLeft,
    phase,
    currentSet,
    currentExIndex,
    showGuide,
    showExitConfirm,
    workoutPlan.exercises,
    kcal,
    onComplete,
    WORK_SECONDS,
    restSeconds,
  ]);

  const handleSkip = () => {
    triggerHaptic(15); // Click feel
    setTimeLeft(0);
  };

  const handlePrev = () => {
    triggerHaptic(15);
    if (currentSet > 1) {
      setCurrentSet((s) => s - 1);
      setPhase("work");
      setTimeLeft(WORK_SECONDS);
      setIsActive(true);
    } else if (currentExIndex > 0) {
      setCurrentExIndex((p) => p - 1);
      setCurrentSet(1);
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
  const totalSetsForEx = typeof ex?.sets === 'number' ? ex.sets : 1;
  // Is this a transition rest? (completed all sets, about to move to next exercise)
  const isTransitionRest = phase === "rest" && currentSet >= totalSetsForEx;
  const totalDuration =
    phase === "getReady"
      ? 10
      : phase === "work"
        ? WORK_SECONDS
        : restSeconds;
  const pct = ((totalDuration - timeLeft) / totalDuration) * 100;
  const activeModalExercise = isTransitionRest ? (nextEx || ex) : ex;

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
        <div className="relative flex items-center justify-center w-full max-w-[300px] sm:max-w-[400px]">
          <button
            onClick={toggleTimer}
            className="relative w-full aspect-square flex items-center justify-center mb-6 landscape:mb-0 active:scale-[0.98] transition-transform touch-manipulation outline-none"
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
                className={`transition-all duration-1000 ease-linear ${isResting ? "text-sky-500 drop-shadow-[0_0_15px_rgba(14,165,233,0.3)]" : theme.text} ${isActive ? (timeLeft <= 4 ? "animate-pulse-glow-fast" : "animate-pulse-glow") : ""}`}
              />
            </svg>

            <div className="flex flex-col items-center z-10">
              <span
                className={`text-6xl sm:text-8xl font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-lg ${timeLeft < 4 && isActive ? "animate-pulse text-red-500" : ""}`}
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
      </div>

      {/* Info & Footer Controls - Adaptive Layout */}
      <div className="w-full flex flex-col items-center landscape:w-1/2 landscape:h-full landscape:justify-center landscape:pr-8 landscape:pl-4">
        <div className="text-center w-full max-w-sm flex flex-col items-center animate-in slide-in-from-bottom-4 fade-in duration-500 px-4 mb-4 landscape:mb-8">
          <div className="flex flex-col items-center justify-center gap-3 mb-2 w-full relative px-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight text-center line-clamp-2">
              {isTransitionRest
                ? nextEx?.name || "FIN"
                : ex.name}
            </h2>
            
            <div className="flex items-center justify-center gap-3">
              {/* Sets & Reps Details */}
              {(!isResting || phase === "getReady") && (
                 <div className="text-emerald-400 font-bold tracking-widest text-sm uppercase px-4 py-1.5 bg-emerald-900/40 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                   Serie {currentSet}/{ex.sets} · {ex.reps === "Libre" ? "Libre" : `${ex.reps} Reps`}
                 </div>
              )}
              {isResting && phase === "rest" && (
                <div className="text-emerald-400 font-bold tracking-widest text-sm uppercase px-4 py-1.5 bg-emerald-900/40 rounded-full border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  {isTransitionRest && nextEx
                    ? `Serie 1/${nextEx.sets} · ${nextEx.reps === "Libre" ? "Libre" : `${nextEx.reps} Reps`}`
                    : `Serie ${currentSet}/${ex.sets} · ${ex.reps === "Libre" ? "Libre" : `${ex.reps} Reps`}`
                  }
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
                ? isTransitionRest
                  ? nextEx
                    ? "Prepárate para el siguiente"
                    : "¡Casi terminamos!"
                  : "Descansá, viene la siguiente serie"
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
  onResetDay: () => void;
}> = ({ week, setWeek, day, setDay, userData, onToggleCheck, onResetDay }) => {
  const dailyPlan = useMemo(() => getDailyPlan(week, day), [week, day]);
  const theme = THEMES[week];
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const isRoutineComplete = useMemo(() => {
    return userData.history.some(h => h.week === week && h.day === day);
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
          // Completed = any time this week+day appears in history (any date)
          const isDayComp = userData.history.some(h => h.week === week && h.day === d);
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
                 <Clock size={12} className="text-zinc-500"/> ~{Math.round(dailyPlan.exercises.reduce((sum, ex) => sum + (typeof ex.sets === 'number' ? ex.sets : 1) * 45 / 60, 0) + dailyPlan.exercises.length * 15 / 60)} MIN
                 <span className="text-zinc-700">•</span>
                 <Target size={12} className="text-zinc-500"/> {dailyPlan.exercises.length} EJERCICIOS
                 <span className="text-zinc-700">•</span>
                 <Flame size={12} className="text-orange-500"/> ~{Math.round(dailyPlan.exercises.reduce((sum, ex) => sum + (ex.met * 3.5 * 67 / 200 / 60) * (typeof ex.sets === 'number' ? ex.sets : 1) * 45, 0))} kcal
              </p>

              {/* Compact List inside Card */}
              <div className="flex flex-col gap-2.5 mb-2 relative">
                  {/* Completion Overlay matching the card */}
                  {isRoutineComplete && (
                    <div className="absolute inset-x-0 inset-y-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-[2px] rounded-2xl border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)] animate-in fade-in duration-500">
                      <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                        <Check className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" strokeWidth={3} />
                      </div>
                      <h3 className="text-xl font-black text-white px-2 text-center tracking-tighter uppercase drop-shadow-md mb-3">
                        ¡Completado!
                      </h3>
                      <button
                        onClick={onResetDay}
                        className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800/80 text-zinc-300 border border-zinc-600 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-transform hover:bg-zinc-700"
                      >
                        <RotateCcw size={14} /> Reiniciar Día
                      </button>
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
  const [selectedEntry, setSelectedEntry] = useState<UserData['history'][0] | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const todayDate = new Date();
  const currentMonth = todayDate.getMonth();
  const currentYear = todayDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const days = Array(startOffset).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentYear, currentMonth, i));
  }

  const historyMap = useMemo(() => {
    const map = new Map();
    userData.history.forEach(entry => {
      const d = new Date(entry.date);
      const k = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      map.set(k, entry);
    });
    return map;
  }, [userData.history]);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const isoDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const entryInfo = historyMap.get(isoDate);
      data.push({
        name: ['D','L','M','X','J','V','S'][d.getDay()],
        calories: entryInfo ? Math.ceil(entryInfo.calories) : 0,
      });
    }
    return data;
  }, [historyMap, todayDate]);

  return (
    <div className="h-full p-6 overflow-y-auto pb-24 text-white">
      <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-6">
        Tu Progreso
      </h2>

      {/* Water Tracker moved to top */}
      <div className="mb-8">
        <WaterTracker
          initialGlasses={userData.waterIntake}
          goal={userData.waterGoal ?? 8}
          onUpdate={onWaterUpdate}
        />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
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
            {userData.totalCalories >= 1000
              ? `${(userData.totalCalories / 1000).toFixed(1)}k`
              : Math.round(userData.totalCalories)}
          </div>
        </div>

        <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex flex-col justify-center items-center relative overflow-hidden text-center">
          <div className="flex items-center gap-1.5 mb-1">
            <Target size={14} className="text-yellow-500" />
            <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              Restantes
            </span>
          </div>
          <div className="text-xl font-black text-white">
            {Math.max(0, GOAL_DAYS - userData.totalWorkouts)}
          </div>
        </div>
      </div>

      {/* Chart Section Toggle */}
      <button 
        onClick={() => setShowChart(!showChart)}
        className="w-full flex items-center justify-between mt-8 mb-4 active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2 text-zinc-400">
          <BarChart2 size={16} />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Rendimiento Semanal
          </h3>
        </div>
        <ChevronUp size={16} className={`text-zinc-500 transition-transform ${showChart ? '' : 'rotate-180'}`} />
      </button>

      {/* Chart Section Content */}
      <div className={`transition-all duration-300 overflow-hidden ${showChart ? 'max-h-64 opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'}`}>
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
          <div className="h-40 w-full px-1">
            {showChart && (
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff' }}
                    itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                    formatter={(value: any) => [`${value} kcal`, 'Quemado']}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar dataKey="calories" radius={[4, 4, 4, 4]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.calories > 0 ? '#10B981' : '#27272a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-between mt-3 px-3">
            {chartData.map((d, i) => (
              <span key={i} className={`text-[10px] font-bold ${d.calories > 0 ? 'text-emerald-400' : 'text-zinc-600'}`}>{d.name}</span>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full flex items-center justify-between mb-4 mt-8 active:scale-95 transition-transform"
      >
        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar size={16} />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Historial
          </h3>
        </div>
        <ChevronUp size={16} className={`text-zinc-500 transition-transform ${showCalendar ? '' : 'rotate-180'}`} />
      </button>

      <div className={`transition-all duration-300 overflow-hidden ${showCalendar ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
          <div className="text-center mb-4">
            <h4 className="text-sm font-black tracking-widest uppercase text-white">{monthNames[currentMonth]} {currentYear}</h4>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
              <div key={day} className="text-[10px] font-bold text-zinc-500">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
              const tzD = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
              const hasEntry = historyMap.has(tzD);
              const entryData = historyMap.get(tzD);

              return (
                <button
                  key={i}
                  disabled={!hasEntry}
                  onClick={() => hasEntry && setSelectedEntry(entryData)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-bold transition-all relative
                    ${hasEntry ? 'bg-zinc-800 text-white active:scale-95 cursor-pointer hover:bg-zinc-700 shadow-sm border border-white/10' : 'text-zinc-600'}
                  `}
                >
                  {date.getDate()}
                  {hasEntry && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 shadow-sm ${THEMES[entryData.week]?.primary || "bg-emerald-500"}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in" onClick={() => setSelectedEntry(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEntry(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-zinc-800 text-zinc-400 rounded-full active:scale-90 transition-transform">
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-6">
               <div className={`w-3 h-3 rounded-full ${THEMES[selectedEntry.week]?.primary || "bg-emerald-500"}`} />
               <h3 className="text-xl font-black italic tracking-tighter uppercase">Sesión Resumen</h3>
            </div>
            <div className="space-y-3">
               <div className="bg-zinc-950 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                 <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Fecha / Hora</span>
                 <span className="text-white font-bold text-sm text-right">
                    {new Date(selectedEntry.date).toLocaleDateString()}<br/>
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest">{new Date(selectedEntry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                 </span>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1.5">RUTINA</span>
                    <span className="text-white font-black text-lg leading-none">SEMANA {selectedEntry.week} <br/><span className="text-emerald-500 text-xs uppercase tracking-widest mt-1 inline-block">DÍA {selectedEntry.day}</span></span>
                 </div>
                 <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                    <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-1.5">QUEMADO</span>
                    <span className="text-orange-500 font-black text-3xl leading-none">{Math.ceil(selectedEntry.calories)}<span className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest ml-1">kcal</span></span>
                 </div>
               </div>
               {/* Hydration row */}
               {(() => {
                 const entryDateIso = new Date(selectedEntry.date).toISOString().split('T')[0];
                 const waterGoal = userData.waterGoal ?? 8;
                 // Check today vs entry date
                 const todayIso = new Date().toISOString().split('T')[0];
                 const isToday = entryDateIso === todayIso;
                 const waterRecord = isToday
                   ? { glasses: userData.waterIntake }
                   : (userData.waterHistory ?? []).find(w => w.date === entryDateIso);
                 if (!waterRecord) return null;
                 const done = waterRecord.glasses >= waterGoal;
                 return (
                   <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                     done
                       ? 'bg-emerald-500/10 border-emerald-500/30'
                       : 'bg-red-500/10 border-red-500/30'
                   }`}>
                     <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Hidratación</span>
                     <span className={`font-black text-sm ${
                       done ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'text-red-400'
                     }`}>
                       {waterRecord.glasses}/{waterGoal} vasos — {done ? 'Completo ✓' : 'Incompleto'}
                     </span>
                   </div>
                 );
               })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// --- SETTINGS VIEW ---
const SettingsView: React.FC<{
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}> = ({ userData, setUserData }) => {
  const toast = useToast();
  const currentTheme = userData.theme || "oscuro";
  const currentWaterGoal = userData.waterGoal ?? 8;
  const currentRestSeconds = userData.restSeconds ?? 15;

  const resetRoutine = () => {
    toast.confirm("¿Estás 100% seguro? Se borrará todo tu progreso de 8 semanas.", () => {
      setUserData(prev => ({ 
        ...prev, 
        history: [], 
        currentWeek: 1, 
        dailyChecklist: { date: new Date().toDateString(), exercises: [] }, 
        streak: 0, 
        totalWorkouts: 0,
        totalCalories: 0,
        lastWorkoutDate: null
      }));
      toast.show('Progreso reiniciado', 'success');
    }, { type: 'error', confirmText: 'Resetear Todo', cancelText: 'Cancelar' });
  };

  return (
    <div className="h-full p-6 overflow-y-auto pb-24 text-white text-center">
      <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-6">Ajustes</h2>
      
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6 shadow-lg">
        <h3 className="text-sm uppercase tracking-widest text-zinc-400 font-bold mb-4">Tema de Interfaz</h3>
        <div className="flex gap-2 justify-center">
          <button onClick={() => setUserData(p => ({ ...p, theme: 'medio' }))}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${currentTheme === 'medio' ? 'bg-[#1E293B] text-[#38BDF8] shadow-[0_0_15px_rgba(14,165,233,0.2)] border border-[#0EA5E9]' : 'bg-black/50 text-zinc-500'}`}>Océano</button>
          <button onClick={() => setUserData(p => ({ ...p, theme: 'oscuro' }))}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${currentTheme === 'oscuro' ? 'bg-black border border-zinc-700 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-black/50 text-zinc-500'}`}>Void</button>
        </div>
      </div>

      {/* Water Goal Setting */}
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6 shadow-lg">
        <h3 className="text-sm uppercase tracking-widest text-zinc-400 font-bold mb-1">Meta de Hidratación</h3>
        <p className="text-zinc-600 text-xs mb-4">Vasos de agua por día (1 vaso = 250ml)</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {[6, 7, 8, 9, 10].map(n => (
            <button
              key={n}
              onClick={() => setUserData(p => ({ ...p, waterGoal: n }))}
              className={`w-12 h-12 rounded-xl font-black text-base transition-all ${
                currentWaterGoal === n
                  ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <p className="text-zinc-600 text-[10px] mt-3 text-center">Meta actual: {currentWaterGoal} vasos = {(currentWaterGoal * 0.25).toFixed(2)}L</p>
      </div>

      {/* Rest Seconds Setting */}
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6 shadow-lg">
        <h3 className="text-sm uppercase tracking-widest text-zinc-400 font-bold mb-1">Descanso entre series</h3>
        <p className="text-zinc-600 text-xs mb-4">Segundos de pausa entre cada serie</p>
        <div className="flex gap-2 justify-center">
          {[10, 15, 20, 30].map(s => (
            <button
              key={s}
              onClick={() => setUserData(p => ({ ...p, restSeconds: s }))}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                currentRestSeconds === s
                  ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {s}s
            </button>
          ))}
        </div>
      </div>

      <div className="bg-red-950/20 p-6 rounded-2xl border border-red-900/50 mt-12 shadow-inner">
        <h3 className="text-lg font-bold text-red-500 mb-2">Zona de Peligro</h3>
        <p className="text-xs text-red-400/70 mb-6">Reiniciar la rutina borrará tu progreso actual y recomenzará tu viaje en CalisHome.</p>
        <button onClick={resetRoutine} className="w-full bg-red-600/20 text-red-500 border border-red-500/50 rounded-xl py-3 font-bold active:scale-95 transition-transform uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:bg-red-600/30">
          Resetear Todo
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const AppInner: React.FC = () => {
  const toast = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [week, setWeek] = useState<WeekLevel>(1);
  const [day, setDay] = useState<number>(1);
  const [isWorkoutMode, setIsWorkoutMode] = useState(false);
  const [userData, setUserData] = useState<UserData>(() => {
    const saved = localStorage.getItem("chronos_v8_data");
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed
      ? {
          ...parsed,
          currentWeek: parsed.currentWeek || 1,
          waterGoal: parsed.waterGoal ?? 8,
          restSeconds: parsed.restSeconds ?? 15,
          waterHistory: parsed.waterHistory ?? [],
        }
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
          waterGoal: 8,
          restSeconds: 15,
          waterHistory: [],
        };
  });

  const cloudLoadComplete = React.useRef(false);

  useEffect(() => {
    localStorage.setItem("chronos_v8_data", JSON.stringify(userData));
    if (auth?.currentUser && db && cloudLoadComplete.current) {
      setDoc(doc(db, "users", auth.currentUser.uid), userData).catch(err => console.warn("Cloud Sync Error", err));
    }
  }, [userData]);

  // Auth Cloud Sync
  useEffect(() => {
    if (!auth) return;
    const unsub = auth.onAuthStateChanged(async (user: any) => {
      if (user && db) {
        setIsAuthenticated(true);
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            const cloudData = docSnap.data() as UserData;
            setUserData(prev => ({ ...prev, ...cloudData, currentWeek: cloudData.currentWeek || 1 }));
            setTimeout(() => { cloudLoadComplete.current = true; }, 100);
          } else {
            // New active cloud account, pump local to cloud directly
            setDoc(doc(db, "users", user.uid), userData);
            cloudLoadComplete.current = true;
          }
        } catch (e: any) {
          if (e.code === 'permission-denied') {
             console.warn("Acceso a Firestore denegado. Configura las reglas de la BD a modo prueba o asegúrate de que el UID coincida.");
          } else {
             console.warn("Fallo de Firestore:", e);
          }
        }
      } else {
        setIsAuthenticated(false);
        cloudLoadComplete.current = false;
      }
    });
    return () => unsub();
  }, []);

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
    
    // Only advance day (not week). Week advances when all 4 days are complete.
    let nextDay = day < 4 ? day + 1 : day;

    setUserData((prev) => {
      const isNewDay = prev.lastWorkoutDate !== today;
      const newHistory = [
        ...prev.history,
        { date: new Date().toISOString(), calories, week, day },
      ];

      // Check if all 4 days of current week are now complete
      const completedDays = new Set(newHistory.filter(h => h.week === week).map(h => h.day));
      let nextWeek = week;
      if (completedDays.size >= 4 && week < 8) {
        nextWeek = (week + 1) as WeekLevel;
        nextDay = 1; // reset to day 1 of new week
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
        history: newHistory,
      };
    });
    setIsWorkoutMode(false);
    setActiveTab("home");
  };

  const toggleChecklist = (exName: string) => {
    const today = new Date().toDateString();
    const plan = getDailyPlan(week, day);
    const estimatedKcal = Math.round(
      plan.exercises.reduce((sum, ex) =>
        sum + (ex.met * 3.5 * USER_WEIGHT_KG / 200 / 60) * (typeof ex.sets === 'number' ? ex.sets : 1) * 45, 0)
    );

    setUserData((prev) => {
      const isSameDay = prev.dailyChecklist.date === today;
      let currentList = isSameDay ? prev.dailyChecklist.exercises : [];

      if (currentList.includes(exName)) {
        currentList = currentList.filter((n) => n !== exName);
      } else {
        currentList = [...currentList, exName];
      }

      // Check if ALL exercises are now manually completed
      const allChecked = plan.exercises.every(ex => currentList.includes(ex.name));
      // Only add history entry once (not if already recorded for this week+day)
      const alreadyRecorded = prev.history.some(h => h.week === week && h.day === day);

      if (allChecked && !alreadyRecorded) {
        const isNewDay = prev.lastWorkoutDate !== today;
        return {
          ...prev,
          dailyChecklist: { date: today, exercises: currentList },
          history: [...prev.history, { date: new Date().toISOString(), calories: estimatedKcal, week, day }],
          totalCalories: prev.totalCalories + estimatedKcal,
          totalWorkouts: prev.totalWorkouts + 1,
          streak: isNewDay ? prev.streak + 1 : prev.streak,
          lastWorkoutDate: today,
        };
      }

      return {
        ...prev,
        dailyChecklist: { date: today, exercises: currentList },
      };
    });
  };

  const handleWaterUpdate = (count: number) => {
    const today = new Date().toDateString();
    setUserData((prev) => {
      const updates: Partial<UserData> = {
        waterIntake: count,
        lastWaterDate: today,
      };
      // Si cambió el día desde la última actualiza, guarda el registro anterior en waterHistory
      if (prev.lastWaterDate && prev.lastWaterDate !== today && prev.waterIntake > 0) {
        const dateIso = new Date(prev.lastWaterDate).toISOString().split('T')[0];
        const alreadySaved = (prev.waterHistory ?? []).some(w => w.date === dateIso);
        if (!alreadySaved) {
          updates.waterHistory = [
            ...(prev.waterHistory ?? []),
            { date: dateIso, glasses: prev.waterIntake },
          ];
        }
      }
      return { ...prev, ...updates };
    });
  };

  const handleResetDay = () => {
    toast.confirm(`¿Reiniciar Día ${day} de Semana ${week}?`, () => {
      setUserData((prev) => {
        const entry = prev.history.find(h => h.week === week && h.day === day);
        const caloriesToRemove = entry ? entry.calories : 0;
        return {
          ...prev,
          history: prev.history.filter(h => !(h.week === week && h.day === day)),
          totalCalories: Math.max(0, prev.totalCalories - caloriesToRemove),
          totalWorkouts: Math.max(0, prev.totalWorkouts - 1),
          dailyChecklist: { date: new Date().toDateString(), exercises: [] },
        };
      });
      toast.show('Día reiniciado correctamente', 'success');
    }, { confirmText: 'Reiniciar', cancelText: 'Cancelar' });
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  if (isWorkoutMode) {
    return (
      <WorkoutScreen
        week={week}
        day={day}
        onExit={() => setIsWorkoutMode(false)}
        onComplete={handleWorkoutComplete}
        restSeconds={userData.restSeconds ?? 15}
      />
    );
  }

  const currentTheme = userData.theme || "oscuro";

  return (
    <div className={`h-dvh flex flex-col font-sans transition-colors duration-500 selection:bg-emerald-500/30 font-inter ${currentTheme === 'medio' ? 'bg-[#0B1121] text-[#F8FAFC]' : 'bg-black text-white'}`}>
      <style>{`
        ${currentTheme === 'medio' ? `
          .bg-black { background-color: #0B1121 !important; }
          .bg-black\\/80 { background-color: rgba(11, 17, 33, 0.85) !important; }
          .bg-zinc-950 { background-color: #111827 !important; }
          .bg-zinc-950\\/95 { background-color: rgba(17, 24, 39, 0.95) !important; }
          .bg-zinc-900 { background-color: #1E293B !important; border-color: #334155 !important; }
          .bg-zinc-900\\/50 { background-color: rgba(30, 41, 59, 0.5) !important; border-color: #334155 !important; }
          .text-white { color: #F8FAFC !important; }
          .text-zinc-400 { color: #94A3B8 !important; }
          .text-zinc-500 { color: #64748B !important; }
          .border-zinc-800, .border-zinc-700, .border-white\\/5, .border-white\\/10 { border-color: #334155 !important; }
          .bg-white\\/5 { background-color: rgba(255, 255, 255, 0.03) !important; }
          .bg-white\\/10 { background-color: rgba(255, 255, 255, 0.06) !important; }
          /* Shift Emerald shades to Modern Cyan */
          .text-emerald-500 { color: #0EA5E9 !important; }
          .text-emerald-400 { color: #38BDF8 !important; }
          .bg-emerald-500 { background-color: #0EA5E9 !important; color: #FFFFFF !important; }
          .bg-emerald-900\\/40 { background-color: rgba(14, 165, 233, 0.15) !important; }
          .border-emerald-500\\/30 { border-color: rgba(14, 165, 233, 0.3) !important; }
          .shadow-\\[0_0_10px_rgba\\(16\\,185\\,129\\,0\\.2\\)\\] { box-shadow: 0 0 10px rgba(14,165,233,0.3) !important; }
          .shadow-\\[0_0_20px_rgba\\(16\\,185\\,129\\,0\\.4\\)\\] { box-shadow: 0 0 20px rgba(14,165,233,0.4) !important; }
        ` : `
          .bg-black { background-color: #000000; }
        `}
      `}</style>
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "home" && (
          <StatsView userData={userData} onWaterUpdate={handleWaterUpdate} />
        )}
        {activeTab === "settings" && (
          <SettingsView userData={userData} setUserData={setUserData} />
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
                onResetDay={handleResetDay}
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

const AppWrapper: React.FC = () => (
  <ToastProvider>
    <AppInner />
  </ToastProvider>
);

export default AppWrapper;
