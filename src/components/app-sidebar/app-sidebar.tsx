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

export function AppSidebar() {
  // Sidebar attributes
  const isCollapsed = useSidebarStore(s => s.isCollapsed);

  // Groups inside sidebar attributes
  const groups = useSidebarData();
  const openGroupIds = useSidebarStore(s => s.openGroupIds);
  const toggleGroup = useSidebarStore(s => s.toggleGroup);

  // UI
  return (
    <Sidebar className="mt-12" collapsed={isCollapsed}>
      <SidebarContent className="pt-4">
        {/* Getting all the group */}
        {groups.map(group => {
          // Knowing all the groups that were opened before
          const isGroupOpen = openGroupIds.includes(group.group_id);
          return (
            <Collapsible
              key={group.group_id}
              className="w-full"
              open={isGroupOpen}
              onOpenChange={() => toggleGroup(group.group_id)}
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
                      variant="ghost"
                      className="w-full flex justify-start items-center space-x-2"
                    >
                      <IconResolver name={item.item_icon as string} size={16} />
                      <p>{item.item_name}</p>
                    </Button>
                  ))}
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
