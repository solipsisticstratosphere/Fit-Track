"use client";

import type React from "react";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { format, startOfWeek, addDays, parseISO, isSameDay } from "date-fns";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Plus,
  Dumbbell,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Copy,
  Edit,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number | null;
  notes: string | null;
}

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number | null;
  notes: string | null;
  exercises: Exercise[];
}

type ExerciseFormField = {
  name: string;
  sets: number;
  reps: number;
  weight: string;
  notes: string;
};

function WorkoutsContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterName, setFilterName] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState(new Date());
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exercises, setExercises] = useState<
    Array<{
      id: string;
      name: string;
      sets: number;
      reps: number;
      weight: string;
      notes: string;
    }>
  >([
    {
      id: crypto.randomUUID(),
      name: "",
      sets: 3,
      reps: 10,
      weight: "",
      notes: "",
    },
  ]);

  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const calendarDays = Array.from({ length: 7 }).map((_, i) =>
    addDays(startDate, i)
  );

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchWorkouts();
    }
  }, [status, session, selectedDate, filterName]);

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }

    if (searchParams.get("new") === "true") {
      openNewWorkoutModal();
    }
  }, [searchParams]);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const startOfWeekFormatted = format(startDate, "yyyy-MM-dd");
      const endOfWeekFormatted = format(addDays(startDate, 6), "yyyy-MM-dd");

      const url = new URL(`${window.location.origin}/api/workouts`);
      url.searchParams.append("from", startOfWeekFormatted);
      url.searchParams.append("to", endOfWeekFormatted);

      if (filterName) {
        url.searchParams.append("name", filterName);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.workouts) {
        setWorkouts(data.workouts);
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutClick = (workout: Workout) => {
    setSelectedWorkout(workout);
    setShowModal(true);
  };

  const handleDateClick = (date: Date) => {
    setWorkoutDate(date);
    setShowNewWorkoutModal(true);
  };

  const getWorkoutsForDate = (date: Date) => {
    return workouts.filter((workout) =>
      isSameDay(parseISO(workout.date), date)
    );
  };

  const handleCopyWorkout = async (workout: Workout) => {
    try {
      const response = await fetch(`/api/workouts/${workout.id}/copy`, {
        method: "POST",
      });

      if (response.ok) {
        setShowModal(false);
        fetchWorkouts();
      }
    } catch (error) {
      console.error("Error copying workout:", error);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowModal(false);
        fetchWorkouts();
      }
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);

    fetchWorkouts();
  };

  const handlePreviousWeek = () => {
    const newDate = addDays(selectedDate, -7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addDays(selectedDate, 7);
    setSelectedDate(newDate);
  };

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        id: crypto.randomUUID(),
        name: "",
        sets: 3,
        reps: 10,
        weight: "",
        notes: "",
      },
    ]);
  };

  const handleRemoveExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((exercise) => exercise.id !== id));
    }
  };

  const handleExerciseChange = (
    id: string,
    field: keyof ExerciseFormField,
    value: string | number
  ) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, [field]: value } : exercise
      )
    );
  };

  const openNewWorkoutModal = () => {
    setWorkoutName("");
    setWorkoutDate(new Date());
    setWorkoutDuration("");
    setWorkoutNotes("");
    setExercises([
      {
        id: crypto.randomUUID(),
        name: "",
        sets: 3,
        reps: 10,
        weight: "",
        notes: "",
      },
    ]);
    setShowNewWorkoutModal(true);
  };

  const handleSubmitNewWorkout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workoutName || !workoutDate) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workoutName,
          date: workoutDate.toISOString(),
          duration: workoutDuration ? Number.parseInt(workoutDuration) : null,
          notes: workoutNotes || null,
          exercises: exercises.map((exercise) => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight ? Number.parseFloat(exercise.weight) : null,
            notes: exercise.notes || null,
          })),
        }),
      });

      if (response.ok) {
        setShowNewWorkoutModal(false);
        fetchWorkouts();
        setIsSubmitting(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Failed to create workout"}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating workout:", error);
      alert("Failed to create workout. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-indigo-700">Loading your workouts...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate flex items-center h-20">
            <Dumbbell className="mr-3 h-8 w-8 text-indigo-600" />
            Workouts
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Manage your workout sessions and track your progress
          </p>
        </div>
        <div className="mt-5 flex md:mt-0 space-x-3">
          <div className="relative">
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="block px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
            />
          </div>
          <button
            type="button"
            onClick={openNewWorkoutModal}
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            aria-label="New workout"
            tabIndex={0}
          >
            <Plus className="h-5 w-5 mr-2" />
            New Workout
          </button>
        </div>
      </div>

      {/* Filter Inputs */}
      <div className="mb-8">
        <div className="max-w-lg">
          <label
            htmlFor="filter-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter by Name
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="filter-name"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-4 py-3 rounded-lg sm:text-sm border-gray-300 bg-white"
              placeholder="Enter workout name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
            {filterName && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={() => setFilterName("")}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white shadow-md overflow-hidden rounded-xl mb-8 border border-gray-100">
        <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
            Weekly Calendar
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousWeek}
              className="p-1.5 rounded-md hover:bg-indigo-100 text-indigo-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-indigo-800">
              {format(startDate, "MMM d")} -{" "}
              {format(addDays(startDate, 6), "MMM d, yyyy")}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-md hover:bg-indigo-100 text-indigo-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {/* Day Headers */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div
              key={day}
              className="bg-indigo-600 py-2 text-center text-sm font-medium text-white"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((date) => {
            const dateWorkouts = getWorkoutsForDate(date);
            const isToday = isSameDay(date, new Date());
            return (
              <div
                key={date.toString()}
                className={`bg-white min-h-36 p-3 relative transition-colors duration-200 hover:bg-indigo-50 cursor-pointer ${
                  isToday ? "bg-indigo-50 border-t-2 border-indigo-500" : ""
                }`}
                onClick={() => handleDateClick(date)}
              >
                <div
                  className={`font-medium text-sm mb-2 ${
                    isToday ? "text-indigo-700" : "text-gray-700"
                  }`}
                >
                  {format(date, "d")}
                </div>
                <div className="space-y-2">
                  {dateWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-l-4 border-indigo-500 px-3 py-2 rounded-md cursor-pointer shadow-sm hover:shadow transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWorkoutClick(workout);
                      }}
                    >
                      <div className="font-medium text-indigo-800 text-sm">
                        {workout.name}
                      </div>
                      {workout.duration && (
                        <div className="text-xs text-indigo-600 flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {workout.duration} min
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workouts List */}
      <div className="bg-white shadow-md overflow-hidden rounded-xl border border-gray-100">
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
            <Dumbbell className="mr-2 h-5 w-5 text-indigo-600" />
            Your Workouts
          </h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {loading ? (
            <li className="px-6 py-8 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">Loading workouts...</p>
            </li>
          ) : workouts.length > 0 ? (
            workouts.map((workout) => (
              <li
                key={workout.id}
                className="px-6 py-5 hover:bg-indigo-50 cursor-pointer transition-colors duration-200"
                onClick={() => handleWorkoutClick(workout)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium text-indigo-700">
                      {workout.name}
                    </p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                      {format(parseISO(workout.date), "EEEE, MMMM d, yyyy")}

                      {workout.duration && (
                        <span className="flex items-center ml-4">
                          <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                          {workout.duration} minutes
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-indigo-100 text-indigo-800 py-1.5 px-3 rounded-full text-sm font-medium flex items-center">
                    <Dumbbell className="h-4 w-4 mr-1.5" />
                    {workout.exercises?.length || 0} exercises
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-indigo-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
                  <Dumbbell className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">
                  No workouts yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Get started by creating your first workout. Track your
                  exercises, sets, reps, and weights.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={openNewWorkoutModal}
                    className="inline-flex items-center px-5 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    aria-label="Create a new workout"
                    tabIndex={0}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Workout
                  </button>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Workout Details Modal */}
      {showModal && selectedWorkout && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={selectedWorkout.name}
          size="2xl"
        >
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {format(parseISO(selectedWorkout.date), "MMMM d, yyyy")}
                  </span>
                </div>

                {selectedWorkout.duration && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {selectedWorkout.duration} minutes
                    </span>
                  </div>
                )}
              </div>
            </div>

            {selectedWorkout.notes && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
                  Notes
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedWorkout.notes}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-3">
                Exercises
              </h4>
              <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                {selectedWorkout.exercises?.map((exercise, index) => (
                  <li
                    key={exercise.id}
                    className="p-4 bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 text-indigo-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                          {index + 1}
                        </div>
                        <p className="font-medium text-gray-900">
                          {exercise.name}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {exercise.sets} × {exercise.reps}{" "}
                        {exercise.weight && ` @ ${exercise.weight}kg`}
                      </div>
                    </div>
                    {exercise.notes && (
                      <p className="mt-2 text-sm text-gray-500 pl-9">
                        {exercise.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() =>
                  router.push(`/workouts/${selectedWorkout.id}/edit`)
                }
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                aria-label="Edit workout"
                tabIndex={0}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleCopyWorkout(selectedWorkout)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                aria-label="Copy workout"
                tabIndex={0}
              >
                <Copy className="h-4 w-4 mr-2" />
                Use as Template
              </button>
              <button
                type="button"
                onClick={() => handleDeleteWorkout(selectedWorkout.id)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                aria-label="Delete workout"
                tabIndex={0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Workout Modal */}
      {showNewWorkoutModal && (
        <Modal
          isOpen={showNewWorkoutModal}
          onClose={() => setShowNewWorkoutModal(false)}
          title="New Workout"
          size="2xl"
        >
          <form
            onSubmit={handleSubmitNewWorkout}
            className="space-y-8 overflow-auto"
          >
            <div className="overflow-auto bg-white rounded-lg p-6 border border-gray-100 ">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="workout-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Workout Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="workout-name"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2"
                      placeholder="Push Day, Leg Day, etc."
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="workout-date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="workout-date"
                      value={format(workoutDate, "yyyy-MM-dd")}
                      onChange={(e) => setWorkoutDate(new Date(e.target.value))}
                      required
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="workout-duration"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Duration (minutes)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="workout-duration"
                      value={workoutDuration}
                      onChange={(e) => setWorkoutDuration(e.target.value)}
                      className="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="workout-notes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Notes
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="workout-notes"
                      rows={3}
                      value={workoutNotes}
                      onChange={(e) => setWorkoutNotes(e.target.value)}
                      className="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                      placeholder="Any notes about this workout..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex items-center">
                <Dumbbell className="mr-2 h-5 w-5 text-indigo-600" />
                Exercises
              </h3>

              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="bg-white shadow-sm overflow-hidden rounded-lg p-6 border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 text-indigo-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                          {index + 1}
                        </div>
                        <h4 className="text-md font-medium text-gray-900">
                          Exercise #{index + 1}
                        </h4>
                      </div>
                      {exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exercise.id)}
                          className="text-red-600 hover:text-red-900 flex items-center text-sm font-medium transition-colors duration-200"
                          aria-label="Remove exercise"
                          tabIndex={0}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-6">
                        <label
                          htmlFor={`exercise-name-${exercise.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Exercise Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id={`exercise-name-${exercise.id}`}
                            value={exercise.name}
                            onChange={(e) =>
                              handleExerciseChange(
                                exercise.id,
                                "name",
                                e.target.value
                              )
                            }
                            required
                            className="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                            placeholder="Bench Press, Squat, etc."
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor={`exercise-sets-${exercise.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Sets
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            id={`exercise-sets-${exercise.id}`}
                            value={exercise.sets}
                            onChange={(e) =>
                              handleExerciseChange(
                                exercise.id,
                                "sets",
                                Number.parseInt(e.target.value)
                              )
                            }
                            required
                            min="1"
                            className="p-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor={`exercise-reps-${exercise.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Reps
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            id={`exercise-reps-${exercise.id}`}
                            value={exercise.reps}
                            onChange={(e) =>
                              handleExerciseChange(
                                exercise.id,
                                "reps",
                                Number.parseInt(e.target.value)
                              )
                            }
                            required
                            min="1"
                            className="p-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor={`exercise-weight-${exercise.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Weight (kg)
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            id={`exercise-weight-${exercise.id}`}
                            value={exercise.weight}
                            onChange={(e) =>
                              handleExerciseChange(
                                exercise.id,
                                "weight",
                                e.target.value
                              )
                            }
                            step="0.5"
                            min="0"
                            className="p-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label
                          htmlFor={`exercise-notes-${exercise.id}`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Notes
                        </label>
                        <div className="mt-1">
                          <textarea
                            id={`exercise-notes-${exercise.id}`}
                            value={exercise.notes}
                            onChange={(e) =>
                              handleExerciseChange(
                                exercise.id,
                                "notes",
                                e.target.value
                              )
                            }
                            rows={2}
                            className="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                            placeholder="Any notes about this exercise..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="inline-flex items-center px-4 py-2.5 border border-indigo-300 text-sm font-medium rounded-lg shadow-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 w-full justify-center"
                  aria-label="Add another exercise"
                  tabIndex={0}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Another Exercise
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowNewWorkoutModal(false)}
                className="bg-white py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3 transition-colors duration-200"
                aria-label="Cancel"
                tabIndex={0}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center items-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                aria-label="Save workout"
                tabIndex={0}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Save Workout
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function WorkoutsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-indigo-700">Loading workouts...</p>
          </div>
        </div>
      }
    >
      <WorkoutsContent />
    </Suspense>
  );
}
