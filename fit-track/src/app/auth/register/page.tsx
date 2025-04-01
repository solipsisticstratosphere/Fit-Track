import RegisterForm from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register | FitTrack",
  description: "Create a FitTrack account",
};

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <RegisterForm />
    </div>
  );
}
