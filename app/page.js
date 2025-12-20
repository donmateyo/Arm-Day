"use client";
import { useState, useEffect, useCallback } from "react";

// Initial workout templates
const defaultWorkoutPlans = {
  arms: {
    name: "Arm Day",
    emoji: "💪",
    description: "Biceps & Triceps Focus",
    color: "orange",
    defaultRestTime: 90,
    exercises: [
      { id: 1, name: "Bicep Curls", sets: 4, targetReps: 12, weight: 25, reps: Array(4).fill(null), completed: Array(4).fill(false) },
      { id: 2, name: "Hammer Curls", sets: 3, targetReps: 12, weight: 20, reps: Array(3).fill(null), completed: Array(3).fill(false) },
      { id: 3, name: "Tricep Pushdowns", sets: 4, targetReps: 15, weight: 40, reps: Array(4).fill(null), completed: Array(4).fill(false) },
      { id: 4, name: "Skull Crushers", sets: 3, targetReps: 10, weight: 30, reps: Array(3).fill(null), completed: Array(3).fill(false) },
      { id: 5, name: "Concentration Curls", sets: 3, targetReps: 10, weight: 15, reps: Array(3).fill(null), completed: Array(3).fill(false) },
    ],
  },
  fullbody: {
    name: "Full Body",
    emoji: "🏋️",
    description: "Compound Movements • 3x/Week",
    color: "emerald",
    defaultRestTime: 60,
    exercises: [
      { id: 101, name: "Push-Ups", sets: 3, targetReps: 15, weight: 0, reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Chest, shoulders, triceps. Gold standard upper body push." },
      { id: 102, name: "Pull-Ups / Inverted Rows", sets: 3, targetReps: 8, weight: 0, reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Back, biceps. Best bodyweight pull movement." },
      { id: 103, name: "Bodyweight Squats", sets: 3, targetReps: 20, weight: 0, reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Quads, glutes. Foundation of leg strength." },
      { id: 104, name: "Lunges", sets: 3, targetReps: 10, weight: 0, reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Unilateral leg work. Fixes imbalances." },
      { id: 105, name: "Glute Bridges", sets: 3, targetReps: 20, weight: 0, reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Glutes, hamstrings. Crucial for hip health." },
      { id: 106, name: "Plank", sets: 3, targetReps: 45, weight: 0, reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Core stability. Hold for seconds instead of reps." },
      { id: 107, name: "Dead Bug", sets: 3, targetReps: 10, weight: 0, reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Deep core activation. Each side counts as 1." },
      { id: 108, name: "Pike Push-Ups", sets: 3, targetReps: 10, weight: 0, reps: Array(3).fill(null), completed: Array(3).fill(false), notes: "Shoulders. Progress toward handstand push-ups." },
    ],
  },
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

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("fullbody");
  const [workouts, setWorkouts] = useState(defaultWorkoutPlans);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({
    defaultRestTime: 60,
    autoStartRest: true,
    vibrationEnabled: true,
    soundEnabled: false,
    progressiveOverloadPercent: 5,
  });
  
  // Workout state
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [customRestTime, setCustomRestTime] = useState(60);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  
  // UI state
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProgressiveOverload, setShowProgressiveOverload] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", sets: 3, targetReps: 10, weight: 0 });
  const [editingReps, setEditingReps] = useState(null); // {exerciseId, setIndex}

  const exercises = workouts[activeTab]?.exercises || [];
  const currentWorkout = workouts[activeTab];

  // Load data from localStorage on mount
  useEffect(() => {
    const savedWorkouts = loadFromStorage("workouts", null);
    const savedHistory = loadFromStorage("workoutHistory", []);
    const savedSettings = loadFromStorage("workoutSettings", settings);
    
    if (savedWorkouts) {
      setWorkouts(savedWorkouts);
    }
    setHistory(savedHistory);
    setSettings(savedSettings);
    setCustomRestTime(savedSettings.defaultRestTime || 60);
    setIsLoaded(true);
  }, []);

  // Save workouts to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      saveToStorage("workouts", workouts);
    }
  }, [workouts, isLoaded]);

  // Save history to localStorage
  useEffect(() => {
    if (isLoaded) {
      saveToStorage("workoutHistory", history);
    }
  }, [history, isLoaded]);

  // Save settings to localStorage
  useEffect(() => {
    if (isLoaded) {
      saveToStorage("workoutSettings", settings);
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

  const startRest = useCallback((seconds) => {
    setRestTimer(seconds || customRestTime);
    setIsResting(true);
  }, [customRestTime]);

  const completeWorkout = () => {
    // Calculate stats
    const totalVolume = exercises.reduce((acc, ex) => {
      const completedReps = ex.reps.filter((r, i) => ex.completed[i] && r !== null);
      return acc + completedReps.reduce((sum, reps) => sum + (reps * ex.weight), 0);
    }, 0);

    const totalReps = exercises.reduce((acc, ex) => {
      return acc + ex.reps.filter((r, i) => ex.completed[i] && r !== null).reduce((sum, r) => sum + r, 0);
    }, 0);

    const completedSets = exercises.reduce((acc, ex) => acc + ex.completed.filter(Boolean).length, 0);

    // Create history entry
    const historyEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      workoutType: activeTab,
      workoutName: currentWorkout.name,
      duration: workoutTime,
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: ex.completed.map((completed, i) => ({
          completed,
          reps: ex.reps[i],
          weight: ex.weight,
          targetReps: ex.targetReps
        }))
      })),
      stats: {
        totalVolume,
        totalReps,
        completedSets,
        totalSets: exercises.reduce((acc, ex) => acc + ex.sets, 0)
      }
    };

    setHistory(prev => [historyEntry, ...prev].slice(0, 100)); // Keep last 100 workouts
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
              // If completing, set reps to provided value or target
              newReps[setIndex] = repsCompleted !== null ? repsCompleted : ex.targetReps;
            }
            
            return { ...ex, completed: newCompleted, reps: newReps };
          }
          return ex;
        }),
      },
    }));

    // Auto-start rest timer if enabled and completing a set
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
            targetReps: newExercise.targetReps,
            weight: newExercise.weight,
            reps: Array(newExercise.sets).fill(null),
            completed: Array(newExercise.sets).fill(false),
          },
        ],
      },
    }));
    setNewExercise({ name: "", sets: 3, targetReps: 10, weight: 0 });
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
      const allSetsHitTarget = lastCompletedSets.every(s => s.reps >= s.targetReps);
      const avgReps = lastCompletedSets.length > 0 
        ? lastCompletedSets.reduce((sum, s) => sum + (s.reps || 0), 0) / lastCompletedSets.length 
        : 0;

      if (allSetsHitTarget && lastCompletedSets.length === exercise.sets) {
        if (exercise.weight > 0) {
          // Suggest weight increase
          const increase = Math.max(2.5, exercise.weight * (settings.progressiveOverloadPercent / 100));
          suggestions.push({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            type: "weight",
            currentValue: exercise.weight,
            suggestedValue: Math.round((exercise.weight + increase) * 2) / 2, // Round to nearest 0.5
            reason: `Hit all ${exercise.sets}×${exercise.targetReps} last session`
          });
        } else {
          // Bodyweight - suggest rep increase
          suggestions.push({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            type: "reps",
            currentValue: exercise.targetReps,
            suggestedValue: exercise.targetReps + 2,
            reason: `Completed all sets at ${exercise.targetReps} reps`
          });
        }
      } else if (avgReps < exercise.targetReps * 0.7) {
        // Struggling - suggest deload
        if (exercise.weight > 0) {
          suggestions.push({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            type: "deload",
            currentValue: exercise.weight,
            suggestedValue: Math.round(exercise.weight * 0.9 * 2) / 2,
            reason: `Avg ${Math.round(avgReps)} reps vs target ${exercise.targetReps}`
          });
        }
      }
    });

    return suggestions;
  };

  const applyProgressiveOverload = (suggestion) => {
    if (suggestion.type === "weight" || suggestion.type === "deload") {
      updateExercise(suggestion.exerciseId, { weight: suggestion.suggestedValue });
    } else if (suggestion.type === "reps") {
      updateExercise(suggestion.exerciseId, { targetReps: suggestion.suggestedValue });
    }
  };

  const completedSets = exercises.reduce((acc, ex) => acc + ex.completed.filter(Boolean).length, 0);
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const progressiveSuggestions = calculateProgressiveOverload();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 opacity-30 blur-3xl ${
          activeTab === "arms" 
            ? "bg-gradient-to-b from-orange-600 to-transparent" 
            : "bg-gradient-to-b from-emerald-600 to-transparent"
        }`} />
      </div>

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
          accentColor={activeTab === "arms" ? "orange" : "emerald"}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
        <div className="relative max-w-2xl mx-auto px-4 py-4">
          {/* Top Row */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Workout Tracker</p>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center border border-zinc-700/50 shadow-lg">
                  {currentWorkout.emoji}
                </span>
                <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  {currentWorkout.name}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="w-10 h-10 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all"
                title="History"
              >
                📊
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-800 transition-all"
                title="Settings"
              >
                ⚙️
              </button>
              {workoutStarted ? (
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl px-4 py-2 ml-2">
                  <p className="text-xl font-mono font-bold tracking-tight">{formatTime(workoutTime)}</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800/50 mb-4">
            {Object.entries(workouts).map(([key, workout]) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === key
                    ? `bg-gradient-to-r ${key === "arms" ? "from-orange-500 to-amber-500" : "from-emerald-500 to-green-500"} text-white shadow-lg`
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <span className="mr-2">{workout.emoji}</span>
                {workout.name}
              </button>
            ))}
          </div>

          {/* Progress Section */}
          <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800/50 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-zinc-400">{currentWorkout.description}</span>
              <span className="text-sm font-mono font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  activeTab === "arms"
                    ? "bg-gradient-to-r from-orange-500 to-amber-400"
                    : "bg-gradient-to-r from-emerald-500 to-green-400"
                }`}
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
              className={`w-full relative overflow-hidden rounded-2xl p-4 border transition-all hover:scale-[1.02] ${
                activeTab === "arms" 
                  ? "bg-gradient-to-r from-orange-950/50 to-amber-950/30 border-orange-800/30 hover:border-orange-700/50" 
                  : "bg-gradient-to-r from-emerald-950/50 to-green-950/30 border-emerald-800/30 hover:border-emerald-700/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeTab === "arms" ? "bg-orange-500/20" : "bg-emerald-500/20"
                }`}>
                  <span className="text-xl">📈</span>
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${activeTab === "arms" ? "text-orange-400" : "text-emerald-400"}`}>
                    Progressive Overload Available
                  </p>
                  <p className="text-sm text-zinc-400">
                    {progressiveSuggestions.length} suggestion{progressiveSuggestions.length > 1 ? "s" : ""} based on your last workout
                  </p>
                </div>
                <div className="ml-auto text-zinc-500">→</div>
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
              <p className="text-sm font-medium text-zinc-300">Rest Timer</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customRestTime}
                onChange={(e) => setCustomRestTime(Math.max(5, parseInt(e.target.value) || 60))}
                className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-center"
              />
              <span className="text-xs text-zinc-500">sec</span>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[30, 45, 60, 90, 120].map((seconds) => (
              <button
                key={seconds}
                onClick={() => {
                  setCustomRestTime(seconds);
                  startRest(seconds);
                }}
                className={`group relative py-3 rounded-xl font-medium transition-all duration-300 ${
                  customRestTime === seconds 
                    ? activeTab === "arms"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                      : "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                    : "bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80"
                }`}
              >
                {seconds < 60 ? `${seconds}s` : `${seconds / 60}m${seconds % 60 ? seconds % 60 : ""}`}
              </button>
            ))}
          </div>
          {settings.autoStartRest && (
            <p className="text-xs text-zinc-600 mt-2 text-center">
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
            <p className="text-sm font-medium text-zinc-300">Exercises</p>
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
              showWeight={activeTab === "arms"}
              accentColor={activeTab === "arms" ? "orange" : "emerald"}
            />
          ))}
        </section>

        {/* Add Exercise */}
        {showAddExercise ? (
          <div className="mt-4 bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-zinc-800 rounded-lg flex items-center justify-center text-xs">+</span>
              Add New Exercise
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Exercise name"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 transition-all placeholder-zinc-500"
              />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-2 uppercase tracking-wider">Sets</label>
                  <input
                    type="number"
                    value={newExercise.sets}
                    onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-3 text-center focus:outline-none focus:border-zinc-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-2 uppercase tracking-wider">Target Reps</label>
                  <input
                    type="number"
                    value={newExercise.targetReps}
                    onChange={(e) => setNewExercise({ ...newExercise, targetReps: parseInt(e.target.value) || 1 })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-3 text-center focus:outline-none focus:border-zinc-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-2 uppercase tracking-wider">Weight</label>
                  <input
                    type="number"
                    value={newExercise.weight}
                    onChange={(e) => setNewExercise({ ...newExercise, weight: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-3 py-3 text-center focus:outline-none focus:border-zinc-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddExercise(false)}
                  className="flex-1 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition-all text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  onClick={addExercise}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                    activeTab === "arms"
                      ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 shadow-orange-500/20"
                      : "bg-gradient-to-r from-emerald-500 to-green-500 hover:opacity-90 shadow-emerald-500/20"
                  }`}
                >
                  Add Exercise
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full mt-4 py-5 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span className="w-6 h-6 border border-current rounded-lg flex items-center justify-center text-sm">+</span>
            Add Exercise
          </button>
        )}

        {/* Reset Button */}
        {workoutStarted && (
          <button
            onClick={resetWorkout}
            className="w-full mt-6 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-500 hover:bg-red-950/30 hover:border-red-900/50 hover:text-red-400 transition-all duration-300"
          >
            Reset Workout
          </button>
        )}
      </main>

      {/* Footer */}
      <footer className="relative border-t border-zinc-900 px-4 py-8 mt-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-zinc-700 text-sm">Built for gains. No excuses.</p>
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
  showWeight, 
  accentColor 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [tempWeight, setTempWeight] = useState(exercise.weight);
  const [tempTargetReps, setTempTargetReps] = useState(exercise.targetReps);
  
  const completedCount = exercise.completed.filter(Boolean).length;
  const isComplete = completedCount === exercise.sets;

  const accentClasses = {
    orange: {
      gradient: "from-orange-500 to-amber-500",
      bg: "bg-orange-500",
      border: "border-orange-500/50",
      text: "text-orange-400",
      shadow: "shadow-orange-500/20",
      lightBg: "bg-orange-500/20",
    },
    emerald: {
      gradient: "from-emerald-500 to-green-500",
      bg: "bg-emerald-500",
      border: "border-emerald-500/50",
      text: "text-emerald-400",
      shadow: "shadow-emerald-500/20",
      lightBg: "bg-emerald-500/20",
    },
  };

  const accent = accentClasses[accentColor];

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
      className={`group relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl ${
        isComplete ? `${accent.border} ${accent.shadow} shadow-lg` : "border-zinc-800/80 hover:border-zinc-700"
      }`}
    >
      {/* Exercise Number Badge */}
      <div className={`absolute -left-2 -top-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shadow-lg ${
        isComplete 
          ? `bg-gradient-to-br ${accent.gradient} text-white` 
          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
      }`}>
        {index + 1}
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 pl-4">
          {isComplete && (
            <div className={`w-6 h-6 rounded-full ${accent.bg} flex items-center justify-center`}>
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <div>
            <h3 className={`font-semibold text-lg ${isComplete ? accent.text : "text-white"}`}>
              {exercise.name}
            </h3>
            <p className="text-sm text-zinc-500">
              {exercise.sets} sets × {exercise.targetReps} {exercise.notes?.includes("seconds") || exercise.notes?.includes("sec") ? "sec" : "reps"}
              {exercise.weight > 0 && ` @ ${exercise.weight} lbs`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-2">
              {showWeight && (
                <div className="flex flex-col items-center">
                  <span className="text-xs text-zinc-500 mb-1">Weight</span>
                  <input
                    type="number"
                    value={tempWeight}
                    onChange={(e) => setTempWeight(parseInt(e.target.value) || 0)}
                    className="w-16 bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1 text-sm text-center"
                  />
                </div>
              )}
              <div className="flex flex-col items-center">
                <span className="text-xs text-zinc-500 mb-1">Reps</span>
                <input
                  type="number"
                  value={tempTargetReps}
                  onChange={(e) => setTempTargetReps(parseInt(e.target.value) || 1)}
                  className="w-16 bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1 text-sm text-center"
                />
              </div>
              <button
                onClick={() => {
                  onUpdateExercise(exercise.id, { weight: tempWeight, targetReps: tempTargetReps });
                  setIsEditing(false);
                }}
                className={`${accent.text} px-2 py-1 text-xl`}
              >
                ✓
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setTempWeight(exercise.weight);
                  setTempTargetReps(exercise.targetReps);
                  setIsEditing(true);
                }}
                className="w-8 h-8 rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 transition-all flex items-center justify-center border border-zinc-700/50"
                title="Edit exercise"
              >
                ✏️
              </button>
              {exercise.notes && (
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className={`w-8 h-8 rounded-lg text-sm transition-all flex items-center justify-center ${
                    showNotes 
                      ? `bg-gradient-to-br ${accent.gradient} text-white shadow-md` 
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
                  }`}
                >
                  ?
                </button>
              )}
              <button
                onClick={() => onDelete(exercise.id)}
                className="w-8 h-8 rounded-lg bg-zinc-800/50 text-zinc-600 hover:bg-red-950/50 hover:text-red-400 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-900/50"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notes */}
      {showNotes && exercise.notes && (
        <div className={`mb-4 ${accent.lightBg} rounded-xl p-4 border border-zinc-700/50`}>
          <p className="text-sm text-zinc-300 leading-relaxed">{exercise.notes}</p>
        </div>
      )}

      {/* Set Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {exercise.completed.map((isSetComplete, setIndex) => (
          <div key={setIndex} className="relative">
            <button
              onClick={() => onToggleSet(exercise.id, setIndex)}
              className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                isSetComplete 
                  ? `bg-gradient-to-br ${accent.gradient} text-white shadow-md ${accent.shadow}` 
                  : "bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50"
              }`}
            >
              {isSetComplete ? (
                <div className="flex flex-col items-center">
                  <span className="text-lg">✓</span>
                  <span className="text-xs opacity-80">
                    {exercise.reps[setIndex] || exercise.targetReps}
                  </span>
                </div>
              ) : (
                <span>Set {setIndex + 1}</span>
              )}
            </button>
            
            {/* Edit reps overlay */}
            {isSetComplete && editingReps?.exerciseId === exercise.id && editingReps?.setIndex === setIndex && (
              <div className="absolute inset-0 bg-zinc-900 rounded-xl p-2 flex flex-col items-center justify-center z-10 border border-zinc-600">
                <input
                  type="number"
                  value={exercise.reps[setIndex] || ""}
                  onChange={(e) => handleRepsChange(setIndex, e.target.value)}
                  className="w-12 bg-zinc-700 rounded px-1 py-0.5 text-center text-sm mb-1"
                  autoFocus
                />
                <button
                  onClick={() => setEditingReps(null)}
                  className="text-xs text-zinc-400"
                >
                  Done
                </button>
              </div>
            )}
            
            {/* Tap to edit hint */}
            {isSetComplete && !editingReps && (
              <button
                onClick={() => handleRepsClick(setIndex)}
                className="absolute bottom-1 right-1 text-xs opacity-0 group-hover:opacity-50 transition-opacity"
              >
                tap to edit
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
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="text-center">
        <div className="relative w-56 h-56 mx-auto mb-8">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="100"
              stroke="#27272a"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="112"
              cy="112"
              r="100"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={628}
              strokeDashoffset={628 - (628 * progress) / 100}
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Timer text */}
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-6xl font-bold font-mono">{restTimer}</p>
            <p className="text-zinc-500 text-sm uppercase tracking-widest mt-1">seconds</p>
          </div>
        </div>
        
        <p className="text-zinc-400 mb-8 text-lg">Rest & Recover</p>
        <button
          onClick={onSkip}
          className="px-8 py-3 bg-zinc-900 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-all text-zinc-300"
        >
          Skip Rest →
        </button>
      </div>
    </div>
  );
}

