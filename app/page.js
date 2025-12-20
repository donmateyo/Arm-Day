"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Dumbbell, Timer, ChevronRight, Info, X, Check, Volume2, VolumeX, Trophy, Clock, Target, Flame, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WORKOUT_ROUTINE = [
  {
    id: 'A1',
    superset: 'A',
    name: 'KB Horn Curl',
    sets: 3,
    reps: '10–12',
    targetReps: 12,
    notes: 'Use the 35 lb or 50 lb KB. Squeeze hard at top.',
    weight: '35–50 lb KB'
  },
  {
    id: 'A2',
    superset: 'A',
    name: 'Floor Skull Crushers',
    sets: 3,
    reps: '12–15',
    targetReps: 15,
    notes: 'Use 25 lb DBs. Keep elbows pointing at ceiling.',
    weight: '25 lb DBs'
  },
  {
    id: 'B1',
    superset: 'B',
    name: 'DB Hammer Curls',
    sets: 3,
    reps: '10–12',
    targetReps: 12,
    notes: 'Use 25 or 35 lb DBs. Do not swing.',
    weight: '25–35 lb DBs'
  },
  {
    id: 'B2',
    superset: 'B',
    name: 'Close-Grip Floor Press',
    sets: 3,
    reps: 'AMRAP',
    targetReps: 20,
    notes: 'Use 35 lb DBs or 50 lb KB. As Many Reps As Possible.',
    weight: '35 lb DBs / 50 lb KB',
    isAMRAP: true
  },
  {
    id: 'C1',
    superset: 'C',
    name: 'Zottman Curls',
    sets: 2,
    reps: '12–15',
    targetReps: 15,
    notes: 'Use 25 lb DBs. Focus on the slow lowering phase.',
    weight: '25 lb DBs'
  }
];

const MOTIVATIONAL_QUOTES = {
  start: ["Let's build those arms 💪", "Time to get after it", "Arms day. Let's go.", "Ready to crush it?"],
  midway: ["Halfway there!", "Keep pushing", "You're in the zone", "Strong work so far"],
  almostDone: ["Final push!", "Almost there", "Finish strong", "One more exercise"],
  rest: ["Breathe and recover", "Shake it out", "You've got this", "Reset and go again"]
};

const AnimatedNumber = ({ value, className }) => {
  return (
    <motion.span
      key={value}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={className}
    >
      {value}
    </motion.span>
  );
};

// Seeded random number generator for consistent values
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const FloatingParticles = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const particles = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: seededRandom(i * 1) * 4 + 2,
      x: seededRandom(i * 2) * 100,
      y: seededRandom(i * 3) * 100,
      duration: seededRandom(i * 4) * 20 + 15,
      delay: seededRandom(i * 5) * 5,
      xOffset: seededRandom(i * 6) * 20 - 10
    }));
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-emerald-500/10"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, particle.xOffset, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const Confetti = ({ isActive }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const colors = ['#10b981', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];
  
  const confettiPieces = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(seededRandom(i * 10) * colors.length)],
      x: seededRandom(i * 11) * 100,
      rotation: seededRandom(i * 12) * 360,
      size: seededRandom(i * 13) * 8 + 4,
      duration: seededRandom(i * 14) * 2 + 2,
      delay: seededRandom(i * 15) * 0.5
    }));
  }, []);
  
  if (!isActive || !mounted) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: -20,
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            borderRadius: 2
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: 800,
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

const HoldToCompleteButton = ({ onComplete, disabled, children }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdDuration = 500;
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  
  const startHold = () => {
    if (disabled) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min(elapsed / holdDuration, 1);
      setProgress(newProgress);
      if (newProgress >= 1) {
        clearInterval(intervalRef.current);
        setIsHolding(false);
        setProgress(0);
        onComplete();
      }
    }, 16);
  };
  
  const endHold = () => {
    clearInterval(intervalRef.current);
    setIsHolding(false);
    setProgress(0);
  };
  
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);
  
  return (
    <motion.button
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled}
      className={`relative w-full py-4 rounded-2xl font-medium text-lg flex items-center justify-center gap-2 overflow-hidden transition-all ${
        disabled
          ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25'
      }`}
    >
      <motion.div
        className="absolute inset-0 bg-white/20"
        style={{ 
          transformOrigin: 'left',
          scaleX: progress
        }}
      />
      
      <span className="relative z-10 flex items-center gap-2">
        {isHolding ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            Hold...
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};

