"use client";

import { useSearchParams } from "next/navigation";

export default function ClientWrapper() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  if (!registered) return null;

  return (
    <div className="w-full max-w-md mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center text-green-800">
      Registration successful! You can now sign in with your credentials.
    </div>
  );
}
