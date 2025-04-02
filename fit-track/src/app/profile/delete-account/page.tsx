"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DeleteAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  };

  const handleConfirmTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmText(e.target.value);
    setError(null);
  };

  const validateForm = () => {
    if (!password) {
      setError("Password is required");
      return false;
    }

    if (confirmText !== "DELETE MY ACCOUNT") {
      setError("Please type &quot;DELETE MY ACCOUNT&quot; to confirm");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !session?.user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to delete account");
        return;
      }

      window.location.href = "/auth/login?deleted=true";
    } catch (error) {
      console.error("Error deleting account:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          aria-label="Back to profile"
          tabIndex={0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Profile</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Delete Account</h1>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-md mb-6">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">
              <strong>Warning:</strong> This action is permanent and cannot be
              undone. All your data will be deleted.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Enter your password to confirm
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Your current password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmText"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Type &quot;DELETE MY ACCOUNT&quot; to confirm
              </label>
              <input
                type="text"
                id="confirmText"
                value={confirmText}
                onChange={handleConfirmTextChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="DELETE MY ACCOUNT"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label="Delete account permanently"
              tabIndex={0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting Account...</span>
                </>
              ) : (
                <span>Delete Account Permanently</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
