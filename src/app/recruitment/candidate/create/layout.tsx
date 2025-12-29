import React from "react";

interface HRLayoutProps {
  children: React.ReactNode;
}

export default function HRLayout({ children }: HRLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background px-6 py-3">
        <h1 className="text-lg font-semibold">HR Recruitment Portal</h1>
      </header>
      <main className="flex-1 container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}
