"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Dumbbell, ArrowLeft, X, Loader2, Save, Plus } from "lucide-react";
import Link from "next/link";

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: string;
  notes: string;
};

export default function EditWorkoutPage() {
  const { status } = useSession();
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    date: new Date(),
    duration: "",
    notes: "",
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }

    if (status === "authenticated" && workoutId) {
      fetchWorkout();
    }
  }, [status, workoutId]);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workouts/${workoutId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch workout");
      }

      const data = await response.json();

      if (data.workout) {
        setFormData({
          name: data.workout.name,
          date: parseISO(data.workout.date),
          duration: data.workout.duration
            ? data.workout.duration.toString()
            : "",
          notes: data.workout.notes || "",
        });

        setExercises(
          data.workout.exercises.map(
            (exercise: {
              id: string;
              name: string;
              sets: number;
              reps: number;
              weight: number | null;
              notes: string | null;
            }) => ({
              id: exercise.id,
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight ? exercise.weight.toString() : "",
              notes: exercise.notes || "",
            })
          )
        );
      }
    } catch (error) {
      console.error("Error fetching workout:", error);
      setError("Failed to load workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, date: new Date(e.target.value) }));
  };

  const handleAddExercise = () => {
    setExercises((prev) => [
      ...prev,
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
    setExercises((prev) => prev.filter((exercise) => exercise.id !== id));
  };

  const handleExerciseChange = (
    id: string,
    field: keyof Exercise,
    value: string | number
  ) => {
    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === id ? { ...exercise, [field]: value } : exercise
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workoutId) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          date: format(formData.date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          duration: formData.duration ? parseInt(formData.duration) : null,
          notes: formData.notes || null,
          exercises: exercises.map((exercise) => ({
            id: exercise.id,
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight ? parseFloat(exercise.weight) : null,
            notes: exercise.notes || null,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update workout");
      }

      
      router.push("/workouts");
    } catch (error) {
      console.error("Error updating workout:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-indigo-700">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50">
      <div className="mb-8">
        <Link
          href="/workouts"
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          aria-label="Back to workouts"
          tabIndex={0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Workouts</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Dumbbell className="mr-3 h-8 w-8 text-indigo-600" />
          Edit Workout
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Update your workout details and exercises
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-md overflow-hidden rounded-lg p-6 border border-gray-100">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Workout Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg p-2"
                  placeholder="Push Day, Leg Day, etc."
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <div className="mt-1">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={format(formData.date, "yyyy-MM-dd")}
                  onChange={handleDateChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duration (minutes)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                  placeholder="Any notes about this workout..."
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Dumbbell className="mr-2 h-6 w-6 text-indigo-600" />
              Exercises
            </h2>
            <button
              type="button"
              onClick={handleAddExercise}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              aria-label="Add exercise"
              tabIndex={0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </button>
          </div>

          <div className="space-y-4">
            {exercises.length === 0 ? (
              <div className="bg-indigo-50 p-8 text-center rounded-lg border border-indigo-100">
                <p className="text-indigo-700">
                  No exercises added yet. Click the &quot;Add Exercise&quot;
                  button to add exercises to your workout.
                </p>
              </div>
            ) : (
              exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="bg-white shadow-sm overflow-hidden rounded-lg p-6 border border-gray-100"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 text-indigo-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        {index + 1}
                      </div>
                      <h3 className="text-md font-medium text-gray-900">
                        Exercise #{index + 1}
                      </h3>
                    </div>
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
                              parseInt(e.target.value)
                            )
                          }
                          required
                          min="1"
                          className="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
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
                              parseInt(e.target.value)
                            )
                          }
                          required
                          min="1"
                          className="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
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
                          className="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg"
                          placeholder="Optional"
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
                          placeholder="Optional notes about this exercise..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            aria-label="Save workout"
            tabIndex={0}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Workout
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
