import { LoginBrandPanel, LoginForm } from '@/components/login';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Section */}
      <LoginBrandPanel />

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <LoginForm />
      </div>
    </div>
  );
}
