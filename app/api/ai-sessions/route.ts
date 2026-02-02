import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getUserById } from "@/lib/auth";

// Get user from authorization header
async function getUserFromRequest(request: NextRequest) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
        return null;
    }

    return await getUserById(decoded.userId);
}

// GET - List all AI chat sessions for user
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sessions = await prisma.aIChatSession.findMany({
            where: { userId: user.id },
            orderBy: { updatedAt: "desc" },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error("Error fetching AI sessions:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST - Create new AI chat session
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const session = await prisma.aIChatSession.create({
            data: {
                userId: user.id,
                title: "New Chat"
            }
        });

        return NextResponse.json({ session });
    } catch (error) {
        console.error("Error creating AI session:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
