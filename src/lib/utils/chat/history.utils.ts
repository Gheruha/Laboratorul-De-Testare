import { createSupabaseClientApi } from '@/lib/supabase/client';
import { HistoryItemDto } from '@/lib/types/history.type';

export async function getChatConversationById(
  conversationId: string,
): Promise<HistoryItemDto[]> {
  const supabase = await createSupabaseClientApi();

  const { data, error } = await supabase
    .from('messages')
    .select('sender, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to load history:', error);
    throw new Error(error.message);
  }

  return data.map(row => ({
    from: row.sender as 'user' | 'bot',
    text: row.content,
  }));
}
