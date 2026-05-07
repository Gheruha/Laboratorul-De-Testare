export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: unknown }
  | Json[];
export interface SidebarStructureDto {
  group_id: string;
  group_name: string;
  icon: string;
  open_icon: string;
  position: number;
  sidebar_items: Json;
}
