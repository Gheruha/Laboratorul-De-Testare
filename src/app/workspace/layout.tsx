'use client';
import { AppSidebar } from '@/components/app-sidebar/app-sidebar';
import { WorkspaceHeader } from '@/components/headers/workspaceHeader';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useSidebarStore } from '@/lib/store/sidebar.store';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const toggleCollapse = useSidebarStore(s => s.toggleCollapse);
  return (
    <SidebarProvider>
      <WorkspaceHeader />
      <main className="w-full h-[100vh]">
        <SidebarTrigger onClick={toggleCollapse} className="mt-16" />
        {children}
      </main>
    </SidebarProvider>
  );
}
