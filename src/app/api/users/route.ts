import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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

        // Check if user is admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get all users
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch users error:", error);
            return NextResponse.json(
                { error: "Failed to fetch users" },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Fetch users error:", error);
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
            email,
            password,
            full_name,
            role,
            salary_type,
            hourly_rate,
            monthly_salary,
        } = body;

        // Create auth user
        const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name,
                    role,
                },
            });

        if (authError) {
            console.error("Create user auth error:", authError);
            return NextResponse.json(
                { error: authError.message || "Failed to create user" },
                { status: 400 }
            );
        }

        // Update profile with additional details
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                salary_type,
                hourly_rate: salary_type === "hourly" ? hourly_rate : null,
                monthly_salary: salary_type === "monthly" ? monthly_salary : null,
            })
            .eq("id", authData.user.id);

        if (updateError) {
            console.error("Update profile error:", updateError);
        }

        // Create audit log
        await supabase.from("audit_logs").insert({
            user_id: user.id,
            action: "create_user",
            entity_type: "profile",
            entity_id: authData.user.id,
            new_values: {
                email,
                full_name,
                role,
                salary_type,
                hourly_rate,
                monthly_salary,
            },
        });

        return NextResponse.json({
            data: authData.user,
            message: "User created successfully",
        });
    } catch (error) {
        console.error("Create user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
