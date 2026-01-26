import { RegisterForm, RegisterHero } from '@/features/core/auth';

export default function RegisterPage() {
  return (
    <div className="w-full max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <RegisterHero />
        <RegisterForm />
      </div>
    </div>
  );
}
