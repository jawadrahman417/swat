// src/contexts/AuthContext.tsx
'use client';

import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/config'; // Ensure auth is exported from config
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    if (auth) { // Check if auth object is initialized
      setIsFirebaseReady(true);
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Firebase auth not ready (e.g. config missing, server render)
      // This case should ideally be handled by checking NEXT_PUBLIC_FIREBASE_API_KEY presence
      // For now, assume client side where auth should be available.
      setLoading(false); // Stop loading if auth is not available
      console.warn("Firebase Auth not initialized. Ensure Firebase config is correctly set in .env and consumed by config.ts");
    }
  }, []);

  if (loading && isFirebaseReady) { // Only show loader if Firebase is ready and still loading auth state
    return (
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isFirebaseReady && typeof window !== 'undefined') {
     // Optional: Show a message if Firebase is not configured on client-side
     // This might happen if .env variables are not set up
     if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        return (
             <div className="flex flex-col justify-center items-center min-h-screen w-full p-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-semibold text-destructive">Firebase Configuration Missing</p>
                <p className="text-sm text-muted-foreground">Please ensure Firebase is correctly configured in your environment variables.</p>
            </div>
        )
     }
  }


  return <AuthContext.Provider value={{ user, loading, isFirebaseReady }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
