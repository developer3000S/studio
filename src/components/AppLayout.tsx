'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, Pill, ClipboardList, PackageCheck, BarChart3, Sparkles, Stethoscope } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/patients', label: 'Пациенты', icon: Users },
    { href: '/medications', label: 'Медикаменты', icon: Pill },
    { href: '/prescriptions', label: 'Назначения', icon: ClipboardList },
    { href: '/dispensations', label: 'Выдачи', icon: PackageCheck },
    { href: '/reports', label: 'Отчеты', icon: BarChart3 },
    { href: '/ai-insights', label: 'AI Insights', icon: Sparkles },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                <Link href="/">
                    <Stethoscope className="h-6 w-6 text-sidebar-primary" />
                </Link>
             </Button>
            <h1 className="text-xl font-semibold font-headline text-sidebar-primary">MediTrack Rx</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <div className="flex items-center gap-3 p-2">
                <Avatar>
                    <AvatarImage src="https://placehold.co/40x40" alt="User" />
                    <AvatarFallback>MP</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">Мед. Персонал</span>
                    <span className="text-xs text-sidebar-foreground/70">doctor@medtrack.rx</span>
                </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
             {/* Can add page specific headers here */}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
