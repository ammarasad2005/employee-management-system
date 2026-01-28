import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
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

        const { id } = await params;

        // Check if already marked as read
        const { data: existing } = await supabase
            .from("notification_reads")
            .select("*")
            .eq("notification_id", id)
            .eq("user_id", user.id)
            .single();

        if (existing) {
            return NextResponse.json({ message: "Already marked as read" });
        }

        // Mark as read
        const { error } = await supabase.from("notification_reads").insert({
            notification_id: id,
            user_id: user.id,
        });

        if (error) {
            console.error("Mark read error:", error);
            return NextResponse.json(
                { error: "Failed to mark as read" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Marked as read successfully" });
    } catch (error) {
        console.error("Mark read error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
