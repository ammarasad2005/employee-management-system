"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { startOfWeek, eachDayOfInterval, format } from "date-fns";

export function AttendanceChart() {
    const [data, setData] = useState<{ day: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
                const days = eachDayOfInterval({
                    start: weekStart,
                    end: new Date(),
                });

                const response = await fetch("/api/attendance");
                const result = await response.json();

                if (!response.ok || !result.data) {
                    setData([]);
                    return;
                }

                const attendanceByDay: Record<string, number> = {};

                days.forEach((day) => {
                    const dayKey = format(day, "EEE");
                    attendanceByDay[dayKey] = 0;
                });

                result.data.forEach((record: any) => {
                    const recordDate = new Date(record.check_in);
                    if (recordDate >= weekStart) {
                        const dayKey = format(recordDate, "EEE");
                        attendanceByDay[dayKey] = (attendanceByDay[dayKey] || 0) + 1;
                    }
                });

                const chartData = Object.entries(attendanceByDay).map(([day, count]) => ({
                    day,
                    count,
                }));

                setData(chartData);
            } catch (error) {
                console.error("Failed to fetch attendance data:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">This Week&apos;s Attendance</h2>
                <TrendingUp className="w-5 h-5 text-primary" />
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
            ) : data.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="day"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                                color: "hsl(var(--card-foreground))",
                            }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No attendance data
                </div>
            )}
        </div>
    );
}
