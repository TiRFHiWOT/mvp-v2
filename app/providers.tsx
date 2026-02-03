"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/hooks/useTheme";

export function Providers({ children }: { children: React.ReactNode }) {
    // NOTE: In a real app, use an environment variable for the Client ID.
    // For this MVP demo, if the user hasn't provided one, we might need a placeholder or instructions.
    // I'll place a placeholder here.
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    if (!clientId && typeof window !== 'undefined') {
        console.warn("Google Client ID is missing. Google Login will not work. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in environment variables.");
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </GoogleOAuthProvider>
    );
}
