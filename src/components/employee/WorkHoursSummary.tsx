import { createClient } from "@/lib/supabase/server";
import { Clock } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { startOfWeek, endOfWeek } from "date-fns";

interface WorkHoursSummaryProps {
    userId: string;
}

export async function WorkHoursSummary({ userId }: WorkHoursSummaryProps) {
    const supabase = await createClient();

    // Get this week's attendance
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const { data: weekAttendance } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", userId)
        .gte("check_in", weekStart.toISOString())
        .lte("check_in", weekEnd.toISOString())
        .order("check_in", { ascending: false });

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">This Week&apos;s Hours</h2>
                <Clock className="w-5 h-5 text-primary" />
            </div>

            {weekAttendance && weekAttendance.length > 0 ? (
                <div className="space-y-3">
                    {weekAttendance.map((record) => (
                        <div
                            key={record.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-all"
                        >
                            <div>
                                <p className="font-medium">{formatDate(record.check_in)}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatTime(record.check_in)}
                                    {record.check_out && ` - ${formatTime(record.check_out)}`}
                                </p>
                            </div>
                            <div className="text-right">
                                {record.total_hours ? (
                                    <>
                                        <p className="text-2xl font-bold text-primary">
                                            {record.total_hours}
                                        </p>
                                        <p className="text-xs text-muted-foreground">hours</p>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm text-green-500">Active</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No attendance records this week</p>
                </div>
            )}
        </div>
    );
}
