import type React from 'react';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-secondary text-secondary-foreground py-6 text-center">
        <p>&copy; {new Date().getFullYear()} PropSwap. All rights reserved.</p>
      </footer>
    </div>
  );
}
