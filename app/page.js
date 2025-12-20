"use client";
import { useState, useEffect, useCallback } from "react";

// Initial workout templates
const defaultWorkoutPlans = {
  workoutA: {
    name: "Workout A",
    emoji: "🔥",
    description: "Chest, Shoulders, Triceps",
    color: "rose",
    defaultRestTime: 90,
    exercises: [
      { id: 1, name: "Incline Bench Press", sets: 3, targetRepsMin: 8, targetRepsMax: 12, weight: 30, equipment: "dumbbell", reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Focus on controlled descent, squeeze at top. Incline targets upper chest." },
      { id: 2, name: "Chest Flyes", sets: 3, targetRepsMin: 8, targetRepsMax: 12, weight: 20, equipment: "dumbbell", reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Keep slight bend in elbows. Stretch at bottom, squeeze chest at top." },
      { id: 3, name: "Seated Overhead Press", sets: 3, targetRepsMin: 8, targetRepsMax: 12, weight: 25, equipment: "dumbbell", reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Keep core tight. Don't lock out elbows at top." },
      { id: 4, name: "Skullcrushers", sets: 3, targetRepsMin: 6, targetRepsMax: 10, weight: 20, equipment: "dumbbell", reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Lower weight to forehead level. Keep elbows stationary." },
      { id: 5, name: "Lateral Raises", sets: 3, targetRepsMin: 8, targetRepsMax: 12, weight: 12, equipment: "dumbbell", reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Lead with elbows, slight forward lean. Control the negative." },
    ],
  },
  workoutB: {
    name: "Workout B",
    emoji: "💪",
    description: "Back, Biceps, Traps, Legs",
    color: "sky",
    defaultRestTime: 90,
    exercises: [
      { id: 101, name: "Rows", sets: 3, targetRepsMin: 8, targetRepsMax: 12, weight: 35, equipment: "dumbbell", reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Pull to hip, squeeze shoulder blade. Keep back flat." },
      { id: 102, name: "Deadlift", sets: 3, targetRepsMin: 8, targetRepsMax: 12, weight: 40, equipment: "dumbbell", reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Hinge at hips, keep back neutral. Drive through heels." },
      { id: 103, name: "Rear Delt Flyes", sets: 3, targetRepsMin: 8, targetRepsMax: 12, weight: 12, equipment: "dumbbell", reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Bend forward, lead with elbows. Squeeze at top." },
      { id: 104, name: "Curls", sets: 3, targetRepsMin: 6, targetRepsMax: 10, weight: 20, equipment: "dumbbell", reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Control the negative. No swinging." },
      { id: 105, name: "Shrugs", sets: 2, targetRepsMin: 10, targetRepsMax: 15, weight: 40, equipment: "dumbbell", reps: Array(2).fill(null), completed: Array(2).fill(false), notes: "Squeeze at top for 1-2 seconds. Straight up and down." },
      { id: 106, name: "Bulgarian Split Squats", sets: 3, targetRepsMin: 8, targetRepsMax: 12, weight: 25, equipment: "dumbbell", reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Rear foot elevated. Keep front knee tracking over toes. Each side." },
    ],
  },
};

// Equipment options
const equipmentOptions = [
  { id: "dumbbell", label: "Dumbbell", emoji: "🏋️", prefix: "DB" },
  { id: "kettlebell", label: "Kettlebell", emoji: "🔔", prefix: "KB" },
];

// Helper to get equipment prefix
const getEquipmentPrefix = (equipment) => {
  const eq = equipmentOptions.find(e => e.id === equipment);
  return eq ? eq.prefix : "DB";
};

// Helper to get full exercise name with equipment prefix
const getFullExerciseName = (exercise) => {
  const prefix = getEquipmentPrefix(exercise.equipment);
  return `${prefix} ${exercise.name}`;
};

// Helper to load from localStorage
const loadFromStorage = (key, defaultValue) => {
  if (typeof window === "undefined") return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Helper to save to localStorage
const saveToStorage = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
};

// Color themes - muted, sophisticated palette
const colorThemes = {
  rose: {
    primary: "bg-rose-900/40",
    primarySolid: "bg-rose-800",
    text: "text-rose-300",
    textMuted: "text-rose-400/70",
    border: "border-rose-800/40",
    gradient: "from-rose-900/50 to-rose-950/30",
    progressBar: "bg-rose-700",
    tabActive: "bg-rose-900/60",
    glow: "bg-rose-900/20",
  },
  sky: {
    primary: "bg-sky-900/40",
    primarySolid: "bg-sky-800",
    text: "text-sky-300",
    textMuted: "text-sky-400/70",
    border: "border-sky-800/40",
    gradient: "from-sky-900/50 to-sky-950/30",
    progressBar: "bg-sky-700",
    tabActive: "bg-sky-900/60",
    glow: "bg-sky-900/20",
  },
};

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("workoutA");
  const [workouts, setWorkouts] = useState(defaultWorkoutPlans);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({
    defaultRestTime: 90,
    autoStartRest: true,
    vibrationEnabled: true,
    soundEnabled: false,
    progressiveOverloadPercent: 5,
  });
  
  // Workout state
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [customRestTime, setCustomRestTime] = useState(90);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  
  // UI state
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProgressiveOverload, setShowProgressiveOverload] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", sets: 3, targetRepsMin: 8, targetRepsMax: 12, weight: 0, equipment: "dumbbell" });
  const [editingReps, setEditingReps] = useState(null);

  const exercises = workouts[activeTab]?.exercises || [];
  const currentWorkout = workouts[activeTab];
  const theme = colorThemes[currentWorkout.color] || colorThemes.rose;

  // Load data from localStorage on mount
  useEffect(() => {
    const savedWorkouts = loadFromStorage("workouts_v4", null);
    const savedHistory = loadFromStorage("workoutHistory_v4", []);
    const savedSettings = loadFromStorage("workoutSettings_v4", settings);
    
    if (savedWorkouts) {
      setWorkouts(savedWorkouts);
    }
    setHistory(savedHistory);
    setSettings(savedSettings);
    setCustomRestTime(savedSettings.defaultRestTime || 90);
    setIsLoaded(true);
  }, []);

  // Save workouts to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage("workouts_v4", workouts);
    }
  }, [workouts, isLoaded]);

  // Save history to localStorage
  useEffect(() => {
    if (isLoaded) {
      saveToStorage("workoutHistory_v4", history);
    }
  }, [history, isLoaded]);

  // Save settings to localStorage
  useEffect(() => {
    if (isLoaded) {
      saveToStorage("workoutSettings_v4", settings);
    }
  }, [settings, isLoaded]);

  // Workout timer
  useEffect(() => {
    let interval;
    if (workoutStarted && !showCongrats) {
      interval = setInterval(() => setWorkoutTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted, showCongrats]);

  // Rest timer
  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => setRestTimer((t) => t - 1), 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
      if (settings.vibrationEnabled && typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer, settings.vibrationEnabled]);

  // Check for workout completion
  useEffect(() => {
    const allComplete = exercises.every((ex) => ex.completed.every((set) => set));
    if (allComplete && exercises.length > 0 && workoutStarted && !showCongrats) {
      completeWorkout();
    }
  }, [exercises, workoutStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatRepsRange = (exercise) => {
    if (exercise.targetRepsMin === exercise.targetRepsMax) {
      return exercise.targetRepsMin;
    }
    return `${exercise.targetRepsMin}-${exercise.targetRepsMax}`;
  };

  const getEquipmentEmoji = (equipment) => {
    const eq = equipmentOptions.find(e => e.id === equipment);
    return eq ? eq.emoji : "🏋️";
  };

  const startRest = useCallback((seconds) => {
    setRestTimer(seconds || customRestTime);
    setIsResting(true);
  }, [customRestTime]);

  const completeWorkout = () => {
    const totalVolume = exercises.reduce((acc, ex) => {
      const completedReps = ex.reps.filter((r, i) => ex.completed[i] && r !== null);
      return acc + completedReps.reduce((sum, reps) => sum + (reps * ex.weight), 0);
    }, 0);

    const totalReps = exercises.reduce((acc, ex) => {
      return acc + ex.reps.filter((r, i) => ex.completed[i] && r !== null).reduce((sum, r) => sum + r, 0);
    }, 0);

    const completedSets = exercises.reduce((acc, ex) => acc + ex.completed.filter(Boolean).length, 0);

    const historyEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      workoutType: activeTab,
      workoutName: currentWorkout.name,
      duration: workoutTime,
      exercises: exercises.map(ex => ({
        name: ex.name,
        displayName: getFullExerciseName(ex),
        equipment: ex.equipment,
        sets: ex.completed.map((completed, i) => ({
          completed,
          reps: ex.reps[i],
          weight: ex.weight,
          targetRepsMin: ex.targetRepsMin,
          targetRepsMax: ex.targetRepsMax
        }))
      })),
      stats: {
        totalVolume,
        totalReps,
        completedSets,
        totalSets: exercises.reduce((acc, ex) => acc + ex.sets, 0)
      }
    };

    setHistory(prev => [historyEntry, ...prev].slice(0, 100));
    setShowCongrats(true);
  };

  const toggleSet = (exerciseId, setIndex, repsCompleted = null) => {
    if (!workoutStarted) setWorkoutStarted(true);
    
    setWorkouts((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        exercises: prev[activeTab].exercises.map((ex) => {
          if (ex.id === exerciseId) {
            const newCompleted = [...ex.completed];
            const newReps = [...ex.reps];
            const wasCompleted = newCompleted[setIndex];
            
            newCompleted[setIndex] = !wasCompleted;
            
            if (!wasCompleted) {
              newReps[setIndex] = repsCompleted !== null ? repsCompleted : ex.targetRepsMax;
            }
            
            return { ...ex, completed: newCompleted, reps: newReps };
          }
          return ex;
        }),
      },
    }));

    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise && !exercise.completed[setIndex] && settings.autoStartRest) {
      startRest(customRestTime);
    }
  };

  const updateReps = (exerciseId, setIndex, reps) => {
    setWorkouts((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        exercises: prev[activeTab].exercises.map((ex) => {
          if (ex.id === exerciseId) {
            const newReps = [...ex.reps];
            newReps[setIndex] = reps;
            return { ...ex, reps: newReps };
          }
          return ex;
        }),
      },
    }));
  };

  const addExercise = () => {
    if (!newExercise.name.trim()) return;
    setWorkouts((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        exercises: [
          ...prev[activeTab].exercises,
          {
            id: Date.now(),
            name: newExercise.name,
            sets: newExercise.sets,
            targetRepsMin: newExercise.targetRepsMin,
            targetRepsMax: newExercise.targetRepsMax,
            weight: newExercise.weight,
            equipment: newExercise.equipment,
            reps: Array(newExercise.sets).fill(null),
            completed: Array(newExercise.sets).fill(false),
          },
        ],
      },
    }));
    setNewExercise({ name: "", sets: 3, targetRepsMin: 8, targetRepsMax: 12, weight: 0, equipment: "dumbbell" });
    setShowAddExercise(false);
  };

  const deleteExercise = (id) => {
    setWorkouts((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        exercises: prev[activeTab].exercises.filter((ex) => ex.id !== id),
      },
    }));
  };

  const updateExercise = (id, updates) => {
    setWorkouts((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        exercises: prev[activeTab].exercises.map((ex) =>
          ex.id === id ? { ...ex, ...updates } : ex
        ),
      },
    }));
  };

  const resetWorkout = () => {
    setWorkouts((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        exercises: prev[activeTab].exercises.map((ex) => ({
          ...ex,
          completed: Array(ex.sets).fill(false),
          reps: Array(ex.sets).fill(null),
        })),
      },
    }));
    setWorkoutStarted(false);
    setWorkoutTime(0);
    setShowCongrats(false);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setWorkoutStarted(false);
    setWorkoutTime(0);
    setShowCongrats(false);
  };

  // Progressive Overload Logic
  const calculateProgressiveOverload = () => {
    const workoutHistory = history.filter(h => h.workoutType === activeTab);
    if (workoutHistory.length < 2) return null;

    const lastWorkout = workoutHistory[0];
    const suggestions = [];

    exercises.forEach(exercise => {
      const lastExerciseData = lastWorkout.exercises.find(e => e.name === exercise.name);
      if (!lastExerciseData) return;

      const lastCompletedSets = lastExerciseData.sets.filter(s => s.completed);
      const allSetsHitTarget = lastCompletedSets.every(s => s.reps >= s.targetRepsMax);
      const avgReps = lastCompletedSets.length > 0 
        ? lastCompletedSets.reduce((sum, s) => sum + (s.reps || 0), 0) / lastCompletedSets.length 
        : 0;

      if (allSetsHitTarget && lastCompletedSets.length === exercise.sets) {
        const increase = Math.max(2.5, exercise.weight * (settings.progressiveOverloadPercent / 100));
        suggestions.push({
          exerciseId: exercise.id,
          exerciseName: getFullExerciseName(exercise),
          type: "weight",
          currentValue: exercise.weight,
          suggestedValue: Math.round((exercise.weight + increase) * 2) / 2,
          reason: `Hit ${exercise.targetRepsMax} reps on all ${exercise.sets} sets`
        });
      } else if (avgReps < exercise.targetRepsMin * 0.8) {
        suggestions.push({
          exerciseId: exercise.id,
          exerciseName: getFullExerciseName(exercise),
          type: "deload",
          currentValue: exercise.weight,
          suggestedValue: Math.round(exercise.weight * 0.9 * 2) / 2,
          reason: `Avg ${Math.round(avgReps)} reps vs target ${exercise.targetRepsMin}-${exercise.targetRepsMax}`
        });
      }
    });

    return suggestions;
  };

  const applyProgressiveOverload = (suggestion) => {
    if (suggestion.type === "weight" || suggestion.type === "deload") {
      updateExercise(suggestion.exerciseId, { weight: suggestion.suggestedValue });
    } else if (suggestion.type === "reps") {
      updateExercise(suggestion.exerciseId, { targetRepsMax: suggestion.suggestedValue });
    }
  };

  const completedSets = exercises.reduce((acc, ex) => acc + ex.completed.filter(Boolean).length, 0);
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const progressiveSuggestions = calculateProgressiveOverload();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-zinc-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 overflow-x-hidden">
      {/* Congrats Modal */}
      {showCongrats && (
        <CongratsModal 
          workout={currentWorkout}
          workoutTime={workoutTime}
          exercises={exercises}
          totalSets={totalSets}
          formatTime={formatTime}
          onClose={resetWorkout}
          history={history}
          activeTab={activeTab}
          getFullExerciseName={getFullExerciseName}
        />
      )}

      {/* Rest Timer Overlay */}
      {isResting && (
        <RestTimerOverlay 
          restTimer={restTimer}
          onSkip={() => setIsResting(false)}
          customRestTime={customRestTime}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <HistoryModal 
          history={history}
          onClose={() => setShowHistory(false)}
          formatTime={formatTime}
          formatDate={formatDate}
          onClearHistory={() => setHistory([])}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          settings={settings}
          setSettings={setSettings}
          customRestTime={customRestTime}
          setCustomRestTime={setCustomRestTime}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Progressive Overload Modal */}
      {showProgressiveOverload && progressiveSuggestions && (
        <ProgressiveOverloadModal 
          suggestions={progressiveSuggestions}
          onApply={applyProgressiveOverload}
          onClose={() => setShowProgressiveOverload(false)}
          theme={theme}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl border-b border-zinc-900" />
        <div className="relative max-w-2xl mx-auto px-4 py-4">
          {/* Top Row */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-zinc-600 uppercase tracking-widest mb-1">Workout Tracker</p>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <span className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                  {currentWorkout.emoji}
                </span>
                <span className="text-zinc-100">
                  {currentWorkout.name}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all text-zinc-400 hover:text-zinc-200"
                title="History"
              >
                📊
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all text-zinc-400 hover:text-zinc-200"
                title="Settings"
              >
                ⚙️
              </button>
              {workoutStarted && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 ml-2">
                  <p className="text-xl font-mono font-medium text-zinc-200">{formatTime(workoutTime)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 mb-4">
            {Object.entries(workouts).map(([key, workout]) => {
              const tabTheme = colorThemes[workout.color] || colorThemes.rose;
              return (
                <button
                  key={key}
                  onClick={() => switchTab(key)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === key
                      ? `${tabTheme.tabActive} ${tabTheme.text} border ${tabTheme.border}`
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                  }`}
                >
                  <span className="mr-2">{workout.emoji}</span>
                  {workout.name}
                </button>
              );
            })}
          </div>

          {/* Progress Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-zinc-500">{currentWorkout.description}</span>
              <span className="text-sm font-mono text-zinc-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${theme.progressBar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-zinc-600">{completedSets} of {totalSets} sets</span>
              <span className="text-xs text-zinc-600">{exercises.length} exercises</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-2xl mx-auto px-4 py-6">
        {/* Progressive Overload Alert */}
        {progressiveSuggestions && progressiveSuggestions.length > 0 && !workoutStarted && (
          <section className="mb-6">
            <button
              onClick={() => setShowProgressiveOverload(true)}
              className={`w-full relative overflow-hidden rounded-xl p-4 border transition-all hover:border-zinc-600 bg-zinc-900 border-zinc-800`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <span className="text-lg">📈</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-zinc-200">
                    Progressive Overload Available
                  </p>
                  <p className="text-sm text-zinc-500">
                    {progressiveSuggestions.length} suggestion{progressiveSuggestions.length > 1 ? "s" : ""} based on your last workout
                  </p>
                </div>
                <div className="ml-auto text-zinc-600">→</div>
              </div>
            </button>
          </section>
        )}

        {/* Rest Timer Controls */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
                <span className="text-sm">⏱️</span>
              </div>
              <p className="text-sm font-medium text-zinc-400">Rest Timer</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customRestTime}
                onChange={(e) => setCustomRestTime(Math.max(5, parseInt(e.target.value) || 60))}
                className="w-16 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-sm text-center text-zinc-300 focus:outline-none focus:border-zinc-600"
              />
              <span className="text-xs text-zinc-600">sec</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[30, 60, 90, 120, 180].map((seconds) => (
              <button
                key={seconds}
                onClick={() => {
                  setCustomRestTime(seconds);
                  startRest(seconds);
                }}
                className={`py-3 rounded-lg font-medium transition-all duration-200 ${
                  customRestTime === seconds 
                    ? `${theme.primary} ${theme.text} border ${theme.border}`
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                {seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m${seconds % 60 ? seconds % 60 : ""}`}
              </button>
            ))}
          </div>
          {settings.autoStartRest && (
            <p className="text-xs text-zinc-700 mt-2 text-center">
              Timer auto-starts after completing a set
            </p>
          )}
        </section>

        {/* Exercise List */}
        <section className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
              <span className="text-sm">📋</span>
            </div>
            <p className="text-sm font-medium text-zinc-400">Exercises</p>
          </div>
          
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              onToggleSet={toggleSet}
              onDelete={deleteExercise}
              onUpdateExercise={updateExercise}
              onUpdateReps={updateReps}
              editingReps={editingReps}
              setEditingReps={setEditingReps}
              formatRepsRange={formatRepsRange}
              getEquipmentEmoji={getEquipmentEmoji}
              getFullExerciseName={getFullExerciseName}
              equipmentOptions={equipmentOptions}
              theme={theme}
            />
          ))}
        </section>

        {/* Add Exercise */}
        {showAddExercise ? (
          <div className="mt-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="font-medium mb-4 flex items-center gap-2 text-zinc-200">
              <span className="w-6 h-6 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-400">+</span>
              Add New Exercise
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Exercise name (without DB/KB prefix)"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-500 transition-all placeholder-zinc-600 text-zinc-200"
              />
              
              {/* Equipment Selection */}
              <div>
                <label className="text-xs text-zinc-600 block mb-2 uppercase tracking-wider">Equipment</label>
                <div className="flex gap-2">
                  {equipmentOptions.map((eq) => (
                    <button
                      key={eq.id}
                      onClick={() => setNewExercise({ ...newExercise, equipment: eq.id })}
                      className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        newExercise.equipment === eq.id
                          ? `${theme.primary} ${theme.text} border ${theme.border}`
                          : "bg-zinc-800 border border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      <span>{eq.emoji}</span>
                      <span className="text-sm">{eq.prefix}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-zinc-600 block mb-2 uppercase tracking-wider">Sets</label>
                  <input
                    type="number"
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-center focus:outline-none focus:border-zinc-500 transition-all text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-600 block mb-2 uppercase tracking-wider">Min Reps</label>
                  <input
                    type="number"
                    value={newExercise.targetRepsMin}
                    onChange={(e) => setNewExercise({ ...newExercise, targetRepsMin: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-center focus:outline-none focus:border-zinc-500 transition-all text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-600 block mb-2 uppercase tracking-wider">Max Reps</label>
                  <input
                    type="number"
                    value={newExercise.targetRepsMax}
                    onChange={(e) => setNewExercise({ ...newExercise, targetRepsMax: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-center focus:outline-none focus:border-zinc-500 transition-all text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-600 block mb-2 uppercase tracking-wider">Weight</label>
                  <input
                    type="number"
                    value={newExercise.weight}
                    onChange={(e) => setNewExercise({ ...newExercise, weight: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-3 text-center focus:outline-none focus:border-zinc-500 transition-all text-zinc-200"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddExercise(false)}
                  className="flex-1 py-3 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-all text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  onClick={addExercise}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${theme.primarySolid} text-white hover:opacity-90`}
                >
                  Add Exercise
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full mt-4 py-5 border border-dashed border-zinc-800 rounded-xl text-zinc-600 hover:border-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="w-6 h-6 border border-current rounded-lg flex items-center justify-center text-sm">+</span>
            Add Exercise
          </button>
        )}

        {/* Reset Button */}
        {workoutStarted && (
          <button
            onClick={resetWorkout}
            className="w-full mt-6 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all duration-200"
          >
            Reset Workout
          </button>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-zinc-900 px-4 py-8 mt-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-zinc-800 text-sm">Built for gains. No excuses.</p>
        </div>
      </footer>
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ 
  exercise, 
  index, 
  onToggleSet, 
  onDelete, 
  onUpdateExercise,
  onUpdateReps,
  editingReps,
  setEditingReps,
  formatRepsRange,
  getEquipmentEmoji,
  getFullExerciseName,
  equipmentOptions,
  theme
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [tempWeight, setTempWeight] = useState(exercise.weight);
  const [tempTargetRepsMin, setTempTargetRepsMin] = useState(exercise.targetRepsMin);
  const [tempTargetRepsMax, setTempTargetRepsMax] = useState(exercise.targetRepsMax);
  const [tempEquipment, setTempEquipment] = useState(exercise.equipment);
  
  const completedCount = exercise.completed.filter(Boolean).length;
  const isComplete = completedCount === exercise.sets;

  const handleRepsClick = (setIndex) => {
    if (exercise.completed[setIndex]) {
      setEditingReps({ exerciseId: exercise.id, setIndex });
    }
  };

  const handleRepsChange = (setIndex, value) => {
    onUpdateReps(exercise.id, setIndex, parseInt(value) || 0);
  };

  return (
    <div
      className={`group relative bg-zinc-900 border rounded-xl p-5 transition-all duration-200 ${
        isComplete ? `${theme.border} ${theme.glow}` : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      {/* Exercise Number Badge */}
      <div className={`absolute -left-2 -top-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
        isComplete 
          ? `${theme.primarySolid} text-white` 
          : "bg-zinc-800 text-zinc-500 border border-zinc-700"
      }`}>
        {index + 1}
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 pl-4">
          {isComplete && (
            <div className={`w-6 h-6 rounded-full ${theme.primarySolid} flex items-center justify-center`}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <div>
            <h3 className={`font-medium text-lg ${isComplete ? theme.text : "text-zinc-200"}`}>
              {getFullExerciseName(exercise)}
            </h3>
            <p className="text-sm text-zinc-500 flex items-center gap-2">
              <span>{getEquipmentEmoji(exercise.equipment)}</span>
              <span>{exercise.sets} × {formatRepsRange(exercise)} reps</span>
              {exercise.weight > 0 && <span>@ {exercise.weight} lbs</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex flex-col gap-2 bg-zinc-800 rounded-lg p-3 border border-zinc-700">
              {/* Equipment Toggle */}
              <div className="flex gap-1">
                {equipmentOptions.map((eq) => (
                  <button
                    key={eq.id}
                    onClick={() => setTempEquipment(eq.id)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all flex items-center gap-1 ${
                      tempEquipment === eq.id
                        ? `${theme.primary} ${theme.text}`
                        : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                    }`}
                    title={eq.label}
                  >
                    <span>{eq.emoji}</span>
                    <span className="text-xs">{eq.prefix}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-zinc-500 mb-1">Weight</span>
                  <input
                    type="number"
                    value={tempWeight}
                    onChange={(e) => setTempWeight(parseInt(e.target.value) || 0)}
                    className="w-14 bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1 text-sm text-center text-zinc-200"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-zinc-500 mb-1">Reps</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={tempTargetRepsMin}
                      onChange={(e) => setTempTargetRepsMin(parseInt(e.target.value) || 1)}
                      className="w-10 bg-zinc-700 border border-zinc-600 rounded-lg px-1 py-1 text-sm text-center text-zinc-200"
                    />
                    <span className="text-zinc-600">-</span>
                    <input
                      type="number"
                      value={tempTargetRepsMax}
                      onChange={(e) => setTempTargetRepsMax(parseInt(e.target.value) || 1)}
                      className="w-10 bg-zinc-700 border border-zinc-600 rounded-lg px-1 py-1 text-sm text-center text-zinc-200"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    onUpdateExercise(exercise.id, { 
                      weight: tempWeight, 
                      targetRepsMin: tempTargetRepsMin,
                      targetRepsMax: tempTargetRepsMax,
                      equipment: tempEquipment
                    });
                    setIsEditing(false);
                  }}
                  className={`${theme.text} px-2 py-1 text-xl`}
                >
                  ✓
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setTempWeight(exercise.weight);
                  setTempTargetRepsMin(exercise.targetRepsMin);
                  setTempTargetRepsMax(exercise.targetRepsMax);
                  setTempEquipment(exercise.equipment);
                  setIsEditing(true);
                }}
                className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300 transition-all flex items-center justify-center border border-zinc-700"
                title="Edit exercise"
              >
                ✏️
              </button>
              {exercise.notes && (
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className={`w-8 h-8 rounded-lg text-sm transition-all flex items-center justify-center border ${
                    showNotes 
                      ? `${theme.primary} ${theme.text} ${theme.border}` 
                      : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  ?
                </button>
              )}
              <button
                onClick={() => onDelete(exercise.id)}
                className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-600 hover:bg-zinc-700 hover:text-red-400 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 border border-zinc-700"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      {showNotes && exercise.notes && (
        <div className="mb-4 bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
          <p className="text-sm text-zinc-400 leading-relaxed">{exercise.notes}</p>
        </div>
      )}

      {/* Set Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {exercise.completed.map((isSetComplete, setIndex) => (
          <div key={setIndex} className="relative">
            <button
              onClick={() => onToggleSet(exercise.id, setIndex)}
              className={`w-full py-4 rounded-lg font-medium transition-all duration-200 ${
                isSetComplete 
                  ? `${theme.primarySolid} text-white` 
                  : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400"
              }`}
            >
              {isSetComplete ? (
                <div className="flex flex-col items-center">
                  <span className="text-lg">✓</span>
                  <span className="text-xs opacity-80">
                    {exercise.reps[setIndex] || exercise.targetRepsMax}
                  </span>
                </div>
              ) : (
                <span>Set {setIndex + 1}</span>
              )}
            </button>
            
            {/* Edit reps overlay */}
            {isSetComplete && editingReps?.exerciseId === exercise.id && editingReps?.setIndex === setIndex && (
              <div className="absolute inset-0 bg-zinc-800 rounded-lg p-2 flex flex-col items-center justify-center z-10 border border-zinc-600">
                <input
                  type="number"
                  value={exercise.reps[setIndex] || ""}
                  onChange={(e) => handleRepsChange(setIndex, e.target.value)}
                  className="w-12 bg-zinc-700 rounded px-1 py-0.5 text-center text-sm mb-1 text-zinc-200"
                  autoFocus
                />
                <button
                  onClick={() => setEditingReps(null)}
                  className="text-xs text-zinc-500"
                >
                  Done
                </button>
              </div>
            )}
            
            {/* Tap to edit hint */}
            {isSetComplete && !editingReps && (
              <button
                onClick={() => handleRepsClick(setIndex)}
                className="absolute bottom-1 right-1 text-xs opacity-0 group-hover:opacity-50 transition-opacity text-zinc-500"
              >
                tap
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Rest Timer Overlay Component
function RestTimerOverlay({ restTimer, onSkip, customRestTime }) {
  const progress = ((customRestTime - restTimer) / customRestTime) * 100;
  
  return (
    <div className="fixed inset-0 bg-black/98 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="text-center">
        <div className="relative w-56 h-56 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="100"
              stroke="#27272a"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="112"
              cy="112"
              r="100"
              stroke="#52525b"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={628}
              strokeDashoffset={628 - (628 * progress) / 100}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-6xl font-bold font-mono text-zinc-200">{restTimer}</p>
            <p className="text-zinc-600 text-sm uppercase tracking-widest mt-1">seconds</p>
          </div>
        </div>
        
        <p className="text-zinc-500 mb-8 text-lg">Rest & Recover</p>
        <button
          onClick={onSkip}
          className="px-8 py-3 bg-zinc-900 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-all text-zinc-400 hover:text-zinc-200"
        >
          Skip Rest →
        </button>
      </div>
    </div>
  );
}

// Congrats Modal Component
function CongratsModal({ workout, workoutTime, exercises, totalSets, formatTime, onClose, history, activeTab, getFullExerciseName }) {
  const totalVolume = exercises.reduce((acc, ex) => {
    const completedReps = ex.reps.filter((r, i) => ex.completed[i] && r !== null);
    return acc + completedReps.reduce((sum, reps) => sum + (reps * ex.weight), 0);
  }, 0);

  const totalReps = exercises.reduce((acc, ex) => {
    return acc + ex.reps.filter((r, i) => ex.completed[i] && r !== null).reduce((sum, r) => sum + r, 0);
  }, 0);

  const lastWorkout = history.filter(h => h.workoutType === activeTab)[1];
  let volumeChange = null;
  if (lastWorkout?.stats?.totalVolume && totalVolume > 0) {
    volumeChange = ((totalVolume - lastWorkout.stats.totalVolume) / lastWorkout.stats.totalVolume * 100).toFixed(1);
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
          <span className="text-4xl">🏆</span>
        </div>
        <h2 className="text-3xl font-bold mb-2 text-zinc-100">
          Workout Complete!
        </h2>
        <p className="text-zinc-500 mb-8">
          You crushed {workout.name} in {formatTime(workoutTime)}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
            <p className="text-3xl font-bold text-zinc-200">{totalSets}</p>
            <p className="text-zinc-500 text-sm">Sets</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
            <p className="text-3xl font-bold text-zinc-200">{totalReps}</p>
            <p className="text-zinc-500 text-sm">Total Reps</p>
          </div>
        </div>

        {totalVolume > 0 && (
          <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 mb-6">
            <p className="text-3xl font-bold text-zinc-200">{totalVolume.toLocaleString()} lbs</p>
            <p className="text-zinc-500 text-sm">Total Volume</p>
            {volumeChange && (
              <p className={`text-sm mt-1 ${parseFloat(volumeChange) >= 0 ? "text-zinc-400" : "text-zinc-500"}`}>
                {parseFloat(volumeChange) >= 0 ? "↑" : "↓"} {Math.abs(parseFloat(volumeChange))}% vs last workout
              </p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-zinc-100 text-zinc-900 font-semibold py-4 rounded-xl hover:bg-white transition-all"
        >
          Start New Workout
        </button>
      </div>
    </div>
  );
}

// History Modal Component
function HistoryModal({ history, onClose, formatTime, formatDate, onClearHistory }) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Workout History</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-all text-zinc-400"
          >
            ✕
          </button>
        </div>

        {selectedWorkout ? (
          <div className="overflow-y-auto max-h-[60vh]">
            <button
              onClick={() => setSelectedWorkout(null)}
              className="text-sm text-zinc-500 hover:text-zinc-300 mb-4 flex items-center gap-2"
            >
              ← Back to history
            </button>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-zinc-200">{selectedWorkout.workoutName}</h3>
                <span className="text-zinc-500 text-sm">{formatTime(selectedWorkout.duration)}</span>
              </div>
              <p className="text-zinc-600 text-sm">{formatDate(selectedWorkout.date)}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-zinc-800 rounded-xl p-3 text-center border border-zinc-700">
                  <p className="text-lg font-bold text-zinc-200">{selectedWorkout.stats.completedSets}</p>
                  <p className="text-xs text-zinc-500">Sets</p>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center border border-zinc-700">
                  <p className="text-lg font-bold text-zinc-200">{selectedWorkout.stats.totalReps}</p>
                  <p className="text-xs text-zinc-500">Reps</p>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center border border-zinc-700">
                  <p className="text-lg font-bold text-zinc-200">{selectedWorkout.stats.totalVolume}</p>
                  <p className="text-xs text-zinc-500">Volume</p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedWorkout.exercises.map((ex, i) => (
                  <div key={i} className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
                    <h4 className="font-medium mb-2 text-zinc-300">{ex.displayName || ex.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {ex.sets.map((set, j) => (
                        <div
                          key={j}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            set.completed
                              ? "bg-zinc-700 text-zinc-300"
                              : "bg-zinc-800 text-zinc-600"
                          }`}
                        >
                          {set.completed ? `${set.reps} reps${set.weight > 0 ? ` @ ${set.weight}lb` : ""}` : "Skipped"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto max-h-[50vh] space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-12 text-zinc-600">
                  <p className="text-4xl mb-4">📊</p>
                  <p>No workout history yet</p>
                  <p className="text-sm">Complete a workout to see it here</p>
                </div>
              ) : (
                history.map((workout) => (
                  <button
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                    className="w-full bg-zinc-800/30 hover:bg-zinc-800/60 rounded-xl p-4 text-left transition-all border border-zinc-800 hover:border-zinc-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-zinc-300">{workout.workoutName}</h4>
                        <p className="text-sm text-zinc-600">{formatDate(workout.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-zinc-400">{formatTime(workout.duration)}</p>
                        <p className="text-xs text-zinc-600">{workout.stats.completedSets} sets</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear all history?")) {
                    onClearHistory();
                  }
                }}
                className="w-full mt-4 py-3 border border-zinc-800 rounded-xl text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400 transition-all"
              >
                Clear All History
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Settings Modal Component
function SettingsModal({ settings, setSettings, customRestTime, setCustomRestTime, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-all text-zinc-400"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Default Rest Time */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Default Rest Time
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={customRestTime}
                onChange={(e) => {
                  setCustomRestTime(parseInt(e.target.value));
                  setSettings(s => ({ ...s, defaultRestTime: parseInt(e.target.value) }));
                }}
                className="flex-1 accent-zinc-500"
              />
              <span className="w-16 text-center font-mono text-zinc-300">{customRestTime}s</span>
            </div>
          </div>

          {/* Auto-start Rest */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-zinc-300">Auto-start Rest Timer</p>
              <p className="text-sm text-zinc-600">Start timer after completing a set</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, autoStartRest: !s.autoStartRest }))}
              className={`w-14 h-8 rounded-full transition-all ${
                settings.autoStartRest ? "bg-zinc-500" : "bg-zinc-700"
              }`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                settings.autoStartRest ? "translate-x-7" : "translate-x-1"
              }`} />
            </button>
          </div>

          {/* Vibration */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-zinc-300">Vibration</p>
              <p className="text-sm text-zinc-600">Vibrate when rest timer ends</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, vibrationEnabled: !s.vibrationEnabled }))}
              className={`w-14 h-8 rounded-full transition-all ${
                settings.vibrationEnabled ? "bg-zinc-500" : "bg-zinc-700"
              }`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                settings.vibrationEnabled ? "translate-x-7" : "translate-x-1"
              }`} />
            </button>
          </div>

          {/* Progressive Overload % */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Progressive Overload Increment
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="2.5"
                max="10"
                step="2.5"
                value={settings.progressiveOverloadPercent}
                onChange={(e) => setSettings(s => ({ ...s, progressiveOverloadPercent: parseFloat(e.target.value) }))}
                className="flex-1 accent-zinc-500"
              />
              <span className="w-16 text-center font-mono text-zinc-300">{settings.progressiveOverloadPercent}%</span>
            </div>
            <p className="text-xs text-zinc-600 mt-1">Weight increase when you hit all target reps</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all font-medium text-zinc-300"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// Progressive Overload Modal Component
function ProgressiveOverloadModal({ suggestions, onApply, onClose, theme }) {
  const [applied, setApplied] = useState(new Set());

  const handleApply = (suggestion) => {
    onApply(suggestion);
    setApplied(prev => new Set([...prev, suggestion.exerciseId]));
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-zinc-100">
            <span className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700">
              📈
            </span>
            Progressive Overload
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-all text-zinc-400"
          >
            ✕
          </button>
        </div>
        
        <p className="text-zinc-500 text-sm mb-6">
          Based on your last workout performance, here are suggested adjustments:
        </p>

        <div className="overflow-y-auto max-h-[50vh] space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.exerciseId}
              className={`bg-zinc-800/50 rounded-xl p-4 border ${
                applied.has(suggestion.exerciseId) ? "border-zinc-600" : "border-zinc-700"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-zinc-300">{suggestion.exerciseName}</h4>
                {suggestion.type === "deload" ? (
                  <span className="text-xs px-2 py-1 bg-zinc-700 text-zinc-400 rounded-lg">
                    Deload
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-zinc-700 text-zinc-300 rounded-lg">
                    Increase
                  </span>
                )}
              </div>
              
              <p className="text-sm text-zinc-600 mb-3">{suggestion.reason}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">
                    {suggestion.type === "reps" ? `${suggestion.currentValue} reps` : `${suggestion.currentValue} lbs`}
                  </span>
                  <span className="text-zinc-700">→</span>
                  <span className="text-zinc-300">
                    {suggestion.type === "reps" ? `${suggestion.suggestedValue} reps` : `${suggestion.suggestedValue} lbs`}
                  </span>
                </div>
                
                {applied.has(suggestion.exerciseId) ? (
                  <span className="text-zinc-400 text-sm">✓ Applied</span>
                ) : (
                  <button
                    onClick={() => handleApply(suggestion)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-700 text-zinc-200 hover:bg-zinc-600 transition-all"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all font-medium text-zinc-300"
          >
            {applied.size > 0 ? "Done" : "Skip for Now"}
          </button>
          {applied.size === 0 && suggestions.length > 1 && (
            <button
              onClick={() => {
                suggestions.forEach(s => handleApply(s));
              }}
              className="flex-1 py-3 rounded-xl font-medium bg-zinc-700 text-zinc-100 hover:bg-zinc-600 transition-all"
            >
              Apply All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}