import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
        const { user_id } = body;

        // Verify user is checking in for themselves
        if (user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check if user already has an active check-in
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: existingAttendance } = await supabase
            .from("attendance")
            .select("*")
            .eq("user_id", user_id)
            .gte("check_in", today.toISOString())
            .is("check_out", null)
            .single();

        if (existingAttendance) {
            return NextResponse.json(
                { error: "Already checked in" },
                { status: 400 }
            );
        }

        // Create new attendance record
        const { data, error } = await supabase
            .from("attendance")
            .insert({
                user_id,
                check_in: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error("Check-in error:", error);
            return NextResponse.json(
                { error: "Failed to check in" },
                { status: 500 }
            );
        }

        // Create audit log
        await supabase.from("audit_logs").insert({
            user_id,
            action: "check_in",
            entity_type: "attendance",
            entity_id: data.id,
            new_values: { check_in: data.check_in },
        });

        return NextResponse.json({ data, message: "Checked in successfully" });
    } catch (error) {
        console.error("Check-in error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