// Congrats Modal Component
function CongratsModal({ workout, workoutTime, exercises, totalSets, formatTime, onClose, history, activeTab }) {
  const totalVolume = exercises.reduce((acc, ex) => {
    const completedReps = ex.reps.filter((r, i) => ex.completed[i] && r !== null);
    return acc + completedReps.reduce((sum, reps) => sum + (reps * ex.weight), 0);
  }, 0);

  const totalReps = exercises.reduce((acc, ex) => {
    return acc + ex.reps.filter((r, i) => ex.completed[i] && r !== null).reduce((sum, r) => sum + r, 0);
  }, 0);

  // Compare to last workout
  const lastWorkout = history.filter(h => h.workoutType === activeTab)[1]; // [1] because [0] is the one we just added
  let volumeChange = null;
  if (lastWorkout?.stats?.totalVolume && totalVolume > 0) {
    volumeChange = ((totalVolume - lastWorkout.stats.totalVolume) / lastWorkout.stats.totalVolume * 100).toFixed(1);
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
            <span className="text-4xl">🏆</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Workout Complete!
          </h2>
          <p className="text-zinc-400 mb-8">
            You crushed {workout.name} in {formatTime(workoutTime)}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-800/50 backdrop-blur rounded-2xl p-4 border border-zinc-700/50">
              <p className="text-3xl font-bold text-green-400">{totalSets}</p>
              <p className="text-zinc-500 text-sm">Sets</p>
            </div>
            <div className="bg-zinc-800/50 backdrop-blur rounded-2xl p-4 border border-zinc-700/50">
              <p className="text-3xl font-bold text-blue-400">{totalReps}</p>
              <p className="text-zinc-500 text-sm">Total Reps</p>
            </div>
          </div>

          {totalVolume > 0 && (
            <div className="bg-zinc-800/50 backdrop-blur rounded-2xl p-4 border border-zinc-700/50 mb-6">
              <p className="text-3xl font-bold text-purple-400">{totalVolume.toLocaleString()} lbs</p>
              <p className="text-zinc-500 text-sm">Total Volume</p>
              {volumeChange && (
                <p className={`text-sm mt-1 ${parseFloat(volumeChange) >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {parseFloat(volumeChange) >= 0 ? "↑" : "↓"} {Math.abs(parseFloat(volumeChange))}% vs last workout
                </p>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-white to-zinc-200 text-black font-semibold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-white/10"
          >
            Start New Workout
          </button>
        </div>
      </div>
    </div>
  );
}

// History Modal Component
function HistoryModal({ history, onClose, formatTime, formatDate, onClearHistory }) {
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Workout History</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-all"
          >
            ✕
          </button>
        </div>

        {selectedWorkout ? (
          <div className="overflow-y-auto max-h-[60vh]">
            <button
              onClick={() => setSelectedWorkout(null)}
              className="text-sm text-zinc-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back to history
            </button>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{selectedWorkout.workoutName}</h3>
                <span className="text-zinc-500 text-sm">{formatTime(selectedWorkout.duration)}</span>
              </div>
              <p className="text-zinc-500 text-sm">{formatDate(selectedWorkout.date)}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-green-400">{selectedWorkout.stats.completedSets}</p>
                  <p className="text-xs text-zinc-500">Sets</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-blue-400">{selectedWorkout.stats.totalReps}</p>
                  <p className="text-xs text-zinc-500">Reps</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-purple-400">{selectedWorkout.stats.totalVolume}</p>
                  <p className="text-xs text-zinc-500">Volume</p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedWorkout.exercises.map((ex, i) => (
                  <div key={i} className="bg-zinc-800/30 rounded-xl p-4">
                    <h4 className="font-medium mb-2">{ex.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {ex.sets.map((set, j) => (
                        <div
                          key={j}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            set.completed
                              ? "bg-green-500/20 text-green-400"
                              : "bg-zinc-700 text-zinc-500"
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
                <div className="text-center py-12 text-zinc-500">
                  <p className="text-4xl mb-4">📊</p>
                  <p>No workout history yet</p>
                  <p className="text-sm">Complete a workout to see it here</p>
                </div>
              ) : (
                history.map((workout) => (
                  <button
                    key={workout.id}
                    onClick={() => setSelectedWorkout(workout)}
                    className="w-full bg-zinc-800/30 hover:bg-zinc-800/50 rounded-xl p-4 text-left transition-all border border-transparent hover:border-zinc-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{workout.workoutName}</h4>
                        <p className="text-sm text-zinc-500">{formatDate(workout.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono">{formatTime(workout.duration)}</p>
                        <p className="text-xs text-zinc-500">{workout.stats.completedSets} sets</p>
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
                className="w-full mt-4 py-3 border border-zinc-800 rounded-xl text-zinc-500 hover:bg-red-950/30 hover:border-red-900/50 hover:text-red-400 transition-all"
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
      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-all"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Default Rest Time */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
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
                className="flex-1"
              />
              <span className="w-16 text-center font-mono">{customRestTime}s</span>
            </div>
          </div>

          {/* Auto-start Rest */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Auto-start Rest Timer</p>
              <p className="text-sm text-zinc-500">Start timer after completing a set</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, autoStartRest: !s.autoStartRest }))}
              className={`w-14 h-8 rounded-full transition-all ${
                settings.autoStartRest ? "bg-green-500" : "bg-zinc-700"
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
              <p className="font-medium">Vibration</p>
              <p className="text-sm text-zinc-500">Vibrate when rest timer ends</p>
            </div>
            <button
              onClick={() => setSettings(s => ({ ...s, vibrationEnabled: !s.vibrationEnabled }))}
              className={`w-14 h-8 rounded-full transition-all ${
                settings.vibrationEnabled ? "bg-green-500" : "bg-zinc-700"
              }`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                settings.vibrationEnabled ? "translate-x-7" : "translate-x-1"
              }`} />
            </button>
          </div>

          {/* Progressive Overload % */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
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
                className="flex-1"
              />
              <span className="w-16 text-center font-mono">{settings.progressiveOverloadPercent}%</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Weight increase when you hit all target reps</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// Progressive Overload Modal Component
function ProgressiveOverloadModal({ suggestions, onApply, onClose, accentColor }) {
  const [applied, setApplied] = useState(new Set());

  const handleApply = (suggestion) => {
    onApply(suggestion);
    setApplied(prev => new Set([...prev, suggestion.exerciseId]));
  };

  const accentClasses = {
    orange: {
      gradient: "from-orange-500 to-amber-500",
      bg: "bg-orange-500/20",
      text: "text-orange-400",
      border: "border-orange-500/30",
    },
    emerald: {
      gradient: "from-emerald-500 to-green-500",
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    },
  };

  const accent = accentClasses[accentColor];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className={`w-10 h-10 ${accent.bg} rounded-xl flex items-center justify-center`}>
              📈
            </span>
            Progressive Overload
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-all"
          >
            ✕
          </button>
        </div>
        
        <p className="text-zinc-400 text-sm mb-6">
          Based on your last workout performance, here are suggested adjustments:
        </p>

        <div className="overflow-y-auto max-h-[50vh] space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.exerciseId}
              className={`bg-zinc-800/30 rounded-xl p-4 border ${
                applied.has(suggestion.exerciseId) ? "border-green-500/50" : "border-zinc-700/50"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{suggestion.exerciseName}</h4>
                {suggestion.type === "deload" ? (
                  <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg">
                    Deload
                  </span>
                ) : (
                  <span className={`text-xs px-2 py-1 ${accent.bg} ${accent.text} rounded-lg`}>
                    Increase
                  </span>
                )}
              </div>
              
              <p className="text-sm text-zinc-500 mb-3">{suggestion.reason}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400">
                    {suggestion.type === "reps" ? `${suggestion.currentValue} reps` : `${suggestion.currentValue} lbs`}
                  </span>
                  <span className="text-zinc-600">→</span>
                  <span className={suggestion.type === "deload" ? "text-yellow-400" : accent.text}>
                    {suggestion.type === "reps" ? `${suggestion.suggestedValue} reps` : `${suggestion.suggestedValue} lbs`}
                  </span>
                </div>
                
                {applied.has(suggestion.exerciseId) ? (
                  <span className="text-green-400 text-sm">✓ Applied</span>
                ) : (
                  <button
                    onClick={() => handleApply(suggestion)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${accent.gradient} text-white`}
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
            className="flex-1 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all font-medium"
          >
            {applied.size > 0 ? "Done" : "Skip for Now"}
          </button>
          {applied.size === 0 && suggestions.length > 1 && (
            <button
              onClick={() => {
                suggestions.forEach(s => handleApply(s));
              }}
              className={`flex-1 py-3 rounded-xl font-medium bg-gradient-to-r ${accent.gradient} text-white`}
            >
              Apply All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}