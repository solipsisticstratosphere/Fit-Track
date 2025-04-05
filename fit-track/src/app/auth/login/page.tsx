import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | FitTrack",
  description: "Sign in to your FitTrack account",
};

import ClientWrapper from "./ClientWrapper";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <ClientWrapper />
      <LoginForm />
    </div>
  );
}
