"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Image, FileText, Upload, Download, Trash2, Search } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { ConfirmationModal } from "@/components/ConfirmationModal";

type MediaTab = "image" | "document" | "all";

interface MediaFile {
    id: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    fileType: string;
    fileUrl: string;
    category: string;
    createdAt: string;
}

export default function MediaPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<MediaTab>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchMediaFiles();
        }
    }, [user, activeTab]);

    const fetchMediaFiles = async () => {
        try {
            setLoadingFiles(true);
            const token = localStorage.getItem("token");
            const category = activeTab === "all" ? "all" : activeTab;

            const response = await fetch(`/api/media?category=${category}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMediaFiles(data.files);
            }
        } catch (error) {
            console.error("Error fetching media files:", error);
        } finally {
            setLoadingFiles(false);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                await fetchMediaFiles();
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } else {
                const error = await response.json();
                alert(error.error || "Upload failed");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to upload file");
        } finally {
            setUploading(false);
        }
    };

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; fileId: string; fileName: string }>({
        isOpen: false,
        fileId: "",
        fileName: "",
    });

    const handleDeleteClick = (fileId: string, fileName: string) => {
        setDeleteModal({ isOpen: true, fileId, fileName });
    };

    const handleDeleteConfirm = async () => {
        const { fileId, fileName } = deleteModal;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/media?id=${fileId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await fetchMediaFiles();
            } else {
                alert("Failed to delete file");
            }
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file");
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    if (loading) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                backgroundColor: "var(--bg-main)",
            }}>
                <div style={{ fontSize: "var(--font-size-lg)", color: "var(--text-secondary)" }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!user) return null;

    const filteredItems = mediaFiles.filter((item) => {
        const matchesSearch = item.originalName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const tabs = [
        { id: "all" as MediaTab, label: "All Files", icon: FileText },
        { id: "image" as MediaTab, label: "Images", icon: Image },
        { id: "document" as MediaTab, label: "Documents", icon: FileText },
    ];

    return (
        <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--bg-main)" }}>
            <Sidebar />

            <div className="media-content-wrapper" style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
                <TopNav title="Media & Files" />

                {/* Header */}
                <div
                    className="media-header"
                    style={{
                        padding: "var(--spacing-4) var(--spacing-8)",
                        backgroundColor: "var(--bg-surface)",
                    }}
                >
                    <div className="media-header-top" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-4)" }}>
                        <div>
                            <h1
                                style={{
                                    fontSize: "var(--font-size-2xl)",
                                    fontWeight: "var(--font-weight-bold)",
                                    color: "var(--text-primary)",
                                    marginBottom: "var(--spacing-2)",
                                }}
                            >
                                Media & Files
                            </h1>
                            <p style={{ fontSize: "var(--font-size-base)", color: "var(--text-secondary)" }}>
                                View and manage your saved images and documents
                            </p>
                        </div>
                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleUpload}
                                style={{ display: "none" }}
                                accept="image/*,application/pdf,.doc,.docx,.txt"
                            />
                            <button
                                className="btn-primary"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--spacing-2)",
                                    padding: "var(--spacing-3) var(--spacing-5)",
                                }}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                <Upload size={18} />
                                {uploading ? "Uploading..." : "Upload Files"}
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div style={{ position: "relative" }}>
                        <Search
                            size={20}
                            color="var(--text-muted)"
                            style={{
                                position: "absolute",
                                left: "var(--spacing-4)",
                                top: "50%",
                                transform: "translateY(-50%)",
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "var(--spacing-3) var(--spacing-4) var(--spacing-3) 48px",
                                border: "1px solid var(--border-light)",
                                borderRadius: "var(--radius-md)",
                                fontSize: "var(--font-size-base)",
                                backgroundColor: "var(--bg-main)",
                                color: "var(--text-primary)",
                            }}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div
                    className="media-tabs"
                    style={{
                        display: "flex",
                        gap: "var(--spacing-2)",
                        padding: "var(--spacing-4) var(--spacing-8)",
                        borderBottom: "1px solid var(--border-light)",
                        backgroundColor: "var(--bg-surface)",
                    }}
                >
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--spacing-2)",
                                    padding: "var(--spacing-2) var(--spacing-4)",
                                    border: "none",
                                    borderRadius: "var(--radius-md)",
                                    backgroundColor: activeTab === tab.id ? "var(--color-primary)" : "transparent",
                                    color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                                    fontSize: "var(--font-size-sm)",
                                    fontWeight: "var(--font-weight-medium)",
                                    cursor: "pointer",
                                    transition: "all var(--transition-fast)",
                                }}
                                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Media Grid */}
                <div className="media-grid-container" style={{ flex: 1, padding: "var(--spacing-8)", overflow: "auto" }}>
                    {loadingFiles ? (
                        <div style={{ textAlign: "center", padding: "var(--spacing-10)", color: "var(--text-secondary)" }}>
                            Loading files...
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "var(--spacing-10)",
                                textAlign: "center",
                            }}
                        >
                            <Image size={64} color="var(--text-muted)" style={{ marginBottom: "var(--spacing-4)" }} />
                            <h3
                                style={{
                                    fontSize: "var(--font-size-lg)",
                                    fontWeight: "var(--font-weight-semibold)",
                                    color: "var(--text-primary)",
                                    marginBottom: "var(--spacing-2)",
                                }}
                            >
                                No files found
                            </h3>
                            <p style={{ fontSize: "var(--font-size-base)", color: "var(--text-secondary)" }}>
                                {searchQuery ? "Try a different search term" : "Upload files to get started"}
                            </p>
                        </div>
                    ) : (
                        <div
                            className="media-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                                gap: "var(--spacing-6)",
                            }}
                        >
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        backgroundColor: "var(--bg-surface)",
                                        border: "1px solid var(--border-light)",
                                        borderRadius: "var(--radius-lg)",
                                        overflow: "hidden",
                                        transition: "all var(--transition-fast)",
                                        cursor: "pointer",
                                    }}
                                    className="media-card"
                                >
                                    {/* Thumbnail */}
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "150px",
                                            backgroundColor: "var(--bg-main)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {item.category === "image" ? (
                                            <img
                                                src={item.fileUrl}
                                                alt={item.originalName}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <FileText size={48} color="var(--text-muted)" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div style={{ padding: "var(--spacing-4)" }}>
                                        <div
                                            style={{
                                                fontSize: "var(--font-size-sm)",
                                                fontWeight: "var(--font-weight-medium)",
                                                color: "var(--text-primary)",
                                                marginBottom: "var(--spacing-2)",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                            title={item.originalName}
                                        >
                                            {item.originalName}
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                fontSize: "var(--font-size-xs)",
                                                color: "var(--text-muted)",
                                                marginBottom: "var(--spacing-3)",
                                            }}
                                        >
                                            <span>{formatFileSize(item.fileSize)}</span>
                                            <span>{formatDate(item.createdAt)}</span>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                                            <a
                                                href={item.fileUrl}
                                                download={item.originalName}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    flex: 1,
                                                    padding: "var(--spacing-2)",
                                                    border: "1px solid var(--border-light)",
                                                    borderRadius: "var(--radius-md)",
                                                    backgroundColor: "transparent",
                                                    color: "var(--text-secondary)",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    transition: "all var(--transition-fast)",
                                                    textDecoration: "none",
                                                }}
                                                className="action-btn"
                                            >
                                                <Download size={16} />
                                            </a>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(item.id, item.originalName);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: "var(--spacing-2)",
                                                    border: "1px solid var(--border-light)",
                                                    borderRadius: "var(--radius-md)",
                                                    backgroundColor: "transparent",
                                                    color: "var(--text-secondary)",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    transition: "all var(--transition-fast)",
                                                }}
                                                className="action-btn delete-btn"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .tab-button:not(.active):hover {
                    background-color: var(--bg-main) !important;
                    color: var(--text-primary) !important;
                }

                .tab-button.active:hover {
                    background-color: var(--color-primary) !important;
                    opacity: 0.9;
                    color: white !important;
                }

                .media-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
                    border-color: var(--color-primary);
                }

                .action-btn:hover {
                    background-color: var(--bg-main) !important;
                    border-color: var(--color-primary) !important;
                    color: var(--color-primary) !important;
                }

                .delete-btn:hover {
                    border-color: #EF4444 !important;
                    color: #EF4444 !important;
                }

                @media (max-width: 768px) {
                    .media-content-wrapper {
                        padding-bottom: 70px !important; /* Bottom Nav Space */
                    }
                    .media-header, .media-tabs, .media-grid-container {
                        padding-left: var(--spacing-4) !important;
                        padding-right: var(--spacing-4) !important;
                    }
                    .media-header-top {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: var(--spacing-4) !important;
                    }
                    .media-tabs {
                        overflow-x: auto;
                        padding-bottom: var(--spacing-2) !important;
                    }
                    .media-grid {
                        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important;
                        gap: var(--spacing-4) !important;
                    }
                }
            `}</style>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleDeleteConfirm}
                title="Delete File"
                message={`Are you sure you want to delete "${deleteModal.fileName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
}
