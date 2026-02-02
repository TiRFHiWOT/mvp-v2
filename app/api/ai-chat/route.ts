import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Get user from token
async function getUserFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as { userId: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        return user;
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken();
        const { message, conversationHistory, sessionId } = await request.json();

        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return NextResponse.json({
                response: "AI is not configured yet. Please add your GROQ_API_KEY to the environment variables.",
                error: "missing_api_key"
            });
        }

        // Build messages array for the API
        const messages = [
            {
                role: "system",
                content: `You are a helpful, friendly AI assistant. Keep your responses concise and natural. 
                         Be conversational and engaging. If asked about harmful, illegal, or dangerous topics,
                         politely decline and redirect the conversation to something positive.`
            },
            ...conversationHistory.map((msg: { role: string; content: string }) => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: "user",
                content: message
            }
        ];

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Groq API error:", errorData);
            return NextResponse.json({
                response: "Sorry, I'm having trouble connecting to the AI service. Please try again.",
                error: "api_error"
            }, { status: 500 });
        }

        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || "I couldn't generate a response.";

        // Save messages to database if user is logged in and sessionId is provided
        if (user && sessionId) {
            try {
                // Save user message
                await prisma.aIMessage.create({
                    data: {
                        sessionId: sessionId,
                        role: "user",
                        content: message
                    }
                });

                // Save AI response
                await prisma.aIMessage.create({
                    data: {
                        sessionId: sessionId,
                        role: "assistant",
                        content: aiResponse
                    }
                });

                // Update session title based on first message
                const sessionMessages = await prisma.aIMessage.count({
                    where: { sessionId: sessionId }
                });

                if (sessionMessages <= 2) {
                    // Generate title from first user message
                    const title = message.length > 30 ? message.substring(0, 30) + "..." : message;
                    await prisma.aIChatSession.update({
                        where: { id: sessionId },
                        data: { title }
                    });
                }

                // Update session timestamp
                await prisma.aIChatSession.update({
                    where: { id: sessionId },
                    data: { updatedAt: new Date() }
                });
            } catch (dbError) {
                console.error("Error saving messages to DB:", dbError);
                // Continue anyway - don't fail the chat just because DB save failed
            }
        }

        return NextResponse.json({ response: aiResponse });

    } catch (error) {
        console.error("AI Chat error:", error);
        return NextResponse.json({
            response: "An error occurred. Please try again.",
            error: "server_error"
        }, { status: 500 });
    }
}
