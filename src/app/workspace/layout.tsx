'use client';
import { WorkspaceHeader } from '@/components/headers/workspaceHeader';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useSidebarStore } from '@/lib/store/sidebar.store';
import { AppSidebar } from '@/components/app-sidebar/app-sidebar';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const toggleCollapse = useSidebarStore(s => s.toggleCollapse);
  return (
    <SidebarProvider>
      <WorkspaceHeader />
      <AppSidebar />
      <SidebarInset className="min-w-0 pt-14">
        <div className="sticky top-12 z-30 flex h-10 items-center border-b bg-background/95 px-3 backdrop-blur">
          <SidebarTrigger onClick={toggleCollapse} />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
