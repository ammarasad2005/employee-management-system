import { Shield } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import type { AuditLog } from "@/types";

interface RecentActivityProps {
    auditLogs: (AuditLog & { profile?: { full_name: string } })[];
}

const actionLabels: Record<string, string> = {
    check_in: "Checked in",
    check_out: "Checked out",
    create_attendance: "Created attendance record",
    create_notification: "Created notification",
    create_salary: "Created salary record",
    update_salary: "Updated salary record",
    mark_paid: "Marked salary as paid",
    create_user: "Created new user",
    update_user: "Updated user",
};

export function RecentActivity({ auditLogs }: RecentActivityProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Activity</h2>
                <Shield className="w-5 h-5 text-primary" />
            </div>

            {auditLogs && auditLogs.length > 0 ? (
                <div className="space-y-3">
                    {auditLogs.map((log) => (
                        <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all"
                        >
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-medium">
                                        {log.profile?.full_name || "System"}
                                    </span>{" "}
                                    <span className="text-muted-foreground">
                                        {actionLabels[log.action] || log.action}
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {getRelativeTime(log.created_at)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No activity yet</p>
                </div>
            )}
        </div>
    );
}
