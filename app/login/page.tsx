"use client";
// Force redeploy - removing test button


import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageSquare, Sparkles, Users, Zap } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSuccess = async (credentialResponse: any) => {
        try {
            setLoading(true);
            console.log("Login Success, verifying with backend...");

            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: credentialResponse.credential }),
            });

            if (!res.ok) throw new Error("Verification failed");

            const data = await res.json();

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);

            router.push("/");
        } catch (err) {
            console.error(err);
            setError("Failed to verify login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDevLogin = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/auth/dev", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Demo User", email: "demo@example.com" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Dev login failed");
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);
            router.push("/");
        } catch (e: any) {
            setError(e.message || "Dev login failed");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Animated Background Elements */}
            <div
                style={{
                    position: "absolute",
                    top: "10%",
                    left: "10%",
                    width: "300px",
                    height: "300px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                    filter: "blur(60px)",
                    animation: "float 6s ease-in-out infinite",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "10%",
                    right: "10%",
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                    filter: "blur(80px)",
                    animation: "float 8s ease-in-out infinite reverse",
                }}
            />

            <div
                style={{
                    display: "flex",
                    width: "100%",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "var(--spacing-6)",
                    alignItems: "center",
                    gap: "var(--spacing-10)",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* Left Side - Marketing Content */}
                <div
                    style={{
                        flex: 1,
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-8)",
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "var(--spacing-3)",
                                marginBottom: "var(--spacing-6)",
                            }}
                        >
                            <div
                                style={{
                                    width: "56px",
                                    height: "56px",
                                    borderRadius: "var(--radius-lg)",
                                    backgroundColor: "var(--color-primary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MessageSquare size={32} color="white" />
                            </div>
                            <h1
                                style={{
                                    fontSize: "32px",
                                    fontWeight: "var(--font-weight-bold)",
                                }}
                            >
                                ChatAI
                            </h1>
                        </div>

                        <h2
                            style={{
                                fontSize: "48px",
                                fontWeight: "var(--font-weight-bold)",
                                lineHeight: "1.2",
                                marginBottom: "var(--spacing-4)",
                            }}
                        >
                            Connect with anyone,
                            <br />
                            anywhere, instantly
                        </h2>

                        <p
                            style={{
                                fontSize: "var(--font-size-xl)",
                                opacity: 0.9,
                                lineHeight: "1.6",
                            }}
                        >
                            Experience seamless real-time messaging with a beautiful interface
                            designed for modern communication.
                        </p>
                    </div>

                    {/* Features */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "var(--spacing-4)",
                        }}
                    >
                        {[
                            {
                                icon: Zap,
                                title: "Lightning Fast",
                                description: "Real-time messaging powered by WebSockets",
                            },
                            {
                                icon: Users,
                                title: "Always Connected",
                                description: "See who's online and start chatting instantly",
                            },
                            {
                                icon: Sparkles,
                                title: "Beautiful Design",
                                description: "Pixel-perfect UI that's a joy to use",
                            },
                        ].map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "var(--spacing-3)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "var(--radius-md)",
                                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <h3
                                            style={{
                                                fontSize: "var(--font-size-lg)",
                                                fontWeight: "var(--font-weight-semibold)",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            {feature.title}
                                        </h3>
                                        <p style={{ opacity: 0.8, fontSize: "var(--font-size-base)" }}>
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div
                    style={{
                        width: "480px",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "var(--radius-xl)",
                            padding: "var(--spacing-10)",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        <div style={{ textAlign: "center", marginBottom: "var(--spacing-8)" }}>
                            <h2
                                style={{
                                    fontSize: "var(--font-size-2xl)",
                                    fontWeight: "var(--font-weight-bold)",
                                    color: "var(--text-primary)",
                                    marginBottom: "var(--spacing-2)",
                                }}
                            >
                                Welcome Back
                            </h2>
                            <p
                                style={{
                                    fontSize: "var(--font-size-base)",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                Sign in to start messaging with your friends
                            </p>
                        </div>

                        {error && (
                            <div
                                style={{
                                    padding: "var(--spacing-3) var(--spacing-4)",
                                    backgroundColor: "#FEE2E2",
                                    color: "#DC2626",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: "var(--font-size-sm)",
                                    marginBottom: "var(--spacing-6)",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "var(--spacing-4)",
                            }}
                        >
                            {/* Google Login */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    opacity: loading ? 0.5 : 1,
                                    pointerEvents: loading ? "none" : "auto",
                                }}
                            >
                                <GoogleLogin
                                    onSuccess={handleSuccess}
                                    onError={() => setError("Login Failed")}
                                    useOneTap
                                    theme="filled_blue"
                                    shape="pill"
                                    width="100%"
                                />
                            </div>

                            {/* Divider */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--spacing-3)",
                                    margin: "var(--spacing-2) 0",
                                }}
                            >
                                <div
                                    style={{
                                        flex: 1,
                                        height: "1px",
                                        backgroundColor: "var(--border-light)",
                                    }}
                                />
                                <span
                                    style={{
                                        fontSize: "var(--font-size-sm)",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Or
                                </span>
                                <div
                                    style={{
                                        flex: 1,
                                        height: "1px",
                                        backgroundColor: "var(--border-light)",
                                    }}
                                />
                            </div>

                            {/* Demo Login */}
                            <button
                                onClick={handleDevLogin}
                                disabled={loading}
                                className="btn-secondary"
                                style={{
                                    width: "100%",
                                    padding: "var(--spacing-3) var(--spacing-4)",
                                    fontSize: "var(--font-size-base)",
                                    fontWeight: "var(--font-weight-semibold)",
                                    opacity: loading ? 0.5 : 1,
                                    cursor: loading ? "not-allowed" : "pointer",
                                }}
                            >
                                {loading ? "Signing in..." : "Continue as Demo User"}
                            </button>


                        </div>

                        <p
                            style={{
                                marginTop: "var(--spacing-6)",
                                fontSize: "var(--font-size-xs)",
                                color: "var(--text-muted)",
                                textAlign: "center",
                                lineHeight: "1.5",
                            }}
                        >
                            By signing in, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @media (max-width: 768px) {
          div:first-child > div {
            flex-direction: column;
          }
          div:first-child > div > div:first-child {
            display: none;
          }
        }
      `}</style>
        </div>
    );
}
