"use client";
import { useState, useEffect } from "react";

const workoutPlans = {
  arms: {
    name: "Arm Day",
    emoji: "💪",
    description: "Biceps & Triceps Focus",
    color: "orange",
    exercises: [
      { id: 1, name: "Bicep Curls", sets: 4, reps: "10-12", weight: 25, completed: Array(4).fill(false) },
      { id: 2, name: "Hammer Curls", sets: 3, reps: "12", weight: 20, completed: Array(3).fill(false) },
      { id: 3, name: "Tricep Pushdowns", sets: 4, reps: "12-15", weight: 40, completed: Array(4).fill(false) },
      { id: 4, name: "Skull Crushers", sets: 3, reps: "10", weight: 30, completed: Array(3).fill(false) },
      { id: 5, name: "Concentration Curls", sets: 3, reps: "10 each", weight: 15, completed: Array(3).fill(false) },
    ],
  },
  fullbody: {
    name: "Full Body",
    emoji: "🏋️",
    description: "Bodyweight Only • 3x/Week",
    color: "emerald",
    exercises: [
      { id: 101, name: "Push-Ups", sets: 3, reps: "8-15", weight: 0, completed: Array(3).fill(false), notes: "Chest, shoulders, triceps. Gold standard for upper body pushing." },
      { id: 102, name: "Pull-Ups / Inverted Rows", sets: 3, reps: "5-12", weight: 0, completed: Array(3).fill(false), notes: "Back, biceps. Best bodyweight pull movement." },
      { id: 103, name: "Bodyweight Squats", sets: 3, reps: "15-20", weight: 0, completed: Array(3).fill(false), notes: "Quads, glutes. Foundation of leg strength." },
      { id: 104, name: "Lunges", sets: 3, reps: "10 each leg", weight: 0, completed: Array(3).fill(false), notes: "Unilateral leg work. Fixes imbalances." },
      { id: 105, name: "Glute Bridges", sets: 3, reps: "15-20", weight: 0, completed: Array(3).fill(false), notes: "Glutes, hamstrings. Crucial for hip health." },
      { id: 106, name: "Plank", sets: 3, reps: "30-60 sec", weight: 0, completed: Array(3).fill(false), notes: "Core stability. Protects your spine." },
      { id: 107, name: "Dead Bug", sets: 3, reps: "10 each side", weight: 0, completed: Array(3).fill(false), notes: "Deep core. Research-backed for core activation." },
      { id: 108, name: "Pike Push-Ups", sets: 3, reps: "8-12", weight: 0, completed: Array(3).fill(false), notes: "Shoulders. Progression toward handstand push-ups." },
    ],
  },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("fullbody");
  const [workouts, setWorkouts] = useState(workoutPlans);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", sets: 3, reps: "10", weight: 0 });
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);

  const exercises = workouts[activeTab].exercises;
  const currentWorkout = workouts[activeTab];

  useEffect(() => {
    let interval;
    if (workoutStarted && !showCongrats) {
      interval = setInterval(() => setWorkoutTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted, showCongrats]);

  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => setRestTimer((t) => t - 1), 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(200);
      }
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  useEffect(() => {
    const allComplete = exercises.every((ex) => ex.completed.every((set) => set));
    if (allComplete && exercises.length > 0 && workoutStarted) {
      setShowCongrats(true);
    }
  }, [exercises, workoutStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRest = (seconds) => {
    setRestTimer(seconds);
    setIsResting(true);
  };

  const toggleSet = (exerciseId, setIndex) => {
    if (!workoutStarted) setWorkoutStarted(true);
    setWorkouts((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        exercises: prev[activeTab].exercises.map((ex) => {
          if (ex.id === exerciseId) {
            const newCompleted = [...ex.completed];
            newCompleted[setIndex] = !newCompleted[setIndex];
            return { ...ex, completed: newCompleted };
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
            reps: newExercise.reps,
            weight: newExercise.weight,
            completed: Array(newExercise.sets).fill(false),
          },
        ],
      },
    }));
    setNewExercise({ name: "", sets: 3, reps: "10", weight: 0 });
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

  const updateWeight = (id, newWeight) => {
    setWorkouts((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        exercises: prev[activeTab].exercises.map((ex) =>
          ex.id === id ? { ...ex, weight: newWeight } : ex
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

  const completedSets = exercises.reduce((acc, ex) => acc + ex.completed.filter(Boolean).length, 0);
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

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
                You crushed {currentWorkout.name} in {formatTime(workoutTime)}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-800/50 backdrop-blur rounded-2xl p-4 border border-zinc-700/50">
                  <p className="text-3xl font-bold text-green-400">{totalSets}</p>
                  <p className="text-zinc-500 text-sm">Sets Completed</p>
                </div>
                <div className="bg-zinc-800/50 backdrop-blur rounded-2xl p-4 border border-zinc-700/50">
                  <p className="text-3xl font-bold text-blue-400">{exercises.length}</p>
                  <p className="text-zinc-500 text-sm">Exercises Done</p>
                </div>
              </div>
              <button
                onClick={resetWorkout}
                className="w-full bg-gradient-to-r from-white to-zinc-200 text-black font-semibold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-white/10"
              >
                Start New Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer Overlay */}
      {isResting && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping opacity-20">
                <div className="w-48 h-48 mx-auto rounded-full border-4 border-white" />
              </div>
              <div className="relative w-48 h-48 mx-auto rounded-full border-4 border-zinc-700 flex items-center justify-center mb-6">
                <div>
                  <p className="text-6xl font-bold font-mono">{restTimer}</p>
                  <p className="text-zinc-500 text-sm uppercase tracking-widest">seconds</p>
                </div>
              </div>
            </div>
            <p className="text-zinc-400 mb-8 text-lg">Rest & Recover</p>
            <button
              onClick={() => setIsResting(false)}
              className="px-8 py-3 bg-zinc-900 border border-zinc-700 rounded-xl hover:bg-zinc-800 transition-all text-zinc-300"
            >
              Skip Rest →
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
        <div className="relative max-w-2xl mx-auto px-4 py-4">
          {/* Brand & Timer */}
          <div className="flex justify-between items-start mb-6">
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
            <div className="text-right">
              {workoutStarted ? (
                <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl px-4 py-2">
                  <p className="text-2xl font-mono font-bold tracking-tight">{formatTime(workoutTime)}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Duration</p>
                </div>
              ) : (
                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl px-4 py-2">
                  <p className="text-sm text-zinc-500">Ready</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-zinc-900/80 rounded-2xl border border-zinc-800/50 mb-5">
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
        {/* Quick Rest Buttons */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
              <span className="text-sm">⏱️</span>
            </div>
            <p className="text-sm font-medium text-zinc-300">Rest Timer</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { seconds: 30, label: "30s" },
              { seconds: 60, label: "1m" },
              { seconds: 90, label: "1:30" },
              { seconds: 120, label: "2m" },
            ].map(({ seconds, label }) => (
              <button
                key={seconds}
                onClick={() => startRest(seconds)}
                className="group relative bg-zinc-900/80 border border-zinc-800 py-4 rounded-2xl hover:border-zinc-700 hover:bg-zinc-800/80 transition-all duration-300"
              >
                <span className="block text-lg font-semibold text-white group-hover:scale-110 transition-transform">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Science Note for Full Body */}
        {activeTab === "fullbody" && (
          <section className="mb-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950/50 to-zinc-900/50 border border-emerald-800/30 rounded-2xl p-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="relative flex gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-lg">🧬</span>
                </div>
                <div>
                  <p className="font-semibold text-emerald-400 mb-1">Science-Backed Routine</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Compound movements targeting all major muscle groups. Research shows 3x/week full-body training is optimal for strength and hypertrophy. Rest 48 hours between sessions.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

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
              onUpdateWeight={updateWeight}
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
                  <label className="text-xs text-zinc-500 block mb-2 uppercase tracking-wider">Reps</label>
                  <input
                    type="text"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
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

function ExerciseCard({ exercise, index, onToggleSet, onDelete, onUpdateWeight, showWeight, accentColor }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempWeight, setTempWeight] = useState(exercise.weight);
  const [showNotes, setShowNotes] = useState(false);
  const completedCount = exercise.completed.filter(Boolean).length;
  const isComplete = completedCount === exercise.sets;

  const accentClasses = {
    orange: {
      gradient: "from-orange-500 to-amber-500",
      bg: "bg-orange-500",
      border: "border-orange-500/50",
      text: "text-orange-400",
      shadow: "shadow-orange-500/20",
      noteBg: "from-orange-950/30 to-zinc-900/50",
      noteBorder: "border-orange-800/30",
    },
    emerald: {
      gradient: "from-emerald-500 to-green-500",
      bg: "bg-emerald-500",
      border: "border-emerald-500/50",
      text: "text-emerald-400",
      shadow: "shadow-emerald-500/20",
      noteBg: "from-emerald-950/30 to-zinc-900/50",
      noteBorder: "border-emerald-800/30",
    },
  };

  const accent = accentClasses[accentColor];

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
              {exercise.sets} sets × {exercise.reps} reps
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showWeight && (
            <>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={tempWeight}
                    onChange={(e) => setTempWeight(parseInt(e.target.value) || 0)}
                    className="w-16 bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1.5 text-sm text-center"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      onUpdateWeight(exercise.id, tempWeight);
                      setIsEditing(false);
                    }}
                    className={`${accent.text} text-sm px-2 py-1`}
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-zinc-800/80 border border-zinc-700 px-3 py-1.5 rounded-lg text-sm hover:bg-zinc-700 transition-colors font-medium"
                >
                  {exercise.weight} lbs
                </button>
              )}
            </>
          )}
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
            className="w-8 h-8 rounded-lg bg-zinc-800/50 text-zinc-600 hover:bg-red-950/50 hover:text-red-400 hover:border-red-900/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 border border-transparent"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Notes */}
      {showNotes && exercise.notes && (
        <div className={`mb-4 bg-gradient-to-br ${accent.noteBg} ${accent.noteBorder} border rounded-xl p-4`}>
          <p className="text-sm text-zinc-300 leading-relaxed">{exercise.notes}</p>
        </div>
      )}

      {/* Set Buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {exercise.completed.map((isSetComplete, setIndex) => (
          <button
            key={setIndex}
            onClick={() => onToggleSet(exercise.id, setIndex)}
            className={`relative py-4 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
              isSetComplete 
                ? `bg-gradient-to-br ${accent.gradient} text-white shadow-md ${accent.shadow}` 
                : "bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/50"
            }`}
          >
            {isSetComplete && (
              <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
            )}
            <span className="relative">
              {isSetComplete ? "✓" : `Set ${setIndex + 1}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}