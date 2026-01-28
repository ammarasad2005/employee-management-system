import { Users, Clock, DollarSign, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
    stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
    const cards = [
        {
            title: "Total Employees",
            value: stats.totalEmployees.toString(),
            icon: Users,
            gradient: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-500/20",
            textColor: "text-blue-500",
        },
        {
            title: "Active Today",
            value: stats.activeToday.toString(),
            icon: Clock,
            gradient: "from-purple-500 to-pink-500",
            bgColor: "bg-purple-500/20",
            textColor: "text-purple-500",
        },
        {
            title: "Pending Salaries",
            value: stats.pendingSalaries.toString(),
            icon: DollarSign,
            gradient: "from-yellow-500 to-orange-500",
            bgColor: "bg-yellow-500/20",
            textColor: "text-yellow-500",
        },
        {
            title: "Total Hours (Month)",
            value: stats.totalHoursThisMonth.toFixed(0),
            icon: TrendingUp,
            gradient: "from-green-500 to-emerald-500",
            bgColor: "bg-green-500/20",
            textColor: "text-green-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div key={card.title} className="glass-card p-6 group">
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center transition-transform group-hover:scale-110`}
                            >
                                <Icon className={`w-6 h-6 ${card.textColor}`} />
                            </div>
                        </div>
                        <h3 className="text-sm text-muted-foreground mb-1">{card.title}</h3>
                        <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                            {card.value}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
