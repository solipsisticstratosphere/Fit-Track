"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
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
  ChartData,
} from "chart.js";
import { format, parseISO, subMonths } from "date-fns";
import Modal from "@/components/Modal";
import { useSearchParams } from "next/navigation";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Weight {
  id: string;
  weight: number;
  date: string;
  notes?: string;
  userId: string;
}

export default function WeightPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [weights, setWeights] = useState<Weight[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("3months"); // 1month, 3months, 6months, 1year, all
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState("");
  const [weightNotes, setWeightNotes] = useState("");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalWeight, setGoalWeight] = useState("");
  const [goalDate, setGoalDate] = useState("");

  // Weight entry modal (for adding via quick actions)
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightValue, setWeightValue] = useState("");
  const [weightDate, setWeightDate] = useState(new Date());

  // Inline weight entry form (directly in the table)
  const [inlineWeight, setInlineWeight] = useState("");
  const [inlineNotes, setInlineNotes] = useState("");
  const [inlineDate, setInlineDate] = useState(new Date());

  // Calculate chart data
  const chartData = useMemo<ChartData<"line", number[]>>(() => {
    if (!weights.length) {
      return { labels: [], datasets: [] };
    }

    // Sort by date
    const sortedWeights = [...weights].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedWeights.map((w) => format(parseISO(w.date), "MMM dd")),
      datasets: [
        {
          label: "Weight (kg)",
          data: sortedWeights.map((w) => w.weight),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          tension: 0.2,
        },
      ],
    };
  }, [weights]);

  // Calculate trend and goal projection
  const weightStats = useMemo(() => {
    if (weights.length < 2) {
      return {
        current: weights.length ? weights[weights.length - 1].weight : 0,
        change: 0,
        average: 0,
        trend: "stable",
      };
    }

    // Sort by date
    const sortedWeights = [...weights].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const latestWeight = sortedWeights[sortedWeights.length - 1].weight;
    const firstWeight = sortedWeights[0].weight;
    const change = latestWeight - firstWeight;
    const average =
      sortedWeights.reduce((sum, entry) => sum + entry.weight, 0) /
      sortedWeights.length;

    return {
      current: latestWeight,
      change,
      average: parseFloat(average.toFixed(1)),
      trend: change < 0 ? "decreasing" : change > 0 ? "increasing" : "stable",
    };
  }, [weights]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchWeights();

      // Check if we should open the new weight modal automatically
      if (searchParams.get("new") === "true") {
        handleAddWeight();
      }
    }
  }, [status, session, timeframe, searchParams]);

  const fetchWeights = async () => {
    setLoading(true);
    try {
      let url = "/api/weight";
      const params = new URLSearchParams();

      // Calculate date range based on timeframe
      if (timeframe !== "all") {
        let months = 1;
        if (timeframe === "3months") months = 3;
        if (timeframe === "6months") months = 6;
        if (timeframe === "1year") months = 12;

        const fromDate = subMonths(new Date(), months);
        params.append("from", fromDate.toISOString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.weights) {
        setWeights(data.weights);
      }
    } catch (error) {
      console.error("Error fetching weights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = () => {
    setWeightValue("");
    setWeightDate(new Date());
    setWeightNotes("");
    setShowWeightModal(true);
  };

  const handleSaveWeight = async () => {
    if (!weightValue) return;

    try {
      const response = await fetch("/api/weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: parseFloat(weightValue),
          date: weightDate.toISOString(),
          notes: weightNotes || null,
        }),
      });

      if (response.ok) {
        setShowWeightModal(false);
        // Refresh data
        fetchWeights();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Failed to add weight entry"}`);
      }
    } catch (error) {
      console.error("Error adding weight entry:", error);
      alert("Failed to add weight entry. Please try again.");
    }
  };

  const handleEditWeight = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId || !newWeight) return;

    try {
      const response = await fetch(`/api/weight/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: parseFloat(newWeight),
          notes: weightNotes,
        }),
      });

      if (response.ok) {
        setNewWeight("");
        setWeightNotes("");
        setEditingId(null);
        fetchWeights();
      }
    } catch (error) {
      console.error("Error updating weight:", error);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    if (!confirm("Are you sure you want to delete this weight entry?")) {
      return;
    }

    try {
      const response = await fetch(`/api/weight/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchWeights();
      }
    } catch (error) {
      console.error("Error deleting weight:", error);
    }
  };

  const startEdit = (weight: Weight) => {
    setEditingId(weight.id);
    setNewWeight(weight.weight.toString());
    setWeightNotes(weight.notes || "");
  };

  const handleExportCSV = () => {
    if (!weights.length) return;

    // Create CSV content
    const headers = "Date,Weight,Notes\n";
    const rows = weights
      .map(
        (w) =>
          `${format(parseISO(w.date), "yyyy-MM-dd")},${w.weight},"${
            w.notes || ""
          }"`
      )
      .join("\n");

    const csv = headers + rows;

    // Create download link
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weight-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveGoal = () => {
    // In a real app, this would save to backend
    localStorage.setItem(
      "weightGoal",
      JSON.stringify({
        targetWeight: parseFloat(goalWeight),
        targetDate: goalDate,
      })
    );

    setShowGoalModal(false);
  };

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inlineWeight) return;

    try {
      const response = await fetch("/api/weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: parseFloat(inlineWeight),
          date: inlineDate.toISOString(),
          notes: inlineNotes || null,
        }),
      });

      if (response.ok) {
        setInlineWeight("");
        setInlineNotes("");
        fetchWeights();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Failed to add weight entry"}`);
      }
    } catch (error) {
      console.error("Error adding weight entry:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate">
            Weight Tracking
          </h2>
          <p className="mt-1 text-lg text-gray-500">
            Monitor your weight progress over time
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 space-x-3">
          <button
            type="button"
            onClick={handleAddWeight}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Add weight entry"
            tabIndex={0}
          >
            Add Weight Entry
          </button>
          <button
            type="button"
            onClick={() => setShowGoalModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Set weight goal"
            tabIndex={0}
          >
            Set Goal
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Export weight data to CSV"
            tabIndex={0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Weight Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Current Weight
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {weightStats.current || "-"} kg
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Change
            </dt>
            <dd
              className={`mt-1 text-3xl font-semibold ${
                weightStats.change < 0
                  ? "text-green-600"
                  : weightStats.change > 0
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {weightStats.change > 0 ? "+" : ""}
              {weightStats.change} kg
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Average Weight
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {weightStats.average || "-"} kg
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Trend
            </dt>
            <dd
              className={`mt-1 text-3xl font-semibold ${
                weightStats.trend === "decreasing"
                  ? "text-green-600"
                  : weightStats.trend === "increasing"
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {weightStats.trend === "decreasing"
                ? "Losing"
                : weightStats.trend === "increasing"
                ? "Gaining"
                : "Stable"}
            </dd>
          </div>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-medium text-gray-900">Weight Progress</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeframe("1month")}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === "1month"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              aria-label="Show last month of weight data"
              tabIndex={0}
            >
              1M
            </button>
            <button
              onClick={() => setTimeframe("3months")}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === "3months"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              aria-label="Show last 3 months of weight data"
              tabIndex={0}
            >
              3M
            </button>
            <button
              onClick={() => setTimeframe("6months")}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === "6months"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              aria-label="Show last 6 months of weight data"
              tabIndex={0}
            >
              6M
            </button>
            <button
              onClick={() => setTimeframe("1year")}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === "1year"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              aria-label="Show last year of weight data"
              tabIndex={0}
            >
              1Y
            </button>
            <button
              onClick={() => setTimeframe("all")}
              className={`px-3 py-1 text-sm rounded-md ${
                timeframe === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              aria-label="Show all weight data"
              tabIndex={0}
            >
              All
            </button>
          </div>
        </div>

        <div className="h-80">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading weight data...</p>
            </div>
          ) : chartData.labels && chartData.labels.length > 0 ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                  },
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                No weight data available for selected period.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Weight History Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Weight History
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your historical weight entries
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              aria-label="Export weight data as CSV"
              tabIndex={0}
            >
              Export CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Weight (kg)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Notes
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Inline Add Weight Form */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="date"
                    value={format(inlineDate, "yyyy-MM-dd")}
                    onChange={(e) => setInlineDate(new Date(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Enter weight"
                    value={inlineWeight}
                    onChange={(e) => setInlineWeight(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    placeholder="Optional notes"
                    value={inlineNotes}
                    onChange={(e) => setInlineNotes(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    onClick={handleInlineSubmit}
                    className="text-indigo-600 hover:text-indigo-900 ml-4"
                  >
                    Add
                  </button>
                </td>
              </tr>

              {/* Weight Entries */}
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading weight entries...
                  </td>
                </tr>
              ) : weights.length > 0 ? (
                weights.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === entry.id ? (
                        <input
                          type="number"
                          step="0.1"
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      ) : (
                        `${entry.weight} kg`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.notes || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === entry.id ? (
                        <>
                          <button
                            type="button"
                            onClick={handleEditWeight}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-gray-500 hover:text-gray-700 ml-4"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(entry)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWeight(entry.id)}
                            className="text-red-600 hover:text-red-900 ml-4"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No weight entries yet. Add your first entry above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Goal Modal */}
      {showGoalModal && (
        <Modal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          title="Set Weight Goal"
          size="md"
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveGoal();
            }}
          >
            <div>
              <label
                htmlFor="goal-weight"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Target Weight (kg)
              </label>
              <input
                type="number"
                id="goal-weight"
                step="0.1"
                placeholder="Target weight in kg"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="goal-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Target Date
              </label>
              <input
                type="date"
                id="goal-date"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={goalDate ? format(new Date(goalDate), "yyyy-MM-dd") : ""}
                onChange={(e) => setGoalDate(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional: if not specified, no deadline will be set
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Cancel setting goal"
                tabIndex={0}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Save weight goal"
                tabIndex={0}
              >
                Save Goal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Weight Entry Modal */}
      {showWeightModal && (
        <Modal
          isOpen={showWeightModal}
          onClose={() => setShowWeightModal(false)}
          title="Add Weight Entry"
          size="md"
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveWeight();
            }}
          >
            <div>
              <label
                htmlFor="weight-value"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight-value"
                step="0.1"
                placeholder="Weight in kg"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={weightValue}
                onChange={(e) => setWeightValue(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="weight-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date
              </label>
              <input
                type="date"
                id="weight-date"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={format(weightDate, "yyyy-MM-dd")}
                onChange={(e) => setWeightDate(new Date(e.target.value))}
                required
              />
            </div>
            <div>
              <label
                htmlFor="weight-notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="weight-notes"
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                placeholder="Any notes about this weight measurement"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Cancel adding weight"
                tabIndex={0}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Save weight entry"
                tabIndex={0}
              >
                Save Entry
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
