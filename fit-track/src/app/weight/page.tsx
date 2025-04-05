"use client";

import type React from "react";

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
  type ChartData,
} from "chart.js";
import { format, parseISO, subMonths } from "date-fns";
import Modal from "@/components/Modal";
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Calendar,
  Plus,
  Save,
  Download,
  Target,
  Edit,
  Trash2,
  Check,
  X,
  BarChart4,
  ArrowRight,
  ArrowDown,
  ArrowUp,
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

interface Weight {
  id: string;
  weight: number;
  date: string;
  notes?: string;
  userId: string;
}

export default function WeightPage() {
  const { data: session, status } = useSession();
  const [weights, setWeights] = useState<Weight[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("3months");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightValue, setWeightValue] = useState("");
  const [weightDate, setWeightDate] = useState(new Date());

  const [inlineWeight, setInlineWeight] = useState("");
  const [inlineNotes, setInlineNotes] = useState("");
  const [inlineDate, setInlineDate] = useState(new Date());

  const chartData = useMemo<ChartData<"line", number[]>>(() => {
    if (!weights.length) {
      return { labels: [], datasets: [] };
    }

    const sortedWeights = [...weights].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedWeights.map((w) => format(parseISO(w.date), "MMM dd")),
      datasets: [
        {
          label: "Weight (kg)",
          data: sortedWeights.map((w) => w.weight),
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
    };
  }, [weights]);

  const weightStats = useMemo(() => {
    if (weights.length < 2) {
      return {
        current: weights.length ? weights[weights.length - 1].weight : 0,
        change: 0,
        average: 0,
        trend: "stable",
      };
    }

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
      average: Number.parseFloat(average.toFixed(1)),
      trend: change < 0 ? "decreasing" : change > 0 ? "increasing" : "stable",
    };
  }, [weights]);

  useEffect(() => {
    if (status === "authenticated" && session?.user && "id" in session.user) {
      fetchWeights();
    }
  }, [status, session, timeframe]);

  const fetchWeights = async () => {
    setLoading(true);
    try {
      let url = "/api/weight";
      const params = new URLSearchParams();

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
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: Number.parseFloat(weightValue),
          date: weightDate.toISOString(),
          notes: weightNotes || null,
        }),
      });

      if (response.ok) {
        setShowWeightModal(false);
        fetchWeights();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Failed to add weight entry"}`);
      }
    } catch (error) {
      console.error("Error adding weight entry:", error);
      alert("Failed to add weight entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWeight = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId || !newWeight) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/weight/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: Number.parseFloat(newWeight),
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
    } finally {
      setIsSubmitting(false);
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

  const handleInlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inlineWeight) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/weight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: Number.parseFloat(inlineWeight),
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-indigo-700">Loading your weight data...</p>
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
          <h2 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl sm:truncate flex items-center h-20 ">
            <Scale className="mr-3 h-8 w-8 text-indigo-600" />
            Weight Tracking
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Monitor your weight progress over time
          </p>
        </div>
        <div className="mt-5 flex md:mt-0 space-x-3">
          <button
            type="button"
            onClick={handleAddWeight}
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            aria-label="Add weight entry"
            tabIndex={0}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Weight Entry
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label="Export weight data to CSV"
            tabIndex={0}
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Weight Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-2">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Current Weight
              </dt>
              <div className="bg-indigo-100 p-2 rounded-full">
                <Scale className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <dd className="text-3xl font-bold text-indigo-700">
              {weightStats.current || "-"}{" "}
              <span className="text-lg font-medium">kg</span>
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-2">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Change
              </dt>
              <div
                className={`p-2 rounded-full ${
                  weightStats.change < 0
                    ? "bg-green-100"
                    : weightStats.change > 0
                    ? "bg-red-100"
                    : "bg-gray-100"
                }`}
              >
                {weightStats.change < 0 ? (
                  <ArrowDown className="h-5 w-5 text-green-600" />
                ) : weightStats.change > 0 ? (
                  <ArrowUp className="h-5 w-5 text-red-600" />
                ) : (
                  <ArrowRight className="h-5 w-5 text-gray-600" />
                )}
              </div>
            </div>
            <dd
              className={`text-3xl font-bold ${
                weightStats.change < 0
                  ? "text-green-600"
                  : weightStats.change > 0
                  ? "text-red-600"
                  : "text-gray-700"
              }`}
            >
              {weightStats.change > 0 ? "+" : ""}
              {weightStats.change}{" "}
              <span className="text-lg font-medium">kg</span>
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-2">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Average Weight
              </dt>
              <div className="bg-indigo-100 p-2 rounded-full">
                <BarChart4 className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <dd className="text-3xl font-bold text-indigo-700">
              {weightStats.average || "-"}{" "}
              <span className="text-lg font-medium">kg</span>
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-md rounded-xl border border-gray-100">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-2">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Trend
              </dt>
              <div
                className={`p-2 rounded-full ${
                  weightStats.trend === "decreasing"
                    ? "bg-green-100"
                    : weightStats.trend === "increasing"
                    ? "bg-red-100"
                    : "bg-gray-100"
                }`}
              >
                {weightStats.trend === "decreasing" ? (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                ) : weightStats.trend === "increasing" ? (
                  <TrendingUp className="h-5 w-5 text-red-600" />
                ) : (
                  <ArrowRight className="h-5 w-5 text-gray-600" />
                )}
              </div>
            </div>
            <dd
              className={`text-3xl font-bold ${
                weightStats.trend === "decreasing"
                  ? "text-green-600"
                  : weightStats.trend === "increasing"
                  ? "text-red-600"
                  : "text-gray-700"
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
      <div className="bg-white shadow-md overflow-hidden rounded-xl mb-8 border border-gray-100">
        <div className="px-6 py-5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
            <BarChart4 className="mr-2 h-5 w-5 text-indigo-600" />
            Weight Progress
          </h3>
          <div className="flex space-x-2 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setTimeframe("1month")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                timeframe === "1month"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
              aria-label="Show last month of weight data"
              tabIndex={0}
            >
              1M
            </button>
            <button
              onClick={() => setTimeframe("3months")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                timeframe === "3months"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
              aria-label="Show last 3 months of weight data"
              tabIndex={0}
            >
              3M
            </button>
            <button
              onClick={() => setTimeframe("6months")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                timeframe === "6months"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
              aria-label="Show last 6 months of weight data"
              tabIndex={0}
            >
              6M
            </button>
            <button
              onClick={() => setTimeframe("1year")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                timeframe === "1year"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
              aria-label="Show last year of weight data"
              tabIndex={0}
            >
              1Y
            </button>
            <button
              onClick={() => setTimeframe("all")}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                timeframe === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
              aria-label="Show all weight data"
              tabIndex={0}
            >
              All
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="ml-3 text-gray-500">Loading weight data...</p>
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
                <Scale className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 mb-3">
                  No weight data available for selected period.
                </p>
                <button
                  type="button"
                  onClick={handleAddWeight}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center text-sm font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Weight Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weight History Table */}
      <div className="bg-white shadow-md overflow-hidden rounded-xl border border-gray-100">
        <div className="px-6 py-5 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-indigo-800 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
              Weight History
            </h3>
            <p className="mt-1 text-sm text-indigo-600">
              Your historical weight entries
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              aria-label="Export weight data as CSV"
              tabIndex={0}
            >
              <Download className="h-4 w-4 mr-2" />
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
              <tr className="bg-indigo-50/50">
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
                    disabled={isSubmitting}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </>
                    )}
                  </button>
                </td>
              </tr>

              {/* Weight Entries */}
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p>Loading weight entries...</p>
                  </td>
                </tr>
              ) : weights.length > 0 ? (
                weights.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(new Date(entry.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {editingId === entry.id ? (
                        <input
                          type="number"
                          step="0.1"
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      ) : (
                        <span className="font-medium">{entry.weight} kg</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingId === entry.id ? (
                        <input
                          type="text"
                          value={weightNotes}
                          onChange={(e) => setWeightNotes(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Add notes (optional)"
                        />
                      ) : (
                        entry.notes || "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingId === entry.id ? (
                        <>
                          <button
                            type="button"
                            onClick={handleEditWeight}
                            disabled={isSubmitting}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 mr-2"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Save
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(entry)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 mr-2"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWeight(entry.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="bg-indigo-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
                        <Scale className="h-8 w-8 text-indigo-600" />
                      </div>
                      <h3 className="mt-4 text-xl font-medium text-gray-900">
                        No weight entries yet
                      </h3>
                      <p className="mt-2 text-gray-500">
                        Start tracking your weight progress by adding your first
                        entry above.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Weight Entry Modal */}
      {showWeightModal && (
        <Modal
          isOpen={showWeightModal}
          onClose={() => setShowWeightModal(false)}
          title="Add Weight Entry"
          size="md"
        >
          <form
            className="space-y-5"
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
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                placeholder="Any notes about this weight measurement"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="inline-flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                aria-label="Cancel adding weight"
                tabIndex={0}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                aria-label="Save weight entry"
                tabIndex={0}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Entry
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
