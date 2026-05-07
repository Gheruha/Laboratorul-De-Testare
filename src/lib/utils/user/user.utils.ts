import { createSupabaseClientServiceRole } from '@/lib/supabase/client';

// Check if user exist in Supabase database
export const checkUserExists = async (email: string): Promise<boolean> => {
  const supabaseServiceRole = createSupabaseClientServiceRole();
  const { data: users, error } =
    await supabaseServiceRole.auth.admin.listUsers();

  if (error || !users) {
    console.error('Failed to fetch user:', error?.message);
    throw new Error(
      error?.message || 'Error fetching users from the database.',
    );
  }

  return users?.users.some(u => u.email === email) ?? false;
};
