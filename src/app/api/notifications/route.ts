import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        // Build notifications query
        let query = supabase
            .from("notifications")
            .select(
                `
        *,
        notification_reads!left(read_at)
      `
            )
            .order("created_at", { ascending: false });

        // Filter by target role
        if (profile?.role === "admin") {
            query = query.or("target_role.eq.all,target_role.eq.admin");
        } else {
            query = query.or("target_role.eq.all,target_role.eq.employee");
        }

        // Filter to only get notifications for current user's reads
        const { data: notifications, error } = await query;

        if (error) {
            console.error("Fetch notifications error:", error);
            return NextResponse.json(
                { error: "Failed to fetch notifications" },
                { status: 500 }
            );
        }

        // Get read status for current user
        const notificationIds = notifications?.map((n) => n.id) || [];

        const { data: reads } = await supabase
            .from("notification_reads")
            .select("notification_id, read_at")
            .eq("user_id", user.id)
            .in("notification_id", notificationIds);

        // Merge read status with notifications
        const notificationsWithReadStatus = notifications?.map((notification) => {
            const read = reads?.find((r) => r.notification_id === notification.id);
            return {
                ...notification,
                is_read: !!read,
                read_at: read?.read_at,
                notification_reads: read ? [{ read_at: read.read_at }] : [],
            };
        });

        return NextResponse.json({ data: notificationsWithReadStatus });
    } catch (error) {
        console.error("Fetch notifications error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { title, message, priority, target_role } = body;

        const { data, error } = await supabase
            .from("notifications")
            .insert({
                title,
                message,
                priority: priority || "normal",
                target_role: target_role || "all",
                created_by: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Create notification error:", error);
            return NextResponse.json(
                { error: "Failed to create notification" },
                { status: 500 }
            );
        }

        // Create audit log
        await supabase.from("audit_logs").insert({
            user_id: user.id,
            action: "create_notification",
            entity_type: "notification",
            entity_id: data.id,
            new_values: { title, message, priority, target_role },
        });

        return NextResponse.json({
            data,
            message: "Notification created successfully",
        });
    } catch (error) {
        console.error("Create notification error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
