import { AppLayout } from '@/components/AppLayout';
import { AppProvider } from '@/context/AppContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <AppLayout>{children}</AppLayout>
    </AppProvider>
  );
}
