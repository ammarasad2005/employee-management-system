import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckInButton } from "@/components/employee/CheckInButton";
import { WorkHoursSummary } from "@/components/employee/WorkHoursSummary";
import { SalarySummary } from "@/components/employee/SalarySummary";
import { NotificationsList } from "@/components/employee/NotificationsList";
import { Clock, DollarSign, Bell, Calendar } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";

export default async function EmployeeDashboard() {
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

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayAttendance } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", user.id)
        .gte("check_in", today.toISOString())
        .order("check_in", { ascending: false })
        .limit(1)
        .single();

    // Get this month's total hours
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const { data: monthAttendance } = await supabase
        .from("attendance")
        .select("total_hours")
        .eq("user_id", user.id)
        .gte("check_in", monthStart.toISOString())
        .lte("check_in", monthEnd.toISOString())
        .not("total_hours", "is", null);

    const totalHours =
        monthAttendance?.reduce((sum, record) => sum + (record.total_hours || 0), 0) || 0;

    // Get current month salary estimate
    const estimatedSalary =
        profile?.salary_type === "hourly" && profile.hourly_rate
            ? totalHours * profile.hourly_rate
            : profile?.monthly_salary || 0;

    // Get recent notifications
    const { data: notifications } = await supabase
        .from("notifications")
        .select(`
      *,
      notification_reads (
        read_at
      )
    `)
        .or(`target_role.eq.all,target_role.eq.${profile?.role}`)
        .order("created_at", { ascending: false })
        .limit(5);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Welcome, {profile?.full_name}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {formatDateTime(new Date())}
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Check-in Status */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        {todayAttendance && !todayAttendance.check_out && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-xs text-green-500">Active</span>
                            </div>
                        )}
                    </div>
                    <h3 className="text-sm text-muted-foreground mb-1">Today&apos;s Status</h3>
                    <p className="text-2xl font-bold">
                        {todayAttendance
                            ? todayAttendance.check_out
                                ? "Checked Out"
                                : "Checked In"
                            : "Not Checked In"}
                    </p>
                    <div className="mt-4">
                        <CheckInButton
                            userId={user.id}
                            currentAttendance={todayAttendance}
                        />
                    </div>
                </div>

                {/* Hours This Month */}
                <div className="glass-card p-6">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-sm text-muted-foreground mb-1">Hours This Month</h3>
                    <p className="text-2xl font-bold">{totalHours.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {monthAttendance?.length || 0} work days
                    </p>
                </div>

                {/* Estimated Salary */}
                <div className="glass-card p-6">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-sm text-muted-foreground mb-1">
                        Estimated {profile?.salary_type === "monthly" ? "Monthly" : "Current"}
                    </h3>
                    <p className="text-2xl font-bold">
                        ${estimatedSalary.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 capitalize">
                        {profile?.salary_type} rate
                    </p>
                </div>

                {/* Notifications */}
                <div className="glass-card p-6">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h3 className="text-sm text-muted-foreground mb-1">Notifications</h3>
                    <p className="text-2xl font-bold">
                        {notifications?.filter((n) => !n.notification_reads?.[0]?.read_at)
                            .length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Unread messages</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Work Hours Summary */}
                <WorkHoursSummary userId={user.id} />

                {/* Recent Notifications */}
                <NotificationsList notifications={notifications || []} />
            </div>

            {/* Salary Summary */}
            <SalarySummary
                userId={user.id}
                salaryType={profile?.salary_type || "monthly"}
            />
        </div>
    );
}
