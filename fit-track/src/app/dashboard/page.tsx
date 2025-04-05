"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js";
import { format, subDays, subMonths } from "date-fns";
import {
  PlusCircle,
  PlayCircle,
  ChevronRight,
  TrendingUp,
  Clock,
  Dumbbell,
  Utensils,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface WeightEntry {
  weight: number;
  date: string;
}

interface WorkoutStats {
  count: number;
  avgDuration: number;
}

interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number | null;
  exercises?: Array<{
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number | null;
  }>;
}

interface Meal {
  id: string;
  name: string;
  date: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  imageUrl?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeframe, setTimeframe] = useState("week"); // week, month, year
  const [weightData, setWeightData] = useState<ChartData<"line", number[]>>({
    labels: [],
    datasets: [],
  });
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
    count: 0,
    avgDuration: 0,
  });
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [recentMeals, setRecentMeals] = useState<Meal[]>([]);

  const fetchWeightData = useCallback(async () => {
    try {
      const now = new Date();
      let startDate;

      if (timeframe === "week") {
        startDate = subDays(now, 7);
      } else if (timeframe === "month") {
        startDate = subMonths(now, 1);
      } else {
        startDate = subMonths(now, 12);
      }

      const response = await fetch(
        `/api/weight?from=${startDate.toISOString()}`
      );
      const data = await response.json();

      if (data.weights) {
        const labels = data.weights.map((w: WeightEntry) =>
          format(new Date(w.date), "MMM dd")
        );
        const weights = data.weights.map((w: WeightEntry) => w.weight);

        setWeightData({
          labels,
          datasets: [
            {
              label: "Weight (kg)",
              data: weights,
              borderColor: "rgb(99, 102, 241)",
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              tension: 0.3,
              borderWidth: 2,
              pointBackgroundColor: "rgb(79, 70, 229)",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching weight data:", error);
    }
  }, [timeframe]);

  const fetchWorkoutStats = useCallback(async () => {
    try {
      const now = new Date();
      let startDate;

      if (timeframe === "week") {
        startDate = subDays(now, 7);
      } else if (timeframe === "month") {
        startDate = subMonths(now, 1);
      } else {
        startDate = subMonths(now, 12);
      }

      const response = await fetch(
        `/api/workouts/stats?from=${startDate.toISOString()}`
      );
      const data = await response.json();

      setWorkoutStats({
        count: data.count || 0,
        avgDuration: data.avgDuration || 0,
      });
    } catch (error) {
      console.error("Error fetching workout stats:", error);
    }
  }, [timeframe]);

  const fetchRecentWorkouts = useCallback(async () => {
    try {
      const response = await fetch("/api/workouts?limit=3");
      const data = await response.json();

      if (data.workouts) {
        setRecentWorkouts(data.workouts);
      }
    } catch (error) {
      console.error("Error fetching recent workouts:", error);
    }
  }, []);

  const fetchRecentMeals = useCallback(async () => {
    try {
      const response = await fetch("/api/meals?limit=3");
      const data = await response.json();

      if (data.meals) {
        setRecentMeals(data.meals);
      }
    } catch (error) {
      console.error("Error fetching recent meals:", error);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchWeightData();
      fetchWorkoutStats();
      fetchRecentWorkouts();
      fetchRecentMeals();
    }
  }, [
    status,
    session,
    fetchWeightData,
    fetchWorkoutStats,
    fetchRecentWorkouts,
    fetchRecentMeals,
  ]);

  const navigateToWorkoutsWithModal = () => {
    router.push("/workouts?new=true");
  };

  const navigateToMeals = () => {
    router.push("/meals?new=true");
  };

  const navigateToWeight = () => {
    router.push("/weight?new=true");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-indigo-700">
            Loading your fitness data...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back,{" "}
          <span className="text-indigo-600">
            {session?.user?.name || "Fitness Enthusiast"}
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Track your fitness journey and monitor your progress.
        </p>
      </div>

      {/* Weight Progress Chart */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <TrendingUp className="mr-2 text-indigo-500 h-5 w-5" />
            Weight Progress
          </h2>
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setTimeframe("week")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                timeframe === "week"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-transparent text-gray-600 hover:text-indigo-600"
              }`}
              aria-label="Show weekly weight data"
              tabIndex={0}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe("month")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                timeframe === "month"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-transparent text-gray-600 hover:text-indigo-600"
              }`}
              aria-label="Show monthly weight data"
              tabIndex={0}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe("year")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                timeframe === "year"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-transparent text-gray-600 hover:text-indigo-600"
              }`}
              aria-label="Show yearly weight data"
              tabIndex={0}
            >
              Year
            </button>
          </div>
        </div>

        <div className="h-72">
          {weightData.labels && weightData.labels.length > 0 ? (
            <Line
              data={weightData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: "rgba(107, 114, 128, 0.1)",
                    },
                    ticks: {
                      color: "rgb(107, 114, 128)",
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: "rgb(107, 114, 128)",
                    },
                  },
                },
                plugins: {
                  legend: {
                    labels: {
                      color: "rgb(55, 65, 81)",
                      font: {
                        weight: "bold",
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: "rgba(79, 70, 229, 0.9)",
                    titleColor: "white",
                    bodyColor: "white",
                    borderColor: "white",
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    titleFont: {
                      size: 14,
                      weight: "bold",
                    },
                    bodyFont: {
                      size: 14,
                    },
                    callbacks: {
                      title: (tooltipItems) => tooltipItems[0].label,
                      label: (context) => `${context.parsed.y} kg`,
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500 mb-3">
                No weight data available for selected period.
              </p>
              <button
                onClick={navigateToWeight}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center text-sm font-medium"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Weight Entry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Stats and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Dumbbell className="mr-2 text-indigo-500 h-5 w-5" />
            {timeframe === "week"
              ? "Weekly"
              : timeframe === "month"
              ? "Monthly"
              : "Yearly"}{" "}
            Stats
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-xl text-white shadow-md">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-indigo-100">Workouts</p>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{workoutStats.count}</p>
              <p className="text-xs text-indigo-200 mt-1">
                {timeframe === "week"
                  ? "this week"
                  : timeframe === "month"
                  ? "this month"
                  : "this year"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-400 to-indigo-500 p-6 rounded-xl text-white shadow-md">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-indigo-100">
                  Avg. Duration
                </p>
                <div className="bg-white/20 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{workoutStats.avgDuration}</p>
              <p className="text-xs text-indigo-200 mt-1">
                minutes per workout
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <PlusCircle className="mr-2 text-indigo-500 h-5 w-5" />
            Quick Actions
          </h2>

          <div className="space-y-4">
            <button
              onClick={navigateToWeight}
              className="w-full px-4 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-1"
              aria-label="Add current weight"
              tabIndex={0}
            >
              <PlusCircle className="h-5 w-5 mr-3" />
              <span className="font-medium">Add Current Weight</span>
            </button>

            <button
              onClick={navigateToWorkoutsWithModal}
              className="w-full px-4 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-1"
              aria-label="Start quick workout"
              tabIndex={0}
            >
              <PlayCircle className="h-5 w-5 mr-3" />
              <span className="font-medium">Start Quick Workout</span>
            </button>

            <button
              onClick={navigateToMeals}
              className="w-full px-4 py-4 bg-white border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow transform hover:-translate-y-1"
              aria-label="Log a meal"
              tabIndex={0}
            >
              <Utensils className="h-5 w-5 mr-3" />
              <span className="font-medium">Log a Meal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Workouts */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Dumbbell className="mr-2 text-indigo-500 h-5 w-5" />
              Recent Workouts
            </h2>
            <button
              onClick={navigateToWorkoutsWithModal}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center transition-colors duration-200"
              tabIndex={0}
            >
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout) => (
                <a
                  key={workout.id}
                  href={`/workouts#${workout.id}`}
                  className="block p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">
                        {workout.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(workout.date), "MMM d, yyyy")}
                        {workout.duration && ` • ${workout.duration} min`}
                      </p>
                    </div>
                    <div className="bg-indigo-100 text-indigo-800 py-1.5 px-3 rounded-full text-xs font-medium">
                      {workout.exercises?.length || 0} exercises
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Dumbbell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">No recent workouts</p>
                <button
                  onClick={navigateToWorkoutsWithModal}
                  className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                >
                  Create your first workout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Meals */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Utensils className="mr-2 text-indigo-500 h-5 w-5" />
              Recent Meals
            </h2>
            <button
              onClick={navigateToMeals}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center transition-colors duration-200"
              tabIndex={0}
            >
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {recentMeals.length > 0 ? (
              recentMeals.map((meal) => (
                <a
                  key={meal.id}
                  href={`/meals?date=${format(
                    new Date(meal.date),
                    "yyyy-MM-dd"
                  )}`}
                  className="block p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-200 shadow-sm hover:shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{meal.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(meal.date), "MMM d, yyyy")}
                      </p>
                    </div>
                    {meal.calories && (
                      <div className="bg-indigo-100 text-indigo-800 py-1.5 px-3 rounded-full text-xs font-medium">
                        {meal.calories} kcal
                      </div>
                    )}
                  </div>
                  {(meal.protein || meal.carbs || meal.fat) && (
                    <div className="mt-3 flex space-x-2 text-xs">
                      {meal.protein && (
                        <span className="bg-purple-100 text-purple-800 py-1 px-2 rounded-full font-medium">
                          P: {meal.protein}g
                        </span>
                      )}
                      {meal.carbs && (
                        <span className="bg-amber-100 text-amber-800 py-1 px-2 rounded-full font-medium">
                          C: {meal.carbs}g
                        </span>
                      )}
                      {meal.fat && (
                        <span className="bg-rose-100 text-rose-800 py-1 px-2 rounded-full font-medium">
                          F: {meal.fat}g
                        </span>
                      )}
                    </div>
                  )}
                </a>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Utensils className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">No recent meals</p>
                <button
                  onClick={navigateToMeals}
                  className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                >
                  Add your first meal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
