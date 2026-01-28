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

        // Get user profile to check role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id");
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");

        let query = supabase
            .from("attendance")
            .select("*, profile:profiles(full_name, email)")
            .order("check_in", { ascending: false });

        // Apply filters
        if (profile?.role === "admin") {
            // Admins can view all or filter by user
            if (userId) {
                query = query.eq("user_id", userId);
            }
        } else {
            // Employees can only view their own
            query = query.eq("user_id", user.id);
        }

        if (startDate) {
            query = query.gte("check_in", startDate);
        }

        if (endDate) {
            query = query.lte("check_in", endDate);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Fetch attendance error:", error);
            return NextResponse.json(
                { error: "Failed to fetch attendance" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Fetch attendance error:", error);
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
        const { user_id, check_in, check_out, notes } = body;

        const attendanceData: any = {
            user_id,
            check_in,
            notes,
        };

        if (check_out) {
            const { calculateHours } = await import("@/lib/utils");
            attendanceData.check_out = check_out;
            attendanceData.total_hours = calculateHours(check_in, check_out);
        }

        const { data, error } = await supabase
            .from("attendance")
            .insert(attendanceData)
            .select()
            .single();

        if (error) {
            console.error("Create attendance error:", error);
            return NextResponse.json(
                { error: "Failed to create attendance" },
                { status: 500 }
            );
        }

        // Create audit log
        await supabase.from("audit_logs").insert({
            user_id: user.id,
            action: "create_attendance",
            entity_type: "attendance",
            entity_id: data.id,
            new_values: attendanceData,
        });

        return NextResponse.json({
            data,
            message: "Attendance record created successfully",
        });
    } catch (error) {
        console.error("Create attendance error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
