export interface SidebarItemDto {
  item_id: string;
  item_name: string;
  item_icon: string;
  position: number;
  href: string;
}

export interface SidebarGroup {
  group_id: string;
  group_name: string;
  icon: string;
  open_icon: string;
  position: number;
  sidebar_items: SidebarItemDto[];
}
