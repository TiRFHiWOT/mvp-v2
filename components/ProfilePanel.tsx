"use client";

import { X, Bell, FileText, Image as ImageIcon } from "lucide-react";

export function ProfilePanel({ onClose }: { onClose?: () => void }) {
    return (
        <div className="flex h-full w-80 flex-col border-l border-border bg-background">
            <div className="flex items-center justify-between p-6 pb-2">
                <h3 className="text-lg font-bold text-foreground">Contact Info</h3>
                <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex flex-col items-center p-6 text-center">
                <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=alice"
                    alt="Profile"
                    className="h-24 w-24 rounded-full bg-muted object-cover"
                />
                <h2 className="mt-4 text-xl font-bold text-foreground">Alice Freeman</h2>
                <p className="text-sm text-muted-foreground">Product Designer</p>

                <div className="mt-6 flex w-full justify-center space-x-8">
                    <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                            <ImageIcon className="h-5 w-5" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-muted-foreground">Media</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                            <FileText className="h-5 w-5" />
                        </div>
                        <span className="mt-2 text-xs font-medium text-muted-foreground">Files</span>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Shared Media</h4>
                <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="aspect-square rounded-lg bg-orange-100"></div>
                    <div className="aspect-square rounded-lg bg-blue-100"></div>
                    <div className="aspect-square rounded-lg bg-green-100"></div>
                    <div className="aspect-square rounded-lg bg-purple-100"></div>
                    <div className="aspect-square rounded-lg bg-pink-100"></div>
                    <div className="aspect-square rounded-lg bg-yellow-100"></div>
                </div>
            </div>
        </div>
    );
}
