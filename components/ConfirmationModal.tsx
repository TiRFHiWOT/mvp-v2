"use client";

import { X, AlertTriangle, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "info" | "warning";
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "info",
}: ConfirmationModalProps) {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnimate(true);
        } else {
            setAnimate(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case "danger":
                return <AlertTriangle size={24} color="#EF4444" />;
            case "warning":
                return <AlertTriangle size={24} color="#F59E0B" />;
            default:
                return <Info size={24} color="var(--color-primary)" />;
        }
    };

    const getConfirmButtonStyle = () => {
        const baseStyle = {
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "none",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all var(--transition-fast)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        };

        switch (type) {
            case "danger":
                return {
                    ...baseStyle,
                    backgroundColor: "#EF4444",
                    color: "white",
                };
            case "warning":
                return {
                    ...baseStyle,
                    backgroundColor: "#F59E0B",
                    color: "white",
                };
            default:
                return {
                    ...baseStyle,
                    backgroundColor: "var(--color-primary)",
                    color: "white",
                };
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 9999,
                    backdropFilter: "blur(2px)",
                    opacity: animate ? 1 : 0,
                    transition: "opacity 0.2s ease-in-out",
                }}
            />

            {/* Modal */}
            <div
                style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) scale(${animate ? 1 : 0.95})`,
                    backgroundColor: "var(--bg-surface)",
                    borderRadius: "16px",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    zIndex: 10000,
                    width: "90%",
                    maxWidth: "400px",
                    opacity: animate ? 1 : 0,
                    transition: "all 0.2s ease-in-out",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "24px 24px 0 24px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "16px",
                    }}
                >
                    <div
                        style={{
                            padding: "10px",
                            borderRadius: "50%",
                            backgroundColor: type === "danger" ? "#FEF2F2" : type === "warning" ? "#FFFBEB" : "var(--bg-main)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        {getIcon()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3
                            style={{
                                fontSize: "18px",
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                margin: "0 0 8px 0",
                            }}
                        >
                            {title}
                        </h3>
                        <p
                            style={{
                                fontSize: "14px",
                                color: "var(--text-secondary)",
                                margin: 0,
                                lineHeight: "1.5",
                            }}
                        >
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--text-muted)",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: "-4px",
                            marginRight: "-4px",
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "24px",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-light)",
                            backgroundColor: "transparent",
                            color: "var(--text-secondary)",
                            fontSize: "14px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all var(--transition-fast)",
                        }}
                        className="modal-cancel-btn"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={getConfirmButtonStyle()}
                        className={`modal-confirm-btn-${type}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .modal-cancel-btn:hover {
                    background-color: var(--bg-main) !important;
                    color: var(--text-primary) !important;
                }
                
                .modal-confirm-btn-danger:hover {
                    background-color: #DC2626 !important;
                }
                
                .modal-confirm-btn-warning:hover {
                    background-color: #D97706 !important;
                }
                
                .modal-confirm-btn-info:hover {
                    opacity: 0.9;
                }
            `}</style>
        </>
    );
}
