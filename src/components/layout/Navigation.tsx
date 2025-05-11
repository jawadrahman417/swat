'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UploadIcon, MessageSquareIcon, LogInIcon, LayoutGridIcon } from 'lucide-react'; // Removed MapIcon

const navLinks = [
  { href: '/', label: 'Feed', icon: LayoutGridIcon },
  // { href: '/map', label: 'Map', icon: MapIcon }, // Removed Map link
  { href: '/upload', label: 'Upload', icon: UploadIcon },
  { href: '/chat', label: 'Chat', icon: MessageSquareIcon },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-2 md:space-x-4">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link key={link.href} href={link.href} passHref>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                "text-sm font-medium",
                isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent/10",
                "px-3 py-2 rounded-md flex items-center space-x-2"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <link.icon className="h-4 w-4" />
              <span className="hidden md:inline">{link.label}</span>
            </Button>
          </Link>
        );
      })}
      <Link href="/auth" passHref>
        <Button variant="outline" className="text-sm font-medium px-3 py-2 rounded-md flex items-center space-x-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
          <LogInIcon className="h-4 w-4" />
          <span className="hidden md:inline">Login</span>
        </Button>
      </Link>
    </nav>
  );
}
