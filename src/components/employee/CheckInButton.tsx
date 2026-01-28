"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import type { Attendance } from "@/types";

interface CheckInButtonProps {
    userId: string;
    currentAttendance: Attendance | null;
}

export function CheckInButton({ userId, currentAttendance }: CheckInButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const isCheckedIn = currentAttendance && !currentAttendance.check_out;

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/attendance/check-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to check in");
                return;
            }

            toast.success("Checked in successfully!");
            router.refresh();
        } catch (error) {
            toast.error("An error occurred");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!currentAttendance) return;

        setLoading(true);
        try {
            const response = await fetch("/api/attendance/check-out", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attendance_id: currentAttendance.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Failed to check out");
                return;
            }

            toast.success(`Checked out! Total hours: ${data.data.total_hours}`);
            router.refresh();
        } catch (error) {
            toast.error("An error occurred");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isCheckedIn
                    ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                    : "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                </>
            ) : isCheckedIn ? (
                <>
                    <LogOut className="w-4 h-4" />
                    Check Out
                </>
            ) : (
                <>
                    <LogIn className="w-4 h-4" />
                    Check In
                </>
            )}
        </button>
    );
}
