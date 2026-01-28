import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { calculateHours } from "@/lib/utils";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { attendance_id } = body;

        // Get attendance record
        const { data: attendance, error: fetchError } = await supabase
            .from("attendance")
            .select("*")
            .eq("id", attendance_id)
            .single();

        if (fetchError || !attendance) {
            return NextResponse.json(
                { error: "Attendance record not found" },
                { status: 404 }
            );
        }

        // Verify user owns this attendance record
        if (attendance.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check if already checked out
        if (attendance.check_out) {
            return NextResponse.json(
                { error: "Already checked out" },
                { status: 400 }
            );
        }

        const checkOutTime = new Date().toISOString();
        const totalHours = calculateHours(attendance.check_in, checkOutTime);

        // Update attendance record
        const { data, error } = await supabase
            .from("attendance")
            .update({
                check_out: checkOutTime,
                total_hours: totalHours,
            })
            .eq("id", attendance_id)
            .select()
            .single();

        if (error) {
            console.error("Check-out error:", error);
            return NextResponse.json(
                { error: "Failed to check out" },
                { status: 500 }
            );
        }

        // Create audit log
        await supabase.from("audit_logs").insert({
            user_id: user.id,
            action: "check_out",
            entity_type: "attendance",
            entity_id: attendance_id,
            old_values: { check_out: null, total_hours: null },
            new_values: { check_out: checkOutTime, total_hours: totalHours },
        });

        return NextResponse.json({
            data,
            message: `Checked out successfully. Total hours: ${totalHours}`,
        });
    } catch (error) {
        console.error("Check-out error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
