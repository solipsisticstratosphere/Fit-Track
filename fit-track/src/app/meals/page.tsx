"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { format, parseISO } from "date-fns";
import Modal from "@/components/Modal";
import { useSearchParams } from "next/navigation";
import {
  Utensils,
  Calendar,
  Plus,
  Clock,
  FileText,
  ImageIcon,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

export default function MealsPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isNewMeal, setIsNewMeal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New meal form
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealProtein, setMealProtein] = useState("");
  const [mealCarbs, setMealCarbs] = useState("");
  const [mealFat, setMealFat] = useState("");
  const [mealNotes, setMealNotes] = useState("");
  const [mealImage, setMealImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchMeals();

      
      if (searchParams.get("new") === "true") {
        openMealModal();
      }
    }
  }, [status, session, selectedDate, searchParams]);

  const fetchMeals = async () => {
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
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

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
          <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate flex items-center">
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
              className="p-2.5 text-gray-500 hover:text-indigo-600 focus:outline-none"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <input
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="block px-3 py-2 border-0 focus:outline-none focus:ring-0 sm:text-sm"
            />
            <button
              onClick={handleNextDay}
              className="p-2.5 text-gray-500 hover:text-indigo-600 focus:outline-none"
              aria-label="Next day"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => openMealModal()}
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            aria-label="Add meal"
            tabIndex={0}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Meal
          </button>
        </div>
      </div>

      {/* Daily Nutrition Summary */}
      <div className="bg-white shadow-md overflow-hidden rounded-xl mb-8 border border-gray-100">
        <div className="px-6 py-5 bg-indigo-50 border-b border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
            Daily Nutrition Summary
          </h3>
          <p className="mt-1 text-sm text-indigo-600 font-medium">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-xl border border-indigo-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                  Calories
                </h4>
                <div className="bg-indigo-200 p-1.5 rounded-full">
                  <Utensils className="h-4 w-4 text-indigo-700" />
                </div>
              </div>
              <p className="text-2xl font-bold text-indigo-900">
                {dailyTotals.calories}{" "}
                <span className="text-sm font-medium">kcal</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
                  Protein
                </h4>
                <div className="bg-purple-200 p-1.5 rounded-full">
                  <Utensils className="h-4 w-4 text-purple-700" />
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {dailyTotals.protein}{" "}
                <span className="text-sm font-medium">g</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                  Carbs
                </h4>
                <div className="bg-amber-200 p-1.5 rounded-full">
                  <Utensils className="h-4 w-4 text-amber-700" />
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-900">
                {dailyTotals.carbs}{" "}
                <span className="text-sm font-medium">g</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Fat
                </h4>
                <div className="bg-emerald-200 p-1.5 rounded-full">
                  <Utensils className="h-4 w-4 text-emerald-700" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-900">
                {dailyTotals.fat} <span className="text-sm font-medium">g</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="bg-white shadow-md overflow-hidden rounded-xl border border-gray-100">
        <div className="px-6 py-5 bg-indigo-50 border-b border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
            <Utensils className="mr-2 h-5 w-5 text-indigo-600" />
            Your Meals
          </h3>
          <p className="mt-1 text-sm text-indigo-600">
            Your meal entries for {format(selectedDate, "MMMM d, yyyy")}
          </p>
        </div>

        <ul className="divide-y divide-gray-100">
          {loading ? (
            <li className="px-6 py-8 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">Loading meals...</p>
            </li>
          ) : meals.length > 0 ? (
            meals.map((meal) => (
              <li
                key={meal.id}
                className="p-5 hover:bg-indigo-50 cursor-pointer transition-colors duration-200"
                onClick={() => openMealModal(meal)}
              >
                <div className="flex items-start">
                  {meal.imageUrl ? (
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={meal.imageUrl || "/placeholder.svg"}
                        alt={meal.name}
                        className="h-20 w-20 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 mr-4 h-20 w-20 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Utensils className="h-8 w-8 text-indigo-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-medium text-indigo-700">
                        {meal.name}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                        {format(parseISO(meal.date), "h:mm a")}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {meal.calories !== null && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {meal.calories} kcal
                        </span>
                      )}
                      {meal.protein !== null && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {meal.protein}g protein
                        </span>
                      )}
                      {meal.carbs !== null && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {meal.carbs}g carbs
                        </span>
                      )}
                      {meal.fat !== null && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {meal.fat}g fat
                        </span>
                      )}
                    </div>
                    {meal.notes && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-1 flex items-center">
                        <FileText className="h-4 w-4 mr-1.5 text-gray-400" />
                        {meal.notes}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="bg-indigo-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
                  <Utensils className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">
                  No meals recorded
                </h3>
                <p className="mt-2 text-gray-500">
                  Get started by adding your first meal for this day. Track your
                  calories, protein, carbs, and fat.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => openMealModal()}
                    className="inline-flex items-center px-5 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    aria-label="Add meal"
                    tabIndex={0}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Meal
                  </button>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Meal Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={isNewMeal ? "Add Meal" : "Edit Meal"}
          size="2xl"
        >
          <form onSubmit={handleSubmitMeal} className="space-y-5">
            <div>
              <label
                htmlFor="meal-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Meal Name
              </label>
              <input
                type="text"
                id="meal-name"
                placeholder="Enter meal name"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="calories"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  id="calories"
                  placeholder="Calories"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="protein"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Protein (g)
                </label>
                <input
                  type="number"
                  id="protein"
                  placeholder="Protein"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={mealProtein}
                  onChange={(e) => setMealProtein(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="carbs"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Carbs (g)
                </label>
                <input
                  type="number"
                  id="carbs"
                  placeholder="Carbohydrates"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={mealCarbs}
                  onChange={(e) => setMealCarbs(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="fat"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fat (g)
                </label>
                <input
                  type="number"
                  id="fat"
                  placeholder="Fat"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={mealFat}
                  onChange={(e) => setMealFat(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="meal-notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="meal-notes"
                rows={3}
                placeholder="Optional notes about this meal"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meal Image
              </label>
              <div className="mt-1 flex items-center space-x-5">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Meal preview"
                      className="h-24 w-24 object-cover rounded-lg shadow-sm border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setMealImage(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <label
                    htmlFor="meal-image"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </label>
                  <input
                    id="meal-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a photo of your meal (optional)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                aria-label="Cancel adding meal"
                tabIndex={0}
              >
                Cancel
              </button>
              {!isNewMeal && selectedMeal && (
                <button
                  type="button"
                  onClick={() => handleDeleteMeal(selectedMeal.id)}
                  className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  aria-label="Delete meal"
                  tabIndex={0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                aria-label={isNewMeal ? "Add meal" : "Save changes"}
                tabIndex={0}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isNewMeal ? "Adding..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isNewMeal ? "Add Meal" : "Save Changes"}
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
