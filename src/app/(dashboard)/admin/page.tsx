import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatsCards } from "@/components/admin/StatsCards";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { AttendanceChart } from "@/components/admin/AttendanceChart";
import { LayoutDashboard } from "lucide-react";
import { startOfMonth, endOfMonth, startOfDay } from "date-fns";

export default async function AdminDashboard() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        redirect("/employee");
    }

    // Get total employees count
    const { count: totalEmployees } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("role", "employee");

    // Get today's active employees
    const today = startOfDay(new Date());
    const { data: todayAttendance } = await supabase
        .from("attendance")
        .select("user_id")
        .gte("check_in", today.toISOString());

    const activeToday = new Set(todayAttendance?.map((a) => a.user_id)).size;

    // Get pending salaries count
    const { count: pendingSalaries } = await supabase
        .from("salary_records")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

    // Get this month's total hours
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const { data: monthAttendance } = await supabase
        .from("attendance")
        .select("total_hours")
        .gte("check_in", monthStart.toISOString())
        .lte("check_in", monthEnd.toISOString())
        .not("total_hours", "is", null);

    const totalHoursThisMonth =
        monthAttendance?.reduce((sum, record) => sum + (record.total_hours || 0), 0) || 0;

    const stats = {
        totalEmployees: totalEmployees || 0,
        activeToday,
        pendingSalaries: pendingSalaries || 0,
        totalHoursThisMonth,
    };

    // Get recent audit logs
    const { data: auditLogs } = await supabase
        .from("audit_logs")
        .select("*, profile:profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(10);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your organization
                    </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <LayoutDashboard className="w-7 h-7 text-primary-foreground" />
                </div>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Chart */}
                <AttendanceChart />

                {/* Recent Activity */}
                <RecentActivity auditLogs={auditLogs || []} />
            </div>
        </div>
    );
}
