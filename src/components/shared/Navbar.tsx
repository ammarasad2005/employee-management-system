"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Clock,
    DollarSign,
    Bell,
    Users,
    FileText,
    Shield,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { useState } from "react";
import type { UserRole } from "@/types";

interface NavbarProps {
    userRole: UserRole;
    userName: string;
}

const employeeLinks = [
    { href: "/employee", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employee/attendance", label: "Attendance", icon: Clock },
    { href: "/employee/salary", label: "Salary", icon: DollarSign },
    { href: "/employee/notifications", label: "Notifications", icon: Bell },
];

const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/attendance", label: "Attendance", icon: Clock },
    { href: "/admin/payroll", label: "Payroll", icon: DollarSign },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: Shield },
];

export function Navbar({ userRole, userName }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const links = userRole === "admin" ? adminLinks : employeeLinks;

    const handleLogout = async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();

        if (error) {
            toast.error("Failed to sign out");
            return;
        }

        toast.success("Signed out successfully");
        router.push("/login");
        router.refresh();
    };

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="hidden lg:flex fixed top-0 left-0 right-0 h-16 glass border-b border-border z-50">
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link
                            href={userRole === "admin" ? "/admin" : "/employee"}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold text-lg">EMS</span>
                        </Link>

                        <div className="flex items-center gap-1">
                            {links.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                                            isActive
                                                ? "bg-primary/20 text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium">{userName}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                                {userRole}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navbar */}
            <nav className="lg:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-border z-50">
                <div className="px-4 h-full flex items-center justify-between">
                    <Link
                        href={userRole === "admin" ? "/admin" : "/employee"}
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg">EMS</span>
                    </Link>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-secondary transition-all"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="absolute top-16 left-0 right-0 glass border-b border-border p-4 space-y-2 animate-fade-in">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                                        isActive
                                            ? "bg-primary/20 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}

                        <div className="pt-2 border-t border-border mt-2">
                            <div className="px-4 py-2">
                                <p className="text-sm font-medium">{userName}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {userRole}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Spacer for fixed navbar */}
            <div className="h-16" />
        </>
    );
}
