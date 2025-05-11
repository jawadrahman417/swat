import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-200px)]"> {/* Adjust min-h based on header/footer */}
      <AuthForm />
    </div>
  );
}
