"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { showSuccessToast } from "@/lib/toast";

function RegistrationMessage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  useEffect(() => {
    if (registered) {
      showSuccessToast("Registration successful! You can now sign in.");
    }
  }, [registered]);

  return null;
}

export default function ClientWrapper() {
  return (
    <Suspense fallback={null}>
      <RegistrationMessage />
    </Suspense>
  );
}
