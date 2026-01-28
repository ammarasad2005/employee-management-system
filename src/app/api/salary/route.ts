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
        const status = searchParams.get("status");

        let query = supabase
            .from("salary_records")
            .select("*, profile:profiles(full_name, email)")
            .order("period_start", { ascending: false });

        // Apply filters
        if (profile?.role === "admin") {
            if (userId) {
                query = query.eq("user_id", userId);
            }
            if (status) {
                query = query.eq("status", status);
            }
        } else {
            // Employees can only view their own
            query = query.eq("user_id", user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Fetch salary records error:", error);
            return NextResponse.json(
                { error: "Failed to fetch salary records" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Fetch salary records error:", error);
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
        const {
            user_id,
            period_start,
            period_end,
            base_amount,
            bonus = 0,
            deductions = 0,
            notes,
            hours_worked,
        } = body;

        const total_amount = base_amount + bonus - deductions;

        const { data, error } = await supabase
            .from("salary_records")
            .insert({
                user_id,
                period_start,
                period_end,
                base_amount,
                bonus,
                deductions,
                total_amount,
                hours_worked,
                notes,
                created_by: user.id,
                status: "pending",
            })
            .select()
            .single();

        if (error) {
            console.error("Create salary record error:", error);
            return NextResponse.json(
                { error: "Failed to create salary record" },
                { status: 500 }
            );
        }

        // Create audit log
        await supabase.from("audit_logs").insert({
            user_id: user.id,
            action: "create_salary",
            entity_type: "salary_record",
            entity_id: data.id,
            new_values: {
                user_id,
                period_start,
                period_end,
                base_amount,
                bonus,
                deductions,
                total_amount,
            },
        });

        return NextResponse.json({
            data,
            message: "Salary record created successfully",
        });
    } catch (error) {
        console.error("Create salary record error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
