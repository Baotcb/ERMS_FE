import { Suspense } from 'react';
import { LoginForm, LoginHero } from '@/features/core/auth';
import { LoadingSpinner } from '@/components/common';

export default function LoginPage() {
  return (
    <div className="w-full max-w-5xl">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100 dark:border-gray-700">
        <Suspense fallback={<div className="flex w-full items-center justify-center py-16 md:w-1/2"><LoadingSpinner /></div>}>
          <LoginForm />
        </Suspense>
        <LoginHero />
      </div>
    </div>
  );
}
