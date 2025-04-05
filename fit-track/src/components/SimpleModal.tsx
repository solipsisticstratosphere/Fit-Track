"use client";

import { useEffect, useRef } from "react";

interface SimpleModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export default function SimpleModal({ onClose, children }: SimpleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-lg w-full max-w-md z-10 overflow-auto max-h-[99vh]"
      >
        {children}
      </div>
    </div>
  );
}
