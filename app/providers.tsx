"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/hooks/useTheme";

export function Providers({ children }: { children: React.ReactNode }) {
    // NOTE: In a real app, use an environment variable for the Client ID.
    // For this MVP demo, if the user hasn't provided one, we might need a placeholder or instructions.
    // I'll place a placeholder here.
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </GoogleOAuthProvider>
    );
}
