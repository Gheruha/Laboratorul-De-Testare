export interface ChatDto {
  promptKey: string;
  userMessage: string;
  conversationId?: string;
}
export interface ChatResponseDto {
  reply: string;
}
