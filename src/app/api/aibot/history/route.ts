import { NextRequest, NextResponse } from 'next/server';
import { getChatConversationById } from '@/lib/utils/chat/history.utils';
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversation id' },
        { status: 400 },
      );
    }

    // Fetch previous messages
    const history = await getChatConversationById(conversationId);

    return NextResponse.json({
      history,
    });
  } catch (error: unknown) {
    console.error('Chat error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
