'use client';

import { useEffect } from 'react';
import { sidebarService } from '@/lib/services/api/sidebar.api';
import { SidebarGroup, SidebarItemDto } from '@/lib/types/sidebar.type';
import { SidebarStructureDto } from '@/lib/types/supabase.type';
import { useSidebarStore } from '@/lib/store/sidebar.store';

// Type-guard to confirm we really have an array of SidebarItemDto
const isSidebarItemArray = (val: unknown): val is SidebarItemDto[] =>
  Array.isArray(val) &&
  val.every(
    (item): item is SidebarItemDto =>
      typeof (item as SidebarItemDto).item_id === 'string' &&
      typeof (item as SidebarItemDto).item_name === 'string' &&
      typeof (item as SidebarItemDto).item_icon === 'string' &&
      typeof (item as SidebarItemDto).position === 'number',
  );

export function useSidebarData() {
  const groups = useSidebarStore(s => s.groups);
  const setGroups = useSidebarStore(s => s.setGroups);

  useEffect(() => {
    (async () => {
      try {
        const data: SidebarStructureDto[] =
          await sidebarService.getDefaultOptions();

        const mapped: SidebarGroup[] = data.map(g => ({
          group_id: g.group_id,
          group_name: g.group_name,
          icon: g.icon,
          open_icon: g.open_icon,
          position: g.position,
          sidebar_items: isSidebarItemArray(g.sidebar_items)
            ? g.sidebar_items
            : [],
        }));

        setGroups(mapped);
      } catch (e) {
        console.error('Failed to load sidebar:', e);
      }
    })();
  }, [setGroups]);

  return groups;
}
