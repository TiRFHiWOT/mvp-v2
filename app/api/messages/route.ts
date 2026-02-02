import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { content, senderId, receiverId } = body;

        if (!content || !senderId || !receiverId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Save to Database
        const message = await prisma.message.create({
            data: {
                content,
                senderId,
            },
            include: {
                sender: true,
            }
        });

        // Trigger Pusher Event
        // Channel: chat-{userId} (subscription model) or just 'global-chat' for MVP simplicity?
        // Let's use specific channel for the receiver to listen to.
        // Actually, for this MVP where we might not have full auth on client side socket subscription:
        // We will broadcast to 'chat-app' channel with event 'new-message'.
        // Clients will filter if it belongs to them.

        await pusherServer.trigger('chat-app', 'new-message', message);

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Message Error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
