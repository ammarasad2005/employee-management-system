import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance, differenceInHours, differenceInMinutes } from "date-fns";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date): string {
    return format(new Date(date), "MMM dd, yyyy");
}

/**
 * Format datetime to readable string
 */
export function formatDateTime(date: string | Date): string {
    return format(new Date(date), "MMM dd, yyyy hh:mm a");
}

/**
 * Format time only
 */
export function formatTime(date: string | Date): string {
    return format(new Date(date), "hh:mm a");
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

/**
 * Calculate hours between two dates
 */
export function calculateHours(start: string | Date, end: string | Date): number {
    const hours = differenceInHours(new Date(end), new Date(start));
    const minutes = differenceInMinutes(new Date(end), new Date(start)) % 60;
    return Number((hours + minutes / 60).toFixed(2));
}

/**
 * Calculate salary based on hours and rate
 */
export function calculateSalary(hours: number, rate: number): number {
    return Number((hours * rate).toFixed(2));
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate random color for avatars
 */
export function getAvatarColor(name: string): string {
    const colors = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-green-500",
        "bg-yellow-500",
        "bg-red-500",
        "bg-indigo-500",
        "bg-cyan-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): string {
    switch (priority) {
        case "urgent":
            return "text-red-500 bg-red-500/10 border-red-500/20";
        case "important":
            return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
        default:
            return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
    switch (status) {
        case "paid":
            return "text-green-500 bg-green-500/10 border-green-500/20";
        case "pending":
            return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
        default:
            return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(","),
        ...data.map((row) =>
            headers.map((header) => JSON.stringify(row[header] || "")).join(",")
        ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
}
