import { ChatDto } from '@/lib/types/chat.type';
import { createSupabaseClientApi } from '@/lib/supabase/client';
import { HistoryItemDto } from '@/lib/types/history.type';
import { getChatConversationById } from './history.utils';

// Saves both user and bot messages inside db
export const saveMessage = async ({
  conversationId,
  sender,
  content,
}: {
  conversationId: string;
  sender: 'user' | 'bot';
  content: string;
}): Promise<void> => {
  const supabase = await createSupabaseClientApi();

  const { error } = await supabase.from('messages').insert([
    {
      conversation_id: conversationId,
      sender,
      content,
    },
  ]);

  if (error) {
    console.error(
      `Error saving ${sender} message to conversation ${conversationId}:`,
      error,
    );
  }
};

// Generates
export const generateChatBotReply = async ({
  promptKey,
  userMessage,
  conversationId,
}: ChatDto): Promise<string> => {
  if (!conversationId) {
    throw new Error('Missing conversationId');
  }

  const supabase = await createSupabaseClientApi();

  //Load the system prompt
  const { data: systemPrompt, error: rpcErr } = await supabase.rpc(
    'get_prompt',
    { p_key: promptKey },
  );
  if (rpcErr || !systemPrompt) {
    console.error('No prompt for key', rpcErr);
    throw new Error('System prompt not found');
  }

  //Load full history from DB
  const history: HistoryItemDto[] =
    await getChatConversationById(conversationId);

  //Turn HistoryItemDto[] into OpenAI messages
  const historyMessages = history.map(m => ({
    role: m.from === 'bot' ? 'assistant' : 'user',
    content: m.text,
  }));

  //Build the final messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    { role: 'user', content: userMessage },
  ];

  //Call OpenAI with the entire context
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini',
      messages,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error('OpenAI error:', err);
    throw new Error(err.error?.message || 'OpenAI request failed');
  }

  const { choices } = await res.json();
  return choices[0].message.content;
};
