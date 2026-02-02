import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

async function verifyAuth(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) return null;
    return { id: decoded.userId };
}


// GET: Fetch all notifications for the current user
export async function GET(req: Request) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        picture: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a notification (Internal or potentially useful for testing)
export async function POST(req: Request) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userId, type, title, description, senderId } = body;

        if (!userId || !type || !title) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                description,
                senderId: senderId || user.id, // Defaults to current user as sender if not provided, or can be null
            },
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Error creating notification:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH: Mark one or all notifications as read
export async function PATCH(req: Request) {
    try {
        const user = await verifyAuth(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, all } = body;

        if (all) {
            await prisma.notification.updateMany({
                where: { userId: user.id, read: false },
                data: { read: true },
            });
            return NextResponse.json({ success: true, message: "All notifications marked as read" });
        }

        if (id) {
            const notification = await prisma.notification.findUnique({
                where: { id },
            });

            if (!notification || notification.userId !== user.id) {
                return NextResponse.json({ error: "Notification not found or access denied" }, { status: 404 });
            }

            const updated = await prisma.notification.update({
                where: { id },
                data: { read: true },
            });
            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    } catch (error) {
        console.error("Error updating notification:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
