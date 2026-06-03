import { NextResponse, NextRequest } from 'next/server';
import { ChatDto } from '@/lib/types/chat.type';
import { generateChatBotReply, saveMessage } from '@/lib/utils/chat/chat.utils';
export async function POST(req: NextRequest) {
  try {
    // Taking the key(type of bot) and user message
    const { promptKey, userMessage, conversationId } =
      (await req.json()) as ChatDto;

    // Make sure userMessage is non-empty and not absurdly long:
    if (typeof userMessage !== 'string' || userMessage.trim().length === 0) {
      return NextResponse.json(
        { message: 'Your message cannot be empty' },
        { status: 400 },
      );
    }
    if (userMessage.length > 2000) {
      return NextResponse.json(
        { message: 'Your message is too long' },
        { status: 400 },
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { message: 'Missing conversationId.' },
        { status: 400 },
      );
    }

    // Saving user's message in db
    await saveMessage({
      conversationId,
      sender: 'user',
      content: userMessage,
    });

    // Calling the function that deals with the api and receiving the bot reply
    const reply = await generateChatBotReply({
      promptKey,
      userMessage,
      conversationId,
    });

    // Save the bot’s reply in db
    await saveMessage({
      conversationId,
      sender: 'bot',
      content: reply,
    });

    return NextResponse.json({
      reply,
    });

    // Catch any error
  } catch (error: unknown) {
    console.error('Chat error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
