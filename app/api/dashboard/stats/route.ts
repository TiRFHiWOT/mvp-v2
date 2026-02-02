
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const userId = decoded.userId;

        // Fetch stats in parallel
        const [messageCount, mediaCount, docCount, sessionCount] = await Promise.all([
            // Total messages sent by the user
            prisma.message.count({
                where: { senderId: userId },
            }),
            // Media files (images and videos)
            prisma.media.count({
                where: {
                    userId: userId,
                    category: { in: ["image", "video"] },
                },
            }),
            // Documents
            prisma.media.count({
                where: {
                    userId: userId,
                    category: "document",
                },
            }),
            // Active Chats (sessions involved in)
            prisma.chatSession.count({
                where: {
                    OR: [
                        { user1Id: userId },
                        { user2Id: userId },
                    ],
                },
            }),
        ]);

        return NextResponse.json({
            messages: messageCount,
            media: mediaCount,
            documents: docCount,
            contacts: sessionCount, // Approximate contacts count via active sessions
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
