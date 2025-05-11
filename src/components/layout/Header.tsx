import Link from 'next/link';
import Navigation from './Navigation';
import { HomeIcon } from 'lucide-react'; // Using HomeIcon as a placeholder logo

export default function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
          <HomeIcon className="h-8 w-8" />
          <span>PropSwap</span>
        </Link>
        <Navigation />
      </div>
    </header>
  );
}
