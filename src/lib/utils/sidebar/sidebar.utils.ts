import { createSupabaseClientApi } from '@/lib/supabase/client';
import { SidebarStructureDto } from '@/lib/types/supabase.type';

// Getting all the sidebar options from db
export const getDefaultSidebarOptions = async (): Promise<
  SidebarStructureDto[]
> => {
  const supabase = await createSupabaseClientApi();
  const { data, error } = await supabase.rpc('get_sidebar_structure');
  console.log('Database call happens', data);
  if (error) {
    console.error('Error while getting sidebar options', error.message);
    throw new Error(error.message || 'Failed to get sidebar options');
  }

  return data ?? [];
};
