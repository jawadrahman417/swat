
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogInIcon, LayoutGridIcon, UserCircle, LogOutIcon, Loader2 } from 'lucide-react'; 
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const navLinks = [
  { href: '/', label: 'Feed', icon: LayoutGridIcon },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, loading, isFirebaseReady } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (!auth) {
        toast({ title: "Error", description: "Firebase not initialized.", variant: "destructive" });
        return;
    }
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/auth'); // Redirect to auth page after logout
    } catch (error: any) {
      toast({ title: "Logout Failed", description: error.message, variant: "destructive" });
    }
  };

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

      {loading || !isFirebaseReady ? (
        <Button variant="outline" className="text-sm font-medium px-3 py-2 rounded-md" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="hidden md:inline ml-2">Loading...</span>
        </Button>
      ) : user ? (
        <>
          <span className="text-sm text-muted-foreground hidden md:inline truncate max-w-[150px]" title={user.email || 'User'}>
            {user.email || 'User'}
          </span>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-sm font-medium px-3 py-2 rounded-md flex items-center space-x-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOutIcon className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </>
      ) : (
        <Link href="/auth" passHref>
          <Button variant="outline" className="text-sm font-medium px-3 py-2 rounded-md flex items-center space-x-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <LogInIcon className="h-4 w-4" />
            <span className="hidden md:inline">Login</span>
          </Button>
        </Link>
      )}
    </nav>
  );
}
