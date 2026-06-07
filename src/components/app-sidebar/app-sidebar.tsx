'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useSidebarData } from '@/app/workspace/handleFunctions';
import { IconResolver } from '@/components/iconResolver/iconResolver';
import { useSidebarStore } from '@/lib/store/sidebar.store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  // Sidebar attributes
  const isCollapsed = useSidebarStore(s => s.isCollapsed);

  // Groups inside sidebar attributes
  const groups = useSidebarData();
  const openGroupIds = useSidebarStore(s => s.openGroupIds);
  const openGroup = useSidebarStore(s => s.openGroup);
  const closeGroup = useSidebarStore(s => s.closeGroup);
  const pathname = usePathname();

  // UI
  return (
    <Sidebar
      className="mt-12 border-border bg-white dark:bg-zinc-950"
      collapsed={isCollapsed}
    >
      <SidebarContent className="bg-white pt-4 dark:bg-zinc-950">
        {/* Getting all the group */}
        {groups.map(group => {
          // Knowing all the groups that were opened before
          const isGroupOpen = openGroupIds.includes(group.group_id);
          return (
            <Collapsible
              key={group.group_id}
              className="w-full"
              open={isGroupOpen}
              onOpenChange={open =>
                open ? openGroup(group.group_id) : closeGroup(group.group_id)
              }
            >
              <CollapsibleTrigger className="collapsible-trigger button-ghost flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <p>{group.group_name}</p>
                </div>
                <IconResolver name={group.icon} size={16} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent className="motion-preset-fade space-y-2">
                  {/* Getting all the specific group items */}
                  {group.sidebar_items.map(item => (
                    <Button
                      key={item.item_id}
                      variant={pathname === item.href ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href={item.href}>
                        <IconResolver name={item.item_icon} size={16} />
                        <span className="truncate">{item.item_name}</span>
                      </Link>
                    </Button>
                  ))}
                  {group.sidebar_items.length === 0 && (
                    <p className="px-4 py-2 text-xs text-muted-foreground">
                      No published lessons found.
                    </p>
                  )}
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="bg-white dark:bg-zinc-950" />
    </Sidebar>
  );
}
