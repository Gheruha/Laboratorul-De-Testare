import { ChatDto } from '@/lib/types/chat.type';
import { ChatResponseDto } from '@/lib/types/chat.type';
import { HistoryItemDto } from '@/lib/types/history.type';
type ApiResponse<T = { message: string }> = T;

class ChatService {
  // Template for fetching endpoints
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`/api/aibot/${endpoint}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Request to ${endpoint} failed`);
      }

      return data as ApiResponse<T>;
    } catch (error: unknown) {
      console.error(`Error in ${endpoint}:`, (error as Error).message);
      throw error;
    }
  }

  async sendMessage(payload: ChatDto): Promise<ChatResponseDto> {
    return this.fetchApi('chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getMessages(conversationId: string): Promise<HistoryItemDto[]> {
    const { history } = await this.fetchApi<{ history: HistoryItemDto[] }>(
      `history?conversationId=${conversationId}`,
      { method: 'GET' },
    );
    return history;
  }
}

export const chatService = new ChatService();
