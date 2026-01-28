import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();

        // Get old values for audit
        const { data: oldRecord } = await supabase
            .from("salary_records")
            .select("*")
            .eq("id", id)
            .single();

        const { data, error } = await supabase
            .from("salary_records")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Update salary record error:", error);
            return NextResponse.json(
                { error: "Failed to update salary record" },
                { status: 500 }
            );
        }

        // Create audit log
        await supabase.from("audit_logs").insert({
            user_id: user.id,
            action: body.status === "paid" ? "mark_paid" : "update_salary",
            entity_type: "salary_record",
            entity_id: id,
            old_values: oldRecord,
            new_values: body,
        });

        return NextResponse.json({
            data,
            message: "Salary record updated successfully",
        });
    } catch (error) {
        console.error("Update salary record error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
