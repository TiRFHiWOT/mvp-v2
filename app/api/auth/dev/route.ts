import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email } = body;

        // Upsert User
        const user = await prisma.user.upsert({
            where: { email: email || 'dev@example.com' },
            update: {
                name: name || 'Dev User',
                status: 'online',
                lastSeen: new Date(),
            },
            create: {
                email: email || 'dev@example.com',
                name: name || 'Dev User',
                picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'dev'}`,
                status: 'online',
            },
        });

        const token = generateToken(user.id);

        return NextResponse.json({ user, token });
    } catch (error: any) {
        console.error('Dev Auth Error Details:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        });
        return NextResponse.json({
            error: 'Dev Authentication failed',
            details: error.message
        }, { status: 500 });
    }
}
