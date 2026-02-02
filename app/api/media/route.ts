import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category"); // "image", "document", "all"
        const sessionId = searchParams.get("sessionId");

        // Build query
        const where: any = {
            userId: decoded.userId,
        };

        if (category && category !== "all") {
            where.category = category;
        }

        if (sessionId) {
            where.sessionId = sessionId;
        }

        // Fetch media files
        const mediaFiles = await prisma.media.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                fileName: true,
                originalName: true,
                fileSize: true,
                fileType: true,
                fileUrl: true,
                category: true,
                createdAt: true,
                sessionId: true,
            },
        });

        return NextResponse.json({
            files: mediaFiles,
            count: mediaFiles.length,
        });
    } catch (error) {
        console.error("Error fetching media files:", error);
        return NextResponse.json(
            { error: "Failed to fetch media files" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const fileId = searchParams.get("id");

        if (!fileId) {
            return NextResponse.json({ error: "File ID required" }, { status: 400 });
        }

        // Verify the file belongs to the user
        const file = await prisma.media.findFirst({
            where: {
                id: fileId,
                userId: decoded.userId,
            },
        });

        if (!file) {
            return NextResponse.json(
                { error: "File not found or unauthorized" },
                { status: 404 }
            );
        }

        // Delete from database
        await prisma.media.delete({
            where: {
                id: fileId,
            },
        });

        // TODO: Also delete the physical file from the filesystem
        // This would require importing fs and unlinking the file

        return NextResponse.json({
            success: true,
            message: "File deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting media file:", error);
        return NextResponse.json(
            { error: "Failed to delete file" },
            { status: 500 }
        );
    }
}