const BreathingRing = ({ children, isIdle }) => {
  return (
    <div className="relative">
      {isIdle && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      {children}
    </div>
  );
};

const InlineRestTimer = ({ restRemaining, restTime, onSkip }) => {
  const progress = restRemaining / restTime;
  
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="overflow-hidden"
    >
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-y border-amber-500/20 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"
            >
              <Timer className="w-5 h-5 text-amber-400" />
            </motion.div>
            <div>
              <p className="text-sm text-amber-400 font-medium">Rest</p>
              <p className="text-xs text-zinc-500">Next set coming up</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.span 
              key={restRemaining}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-white tabular-nums"
            >
              {restRemaining}
            </motion.span>
            <span className="text-zinc-500 text-sm">sec</span>
          </div>
        </div>
        
        <div className="h-1.5 bg-zinc-700/50 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSkip}
          className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-xl text-sm font-medium text-amber-400 transition-colors flex items-center justify-center gap-2"
        >
          <SkipForward className="w-4 h-4" />
          Skip Rest
        </motion.button>
      </div>
    </motion.div>
  );
};

export default function WorkoutApp() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('workout');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseProgress, setExerciseProgress] = useState(
    WORKOUT_ROUTINE.map(ex => ({
      id: ex.id,
      completedSets: 0,
      repsPerSet: [],
      isComplete: false
    }))
  );
  const [currentReps, setCurrentReps] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restTime, setRestTime] = useState(75);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [timerMode, setTimerMode] = useState('stopwatch');
  const [timerTime, setTimerTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [motivationalText, setMotivationalText] = useState("Let's build those arms 💪");
  const [lastReps, setLastReps] = useState(null);

  const restIntervalRef = useRef(null);
  const workoutIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const currentExercise = WORKOUT_ROUTINE[currentExerciseIndex];
  const currentProgress = exerciseProgress[currentExerciseIndex];

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const getGreeting = () => {
    if (!mounted) return "Welcome";
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Evening session";
  };

  useEffect(() => {
    if (!mounted) return;
    
    const completedExercises = exerciseProgress.filter(p => p.isComplete).length;
    const totalExercises = WORKOUT_ROUTINE.length;
    const progress = completedExercises / totalExercises;
    
    let quotes;
    if (isResting) {
      quotes = MOTIVATIONAL_QUOTES.rest;
    } else if (progress === 0) {
      quotes = MOTIVATIONAL_QUOTES.start;
    } else if (progress < 0.5) {
      quotes = MOTIVATIONAL_QUOTES.midway;
    } else {
      quotes = MOTIVATIONAL_QUOTES.almostDone;
    }
    
    setMotivationalText(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [currentExerciseIndex, isResting, exerciseProgress, mounted]);

  const playBeep = useCallback((frequency = 800, duration = 0.15) => {
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + duration);
        }
      } catch (e) {
        console.log('Audio not supported');
      }
    }
  }, [soundEnabled]);

  const playRepSound = useCallback(() => {
    playBeep(600, 0.08);
  }, [playBeep]);

  const playSetCompleteSound = useCallback(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          [0, 0.1, 0.2].forEach((delay, i) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = 500 + (i * 150);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime + delay);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.12);
            oscillator.start(audioCtx.currentTime + delay);
            oscillator.stop(audioCtx.currentTime + delay + 0.12);
          });
        }
      } catch (e) {
        console.log('Audio not supported');
      }
    }
  }, [soundEnabled]);

  const playWorkoutCompleteSound = useCallback(() => {
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          const notes = [523, 659, 784, 1047];
          notes.forEach((freq, i) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.3);
            oscillator.start(audioCtx.currentTime + i * 0.15);
            oscillator.stop(audioCtx.currentTime + i * 0.15 + 0.3);
          });
        }
      } catch (e) {
        console.log('Audio not supported');
      }
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (isResting && restRemaining > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestRemaining(prev => {
          if (prev <= 4 && prev > 1) {
            playBeep(400 + (4 - prev) * 100, 0.1);
          }
          if (prev <= 1) {
            setIsResting(false);
            playBeep(900, 0.3);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restIntervalRef.current);
    }
    return () => clearInterval(restIntervalRef.current);
  }, [isResting, restRemaining, playBeep]);

  useEffect(() => {
    if (isWorkoutActive && !workoutComplete) {
      workoutIntervalRef.current = setInterval(() => {
        setTotalWorkoutTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(workoutIntervalRef.current);
    }
    return () => clearInterval(workoutIntervalRef.current);
  }, [isWorkoutActive, workoutComplete]);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        if (timerMode === 'stopwatch') {
          setTimerTime(prev => prev + 1);
        } else {
          setTimerTime(prev => {
            if (prev <= 4 && prev > 1) {
              playBeep(400 + (4 - prev) * 100, 0.1);
            }
            if (prev <= 1) {
              setIsTimerRunning(false);
              playBeep(900, 0.3);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isTimerRunning, timerMode, playBeep]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    if (!isWorkoutActive) setIsWorkoutActive(true);
    
    const repsToLog = currentReps || currentExercise.targetReps;
    setLastReps(repsToLog);
    
    const newProgress = [...exerciseProgress];
    const exercise = newProgress[currentExerciseIndex];
    exercise.completedSets += 1;
    exercise.repsPerSet.push(repsToLog);
    
    if (exercise.completedSets >= currentExercise.sets) {
      exercise.isComplete = true;
      playSetCompleteSound();
      
      const allComplete = newProgress.every(p => p.isComplete);
      if (allComplete) {
        setWorkoutComplete(true);
        setShowConfetti(true);
        playWorkoutCompleteSound();
        setTimeout(() => setShowConfetti(false), 4000);
        setExerciseProgress(newProgress);
        return;
      }
      
      const nextIndex = newProgress.findIndex((p, i) => i > currentExerciseIndex && !p.isComplete);
      if (nextIndex !== -1) {
        setCurrentExerciseIndex(nextIndex);
      } else {
        const firstIncomplete = newProgress.findIndex(p => !p.isComplete);
        if (firstIncomplete !== -1) {
          setCurrentExerciseIndex(firstIncomplete);
        }
      }
    } else {
      setIsResting(true);
      setRestRemaining(restTime);
      playSetCompleteSound();
    }
    
    setCurrentReps(0);
    setExerciseProgress(newProgress);
  };

  const handleAddRep = () => {
    setCurrentReps(prev => prev + 1);
    playRepSound();
  };

  const handleSubtractRep = () => {
    if (currentReps > 0) {
      setCurrentReps(prev => prev - 1);
      playRepSound();
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setRestRemaining(0);
  };

  const goToExercise = (index) => {
    setCurrentExerciseIndex(index);
    setCurrentReps(0);
    setShowNotes(false);
  };

  const resetWorkout = () => {
    setExerciseProgress(
      WORKOUT_ROUTINE.map(ex => ({
        id: ex.id,
        completedSets: 0,
        repsPerSet: [],
        isComplete: false
      }))
    );
    setCurrentExerciseIndex(0);
    setCurrentReps(0);
    setIsResting(false);
    setRestRemaining(0);
    setTotalWorkoutTime(0);
    setIsWorkoutActive(false);
    setWorkoutComplete(false);
    setLastReps(null);
  };

  const totalSets = WORKOUT_ROUTINE.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = exerciseProgress.reduce((acc, p) => acc + p.completedSets, 0);
  const overallProgress = (completedSets / totalSets) * 100;

  const getSupersetColor = (superset) => {
    const colors = {
      'A': 'from-emerald-500 to-teal-600',
      'B': 'from-cyan-500 to-blue-600',
      'C': 'from-violet-500 to-purple-600'
    };
    return colors[superset] || 'from-zinc-500 to-zinc-600';
  };

  const getSupersetBg = (superset) => {
    const colors = {
      'A': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      'B': 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      'C': 'bg-violet-500/10 border-violet-500/30 text-violet-400'
    };
    return colors[superset] || 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4 pb-24 relative overflow-hidden">
      <FloatingParticles />
      <Confetti isActive={showConfetti} />
      
      <div className="max-w-lg mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Dumbbell className="w-6 h-6" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{getGreeting()}</h1>
              <motion.p 
                key={motivationalText}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-emerald-400"
              >
                {motivationalText}
              </motion.p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors backdrop-blur-sm border border-zinc-700/30"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-zinc-500" />}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {workoutComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-8 max-w-sm w-full text-center border border-zinc-700/50 shadow-2xl"
              >
                <motion.div 
                  className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2, damping: 15 }}
                >
                  <Trophy className="w-12 h-12" />
                </motion.div>
                <motion.h2 
                  className="text-3xl font-bold mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Workout Complete!
                </motion.h2>
                <motion.p 
                  className="text-zinc-400 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Great work crushing your arms session 💪
                </motion.p>
                <motion.div 
                  className="grid grid-cols-2 gap-4 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/30">
                    <Clock className="w-5 h-5 text-teal-400 mx-auto mb-2" />
                    <p className="text-xs text-zinc-500">Duration</p>
                    <p className="text-xl font-bold">{formatTime(totalWorkoutTime)}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/30">
                    <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                    <p className="text-xs text-zinc-500">Total Sets</p>
                    <p className="text-xl font-bold">{completedSets}</p>
                  </div>
                </motion.div>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetWorkout}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl font-medium text-lg shadow-lg shadow-emerald-500/25"
                >
                  Start New Workout
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            { icon: Clock, label: 'Duration', value: formatTime(totalWorkoutTime), color: 'text-teal-400' },
            { icon: Target, label: 'Sets', value: `${completedSets}/${totalSets}`, color: 'text-orange-400' },
            { icon: Trophy, label: 'Progress', value: `${Math.floor(overallProgress)}%`, color: 'text-amber-400' }
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-zinc-800/40 backdrop-blur-sm rounded-2xl p-3 border border-zinc-700/30 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-zinc-400">{stat.label}</span>
              </div>
              <p className="text-lg font-semibold">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="mb-6">
          <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full relative"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-zinc-800/40 p-1.5 rounded-2xl backdrop-blur-sm border border-zinc-700/30">
          {['workout', 'exercises', 'timer'].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all relative ${
                activeTab === tab ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'workout' && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <motion.div 
                layout
                className={`bg-zinc-800/40 backdrop-blur-sm rounded-3xl border border-zinc-700/30 overflow-hidden shadow-xl ${currentProgress.isComplete ? 'opacity-50' : ''}`}
              >
                <div className={`bg-gradient-to-r ${getSupersetColor(currentExercise.superset)} p-5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.span 
                        className="text-3xl font-bold opacity-50"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        key={currentExercise.id}
                      >
                        {currentExercise.id}
                      </motion.span>
                      <div>
                        <motion.h2 
                          className="text-xl font-bold"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={currentExercise.name}
                        >
                          {currentExercise.name}
                        </motion.h2>
                        <p className="text-sm opacity-80">{currentExercise.weight}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowNotes(!showNotes)}
                      className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                    >
                      {showNotes ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {showNotes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-zinc-900/50 border-b border-zinc-700/30">
                        <p className="text-sm text-zinc-300">{currentExercise.notes}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {isResting && (
                    <InlineRestTimer 
                      restRemaining={restRemaining}
                      restTime={restTime}
                      onSkip={skipRest}
                    />
                  )}
                </AnimatePresence>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-zinc-400">Set {Math.min(currentProgress.completedSets + 1, currentExercise.sets)} of {currentExercise.sets}</span>
                    <span className="text-sm text-zinc-400">Target: {currentExercise.reps} reps</span>
                  </div>

                  <div className="flex gap-2 mb-8">
                    {Array.from({ length: currentExercise.sets }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex-1 h-2.5 rounded-full transition-all ${
                          i < currentProgress.completedSets 
                            ? `bg-gradient-to-r ${getSupersetColor(currentExercise.superset)}`
                            : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  <BreathingRing isIdle={currentReps === 0 && !isResting}>
                    <div className="flex items-center justify-center mb-8">
                      <div className="relative">
                        <svg className="w-44 h-44 transform -rotate-90">
                          <circle
                            cx="88"
                            cy="88"
                            r="80"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-zinc-700"
                          />
                          <motion.circle
                            cx="88"
                            cy="88"
                            r="80"
                            stroke="url(#repGrad)"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                            animate={{ 
                              strokeDashoffset: 2 * Math.PI * 80 * (1 - Math.min(currentReps / currentExercise.targetReps, 1))
                            }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            strokeDasharray={2 * Math.PI * 80}
                          />
                          <defs>
                            <linearGradient id="repGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <AnimatedNumber value={currentReps} className="text-5xl font-bold" />
                          <span className="text-sm text-zinc-500 mt-1">reps</span>
                          {lastReps && currentReps === 0 && (
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-xs text-zinc-600 mt-2"
                            >
                              Last: {lastReps}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>
                  </BreathingRing>

                  <div className="flex items-center justify-center gap-6 mb-8">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSubtractRep}
                      className="w-16 h-16 rounded-2xl bg-zinc-700/50 hover:bg-zinc-600/50 flex items-center justify-center transition-colors shadow-lg"
                    >
                      <Minus className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddRep}
                      className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-all relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ scale: 0, opacity: 0.5 }}
                        whileTap={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{ borderRadius: '50%' }}
                      />
                      <Plus className="w-10 h-10 relative z-10" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentReps(0)}
                      className="w-16 h-16 rounded-2xl bg-zinc-700/50 hover:bg-zinc-600/50 flex items-center justify-center transition-colors shadow-lg"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.button>
                  </div>

                  <HoldToCompleteButton
                    onComplete={handleCompleteSet}
                    disabled={currentProgress.isComplete}
                  >
                    <Check className="w-5 h-5" />
                    {currentProgress.isComplete ? 'Exercise Complete' : 'Hold to Complete Set'}
                  </HoldToCompleteButton>
                  
                  <p className="text-xs text-zinc-500 text-center mt-3">Hold button for half a second to confirm</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-800/40 backdrop-blur-sm rounded-2xl p-4 border border-zinc-700/30 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Rest between sets</span>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRestTime(Math.max(30, restTime - 15))}
                      className="w-8 h-8 rounded-lg bg-zinc-700/50 hover:bg-zinc-600/50 flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="w-12 text-center font-medium tabular-nums">{restTime}s</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRestTime(restTime + 15)}
                      className="w-8 h-8 rounded-lg bg-zinc-700/50 hover:bg-zinc-600/50 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">Recommended: 60-90 seconds</p>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={resetWorkout}
                className="w-full py-3 bg-zinc-800/40 hover:bg-zinc-700/40 rounded-xl text-sm font-medium text-zinc-400 hover:text-white transition-colors border border-zinc-700/30"
              >
                Reset Workout
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'exercises' && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {WORKOUT_ROUTINE.map((exercise, index) => {
                const progress = exerciseProgress[index];
                const isCurrent = index === currentExerciseIndex;
                
                return (
                  <motion.button
                    key={exercise.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { goToExercise(index); setActiveTab('workout'); }}
                    className={`w-full text-left bg-zinc-800/40 backdrop-blur-sm rounded-2xl p-4 border transition-all shadow-lg ${
                      isCurrent 
                        ? 'border-emerald-500/50 bg-emerald-500/5 shadow-emerald-500/10' 
                        : progress.isComplete 
                          ? 'border-zinc-700/30 opacity-60' 
                          : 'border-zinc-700/30 hover:border-zinc-600/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-bold ${
                          progress.isComplete 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : `bg-gradient-to-br ${getSupersetColor(exercise.superset)}`
                        }`}
                        whileHover={{ rotate: 5 }}
                      >
                        {progress.isComplete ? <Check className="w-6 h-6" /> : exercise.id}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{exercise.name}</h3>
                          {exercise.isAMRAP && (
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">AMRAP</span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500">{exercise.sets} sets × {exercise.reps}</p>
                        <div className="flex gap-1 mt-2">
                          {Array.from({ length: exercise.sets }).map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: index * 0.05 + i * 0.05 }}
                              className={`h-1.5 flex-1 rounded-full ${
                                i < progress.completedSets 
                                  ? 'bg-emerald-500' 
                                  : 'bg-zinc-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-500" />
                    </div>
                  </motion.button>
                );
              })}

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-zinc-800/40 backdrop-blur-sm rounded-2xl p-4 border border-zinc-700/30"
              >
                <p className="text-xs text-zinc-500 mb-3">Superset Groups</p>
                <div className="flex gap-3">
                  {['A', 'B', 'C'].map((s, i) => (
                    <motion.div 
                      key={s} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className={`px-3 py-1.5 rounded-lg border text-sm ${getSupersetBg(s)}`}
                    >
                      Superset {s}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="flex gap-2 bg-zinc-800/40 p-1.5 rounded-xl backdrop-blur-sm border border-zinc-700/30">
                {['stopwatch', 'countdown'].map((mode) => (
                  <motion.button
                    key={mode}
                    onClick={() => { setTimerMode(mode); setTimerTime(mode === 'countdown' ? countdownTime : 0); setIsTimerRunning(false); }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all relative ${
                      timerMode === mode ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    {timerMode === mode && (
                      <motion.div
                        layoutId="timerMode"
                        className="absolute inset-0 bg-zinc-700 rounded-lg"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10 capitalize">{mode}</span>
                  </motion.button>
                ))}
              </div>

              <motion.div 
                layout
                className="bg-zinc-800/40 backdrop-blur-sm rounded-3xl p-8 border border-zinc-700/30 text-center shadow-xl"
              >
                <BreathingRing isIdle={!isTimerRunning && timerTime === (timerMode === 'countdown' ? countdownTime : 0)}>
                  <div className="relative inline-flex items-center justify-center mb-8">
                    <svg className="w-56 h-56 transform -rotate-90">
                      <circle
                        cx="112"
                        cy="112"
                        r="104"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-zinc-700"
                      />
                      {timerMode === 'countdown' && (
                        <motion.circle
                          cx="112"
                          cy="112"
                          r="104"
                          stroke="url(#timerGradient)"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 104}
                          animate={{ strokeDashoffset: 2 * Math.PI * 104 * (1 - timerTime / countdownTime) }}
                          transition={{ duration: 0.5 }}
                        />
                      )}
                      <defs>
                        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Timer className="w-6 h-6 text-emerald-400 mb-2" />
                      <span className="text-5xl font-bold tracking-tight tabular-nums">{formatTime(timerTime)}</span>
                      <span className="text-sm text-zinc-500 mt-2">{timerMode === 'stopwatch' ? 'Elapsed' : 'Remaining'}</span>
                    </div>
                  </div>
                </BreathingRing>

                <div className="flex items-center justify-center gap-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerTime(timerMode === 'countdown' ? countdownTime : 0);
                    }}
                    className="w-16 h-16 rounded-2xl bg-zinc-700/50 hover:bg-zinc-600/50 flex items-center justify-center transition-colors shadow-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl transition-all relative overflow-hidden ${
                      isTimerRunning
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
                    }`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ scale: 0, opacity: 0.5 }}
                      whileTap={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ borderRadius: '50%' }}
                    />
                    {isTimerRunning ? <Pause className="w-10 h-10 relative z-10" /> : <Play className="w-10 h-10 ml-1 relative z-10" />}
                  </motion.button>
                  <div className="w-16 h-16" />
                </div>
              </motion.div>

              {timerMode === 'countdown' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-800/40 backdrop-blur-sm rounded-2xl p-4 border border-zinc-700/30"
                >
                  <p className="text-sm text-zinc-400 mb-3">Quick Presets</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 45, 60, 75, 90, 120, 180, 300].map((secs, i) => (
                      <motion.button
                        key={secs}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setCountdownTime(secs);
                          if (!isTimerRunning) setTimerTime(secs);
                        }}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                          countdownTime === secs
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-300'
                        }`}
                      >
                        {secs >= 60 ? `${secs / 60}m` : `${secs}s`}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}