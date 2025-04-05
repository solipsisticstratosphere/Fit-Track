"use client";

import type React from "react";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import SimpleModal from "@/components/SimpleModal";
import { useSearchParams } from "next/navigation";
import {
  Utensils,
  Plus,
  ImageIcon,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

interface Meal {
  id: string;
  name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  date: string;
  imageUrl: string | null;
  notes: string | null;
}

function MealsContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isNewMeal, setIsNewMeal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealProtein, setMealProtein] = useState("");
  const [mealCarbs, setMealCarbs] = useState("");
  const [mealFat, setMealFat] = useState("");
  const [mealNotes, setMealNotes] = useState("");
  const [mealImage, setMealImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    try {
      const dateString = format(selectedDate, "yyyy-MM-dd");

      const response = await fetch(`/api/meals?date=${dateString}`);
      const data = await response.json();

      if (data.meals) {
        setMeals(data.meals);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchMeals();

      if (searchParams.get("new") === "true") {
        openMealModal();
      }
    }
  }, [status, session, selectedDate, searchParams, fetchMeals]);

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const openMealModal = (meal?: Meal) => {
    if (meal) {
      setSelectedMeal(meal);
      setMealName(meal.name);
      setMealCalories(meal.calories?.toString() || "");
      setMealProtein(meal.protein?.toString() || "");
      setMealCarbs(meal.carbs?.toString() || "");
      setMealFat(meal.fat?.toString() || "");
      setMealNotes(meal.notes || "");
      setImagePreview(meal.imageUrl);
      setIsNewMeal(false);
    } else {
      setSelectedMeal(null);
      setMealName("");
      setMealCalories("");
      setMealProtein("");
      setMealCarbs("");
      setMealFat("");
      setMealNotes("");
      setMealImage(null);
      setImagePreview(null);
      setIsNewMeal(true);
    }
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMealImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!mealName) return;

    try {
      const formData = new FormData();
      formData.append("name", mealName);
      formData.append("date", selectedDate.toISOString());

      if (mealCalories) formData.append("calories", mealCalories);
      if (mealProtein) formData.append("protein", mealProtein);
      if (mealCarbs) formData.append("carbs", mealCarbs);
      if (mealFat) formData.append("fat", mealFat);
      if (mealNotes) formData.append("notes", mealNotes);
      if (mealImage) formData.append("image", mealImage);

      let url = "/api/meals";
      let method = "POST";

      if (!isNewMeal && selectedMeal) {
        url = `/api/meals/${selectedMeal.id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        setShowModal(false);
        fetchMeals();
      }
    } catch (error) {
      console.error("Error saving meal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) {
      return;
    }

    try {
      const response = await fetch(`/api/meals/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMeals();
        if (showModal) setShowModal(false);
      }
    } catch (error) {
      console.error("Error deleting meal:", error);
    }
  };

  const calculateDailyTotals = () => {
    return meals.reduce(
      (totals, meal) => {
        return {
          calories: totals.calories + (meal.calories || 0),
          protein: totals.protein + (meal.protein || 0),
          carbs: totals.carbs + (meal.carbs || 0),
          fat: totals.fat + (meal.fat || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-indigo-700">
            Loading your nutrition data...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/login");
  }

  const dailyTotals = calculateDailyTotals();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate flex items-center h-20">
            <Utensils className="mr-3 h-8 w-8 text-indigo-600" />
            Meals & Nutrition
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Track your daily food intake and monitor your nutrition
          </p>
        </div>
        <div className="mt-5 flex md:mt-0 space-x-3">
          <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={handlePreviousDay}
              className="p-2 rounded-l-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="px-4 py-2 text-gray-700 font-medium border-l border-r border-gray-200">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </div>
            <button
              onClick={handleNextDay}
              className="p-2 rounded-r-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              aria-label="Next day"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <button
            onClick={() => openMealModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Meal
          </button>
        </div>
      </div>

      {/* Daily summary card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 border-b border-indigo-800">
          <h3 className="text-lg font-medium text-white">Daily Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="text-sm font-medium text-indigo-600 mb-1">
                Total Calories
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {dailyTotals.calories} kcal
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-sm font-medium text-green-600 mb-1">
                Protein
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {dailyTotals.protein}g
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="text-sm font-medium text-yellow-600 mb-1">
                Carbs
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {dailyTotals.carbs}g
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-sm font-medium text-red-600 mb-1">Fat</div>
              <div className="text-2xl font-bold text-gray-800">
                {dailyTotals.fat}g
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meals list */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-indigo-600 border-b border-indigo-700">
          <h3 className="text-lg font-medium text-white">Today&apos;s Meals</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-indigo-600">Loading meals...</p>
          </div>
        ) : meals.length === 0 ? (
          <div className="p-12 text-center">
            <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No meals logged
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              You haven&apos;t logged any meals for this day yet. Click the
              button below to add your first meal.
            </p>
            <button
              onClick={() => openMealModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add a Meal
            </button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {meals.map((meal) => (
                <li
                  key={meal.id}
                  onClick={() => openMealModal(meal)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="px-6 py-4 flex items-center">
                    <div className="flex-shrink-0 h-14 w-14 bg-gray-100 rounded-lg overflow-hidden mr-4">
                      {meal.imageUrl ? (
                        <Image
                          src={meal.imageUrl}
                          alt={meal.name}
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Utensils className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900 truncate">
                        {meal.name}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        {meal.calories !== null && (
                          <span className="mr-3">{meal.calories} kcal</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="flex space-x-4">
                        <div
                          className="text-xs flex flex-col items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeal(meal.id);
                          }}
                        >
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            aria-label="Delete meal"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Meal Modal */}
      {showModal && (
        <SimpleModal onClose={() => setShowModal(false)}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isNewMeal ? "Add New Meal" : "Edit Meal"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitMeal}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="mealName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Meal Name
                  </label>
                  <input
                    type="text"
                    id="mealName"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter meal name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="mealCalories"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      id="mealCalories"
                      value={mealCalories}
                      onChange={(e) => setMealCalories(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mealProtein"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      id="mealProtein"
                      value={mealProtein}
                      onChange={(e) => setMealProtein(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mealCarbs"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      id="mealCarbs"
                      value={mealCarbs}
                      onChange={(e) => setMealCarbs(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="mealFat"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      id="mealFat"
                      value={mealFat}
                      onChange={(e) => setMealFat(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mealNotes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Notes
                  </label>
                  <textarea
                    id="mealNotes"
                    value={mealNotes}
                    onChange={(e) => setMealNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Add any notes about this meal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Meal Image
                  </label>
                  <div className="mt-1 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Meal preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </div>
                    <label
                      htmlFor="meal-image-upload"
                      className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      Change
                      <input
                        id="meal-image-upload"
                        name="meal-image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  disabled={isSubmitting || !mealName}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </SimpleModal>
      )}
    </div>
  );
}

export default function MealsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-indigo-700">Loading meals...</p>
          </div>
        </div>
      }
    >
      <MealsContent />
    </Suspense>
  );
}
