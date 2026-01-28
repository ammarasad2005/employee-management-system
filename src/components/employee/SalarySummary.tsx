import { createClient } from "@/lib/supabase/server";
import { DollarSign } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import type { SalaryType } from "@/types";

interface SalarySummaryProps {
    userId: string;
    salaryType: SalaryType;
}

export async function SalarySummary({ userId, salaryType }: SalarySummaryProps) {
    const supabase = await createClient();

    // Get recent salary records
    const { data: salaryRecords } = await supabase
        .from("salary_records")
        .select("*")
        .eq("user_id", userId)
        .order("period_start", { ascending: false })
        .limit(3);

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Salary Records</h2>
                <DollarSign className="w-5 h-5 text-green-500" />
            </div>

            {salaryRecords && salaryRecords.length > 0 ? (
                <div className="space-y-4">
                    {salaryRecords.map((record) => (
                        <div
                            key={record.id}
                            className="p-5 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-medium">
                                        {formatDate(record.period_start)} -{" "}
                                        {formatDate(record.period_end)}
                                    </p>
                                    {record.hours_worked && (
                                        <p className="text-sm text-muted-foreground">
                                            {record.hours_worked} hours worked
                                        </p>
                                    )}
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                        record.status
                                    )}`}
                                >
                                    {record.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
                                <div>
                                    <p className="text-xs text-muted-foreground">Base Amount</p>
                                    <p className="font-medium">{formatCurrency(record.base_amount)}</p>
                                </div>
                                {record.bonus > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Bonus</p>
                                        <p className="font-medium text-green-500">
                                            +{formatCurrency(record.bonus)}
                                        </p>
                                    </div>
                                )}
                                {record.deductions > 0 && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Deductions</p>
                                        <p className="font-medium text-destructive">
                                            -{formatCurrency(record.deductions)}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="text-lg font-bold text-primary">
                                        {formatCurrency(record.total_amount)}
                                    </p>
                                </div>
                            </div>

                            {record.notes && (
                                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
                                    {record.notes}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No salary records yet</p>
                </div>
            )}
        </div>
    );
}
