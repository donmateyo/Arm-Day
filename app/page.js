"use client";
import { useState, useEffect } from "react";

const workoutPlans = {
  arms: {
    name: "Arm Day",
    emoji: "💪",
    description: "Biceps & Triceps Focus",
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
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(200);
      }
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  // Check if workout complete
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
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Congrats Modal */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">Workout Complete!</h2>
            <p className="text-zinc-400 mb-6">
              You crushed {workouts[activeTab].name} in {formatTime(workoutTime)}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-zinc-800 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-400">{totalSets}</p>
                <p className="text-zinc-500 text-sm">Sets Completed</p>
              </div>
              <div className="bg-zinc-800 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-400">{exercises.length}</p>
                <p className="text-zinc-500 text-sm">Exercises Done</p>
              </div>
            </div>
            <button
              onClick={resetWorkout}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Start New Workout
            </button>
          </div>
        </div>
      )}

      {/* Rest Timer Overlay */}
      {isResting && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-40">
          <div className="text-center">
            <p className="text-zinc-400 mb-2 text-lg">Rest Time</p>
            <p className="text-8xl font-bold font-mono">{formatTime(restTimer)}</p>
            <button
              onClick={() => setIsResting(false)}
              className="mt-8 px-8 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Skip Rest
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800 px-4 py-4 z-30">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {workouts[activeTab].emoji} {workouts[activeTab].name}
              </h1>
              <p className="text-sm text-zinc-500">by Null</p>
            </div>
            <div className="text-right">
              {workoutStarted ? (
                <div>
                  <p className="text-2xl font-mono font-bold">{formatTime(workoutTime)}</p>
                  <p className="text-xs text-zinc-500">Workout Time</p>
                </div>
              ) : (
                <span className="text-sm text-zinc-500">Ready to start</span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {Object.entries(workouts).map(([key, workout]) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  activeTab === key
                    ? "bg-white text-black"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                {workout.emoji} {workout.name}
              </button>
            ))}
          </div>

          {/* Workout Description */}
          <p className="text-sm text-zinc-400 mb-3">{workouts[activeTab].description}</p>

          {/* Progress Bar */}
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {completedSets} of {totalSets} sets completed
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Quick Rest Buttons */}
        <section className="mb-6">
          <p className="text-sm text-zinc-500 mb-2">Quick Rest Timer</p>
          <div className="flex gap-2">
            {[30, 60, 90, 120].map((seconds) => (
              <button
                key={seconds}
                onClick={() => startRest(seconds)}
                className="flex-1 bg-zinc-900 border border-zinc-800 py-2 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition-colors text-sm"
              >
                {seconds}s
              </button>
            ))}
          </div>
        </section>

        {/* Science Note for Full Body */}
        {activeTab === "fullbody" && (
          <section className="mb-6 bg-blue-950/30 border border-blue-900/50 rounded-xl p-4">
            <p className="text-sm text-blue-300">
              <span className="font-semibold">Science-Backed Routine:</span> These compound movements 
              target all major muscle groups. Research shows 3x/week full-body training is optimal 
              for strength and hypertrophy in natural lifters. Rest 48 hours between sessions.
            </p>
          </section>
        )}

        {/* Exercise List */}
        <section className="space-y-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onToggleSet={toggleSet}
              onDelete={deleteExercise}
              onUpdateWeight={updateWeight}
              showWeight={activeTab === "arms"}
            />
          ))}
        </section>

        {/* Add Exercise */}
        {showAddExercise ? (
          <div className="mt-4 bg-zinc-900 border border-zinc-700 rounded-xl p-4">
            <h3 className="font-semibold mb-4">Add New Exercise</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Exercise name"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-zinc-500"
              />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Sets</label>
                  <input
                    type="number"
                    value={newExercise.sets}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, sets: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Reps</label>
                  <input
                    type="text"
                    value={newExercise.reps}
                    onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    value={newExercise.weight}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, weight: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowAddExercise(false)}
                  className="flex-1 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addExercise}
                  className="flex-1 py-2 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
                >
                  Add Exercise
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full mt-4 py-4 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
          >
            + Add Exercise
          </button>
        )}

        {/* Reset Button */}
        {workoutStarted && (
          <button
            onClick={resetWorkout}
            className="w-full mt-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            Reset Workout
          </button>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-4 py-6 mt-12">
        <p className="text-center text-zinc-600 text-sm">Built for gains. No excuses.</p>
      </footer>
    </div>
  );
}

function ExerciseCard({ exercise, onToggleSet, onDelete, onUpdateWeight, showWeight }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempWeight, setTempWeight] = useState(exercise.weight);
  const [showNotes, setShowNotes] = useState(false);
  const completedCount = exercise.completed.filter(Boolean).length;
  const isComplete = completedCount === exercise.sets;

  return (
    <div
      className={`bg-zinc-900 border rounded-xl p-4 transition-all ${
        isComplete ? "border-green-500/50 bg-green-950/20" : "border-zinc-800"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {isComplete && <span className="text-green-400">✓</span>}
          <div>
            <h3 className={`font-semibold ${isComplete ? "text-green-400" : ""}`}>
              {exercise.name}
            </h3>
            <p className="text-sm text-zinc-500">
              {exercise.sets} × {exercise.reps}
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
                    className="w-16 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      onUpdateWeight(exercise.id, tempWeight);
                      setIsEditing(false);
                    }}
                    className="text-green-400 text-sm px-2"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-zinc-800 px-3 py-1 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                >
                  {exercise.weight} lbs
                </button>
              )}
            </>
          )}
          {exercise.notes && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`text-sm px-2 py-1 rounded-lg transition-colors ${
                showNotes ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              ?
            </button>
          )}
          <button
            onClick={() => onDelete(exercise.id)}
            className="text-zinc-600 hover:text-red-400 transition-colors p-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Notes */}
      {showNotes && exercise.notes && (
        <div className="mb-3 bg-zinc-800/50 rounded-lg p-3">
          <p className="text-sm text-zinc-300">{exercise.notes}</p>
        </div>
      )}

      {/* Set Buttons */}
      <div className="flex gap-2">
        {exercise.completed.map((isSetComplete, index) => (
          <button
            key={index}
            onClick={() => onToggleSet(exercise.id, index)}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              isSetComplete ? "bg-green-500 text-black" : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}