'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { AppProvider } from '@/context/AppContext';
import { Loader2 } from 'lucide-react';
import { AuthProvider } from '@/context/AuthContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('MainLayout: Auth check effect running. Loading:', loading, 'User:', user);
    if (!loading && !user) {
      console.log('MainLayout: User not found and not loading, redirecting to /login');
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    console.log('MainLayout: Rendering loader because loading is', loading, 'or user is', user);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  console.log('MainLayout: User authenticated, rendering AppLayout.');
  return (
      <AppProvider>
        <AppLayout>{children}</AppLayout>
      </AppProvider>
  );
}
