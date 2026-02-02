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

// GET - Get single session with all messages
export async function GET(
    request: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const session = await prisma.aIChatSession.findFirst({
            where: {
                id: params.sessionId,
                userId: user.id
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json({ session });
    } catch (error) {
        console.error("Error fetching AI session:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// DELETE - Delete a session
export async function DELETE(
    request: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.aIChatSession.deleteMany({
            where: {
                id: params.sessionId,
                userId: user.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting AI session:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// PATCH - Update session title
export async function PATCH(
    request: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title } = await request.json();

        await prisma.aIChatSession.updateMany({
            where: {
                id: params.sessionId,
                userId: user.id
            },
            data: { title }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating AI session:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
