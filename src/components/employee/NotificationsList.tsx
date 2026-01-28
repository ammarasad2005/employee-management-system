"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { getRelativeTime, getPriorityColor } from "@/lib/utils";
import type { Notification } from "@/types";

interface NotificationsListProps {
    notifications: (Notification & {
        notification_reads?: { read_at: string }[];
    })[];
}

export function NotificationsList({ notifications }: NotificationsListProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Notifications</h2>
                <Link
                    href="/employee/notifications"
                    className="text-sm text-primary hover:underline"
                >
                    View All
                </Link>
            </div>

            {notifications && notifications.length > 0 ? (
                <div className="space-y-3">
                    {notifications.map((notification) => {
                        const isRead = notification.notification_reads?.[0]?.read_at;

                        return (
                            <div
                                key={notification.id}
                                className={`p-4 rounded-lg border transition-all ${isRead
                                        ? "bg-secondary/30 border-border/50"
                                        : "bg-secondary/50 border-border hover:border-primary/50"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${getPriorityColor(
                                            notification.priority
                                        )}`}
                                    >
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-medium truncate">
                                                {notification.title}
                                            </h3>
                                            {!isRead && (
                                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {getRelativeTime(notification.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No notifications</p>
                </div>
            )}
        </div>
    );
}
