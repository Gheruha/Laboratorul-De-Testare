import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HistoryItemDto } from '../types/history.type';

interface ChatStore {
  conversationId: string | null;
  history: HistoryItemDto[];

  // Actions:
  setConversationId: (id: string) => void;
  addUserMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    set => ({
      conversationId: null,
      history: [],

      setConversationId: (id: string) => set({ conversationId: id }),

      addUserMessage: (text: string) =>
        set(state => ({
          history: [...state.history, { from: 'user', text }],
        })),

      addBotMessage: (text: string) =>
        set(state => ({
          history: [...state.history, { from: 'bot', text }],
        })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'chat-storage',
    },
  ),
);
