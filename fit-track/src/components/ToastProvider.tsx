"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 5000,
        style: {
          background: "#ffffff",
          color: "#333333",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "0.5rem",
          padding: "0.75rem 1rem",
        },
        success: {
          style: {
            borderLeft: "4px solid #10B981",
          },
          iconTheme: {
            primary: "#10B981",
            secondary: "#FFFFFF",
          },
        },
        error: {
          style: {
            borderLeft: "4px solid #EF4444",
          },
          iconTheme: {
            primary: "#EF4444",
            secondary: "#FFFFFF",
          },
        },
        loading: {
          style: {
            borderLeft: "4px solid #6366F1",
          },
        },
      }}
    />
  );
}
