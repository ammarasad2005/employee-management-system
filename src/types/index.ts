// User roles
export type UserRole = 'employee' | 'admin';

// Salary types
export type SalaryType = 'hourly' | 'monthly';

// Notification priority
export type NotificationPriority = 'normal' | 'important' | 'urgent';

// Notification target
export type NotificationTarget = 'all' | 'employee' | 'admin';

// Salary status
export type SalaryStatus = 'pending' | 'paid';

// User Profile
export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    hourly_rate?: number;
    monthly_salary?: number;
    salary_type: SalaryType;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Attendance Record
export interface Attendance {
    id: string;
    user_id: string;
    check_in: string;
    check_out?: string;
    total_hours?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    profile?: Profile;
}

// Salary Record
export interface SalaryRecord {
    id: string;
    user_id: string;
    period_start: string;
    period_end: string;
    base_amount: number;
    bonus: number;
    deductions: number;
    total_amount: number;
    hours_worked?: number;
    status: SalaryStatus;
    paid_at?: string;
    notes?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    profile?: Profile;
}

// Notification
export interface Notification {
    id: string;
    title: string;
    message: string;
    priority: NotificationPriority;
    target_role: NotificationTarget;
    created_by: string;
    created_at: string;
    is_read?: boolean;
    read_at?: string;
}

// Notification Read Status
export interface NotificationRead {
    id: string;
    notification_id: string;
    user_id: string;
    read_at: string;
}

// Audit Log
export interface AuditLog {
    id: string;
    user_id: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    ip_address?: string;
    created_at: string;
    profile?: Profile;
}

// API Response Types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// Dashboard Stats
export interface DashboardStats {
    totalEmployees: number;
    activeToday: number;
    pendingSalaries: number;
    totalHoursThisMonth: number;
}

// Form Types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface CreateUserFormData {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
    salary_type: SalaryType;
    hourly_rate?: number;
    monthly_salary?: number;
}

export interface CreateNotificationFormData {
    title: string;
    message: string;
    priority: NotificationPriority;
    target_role: NotificationTarget;
}

export interface CreateSalaryFormData {
    user_id: string;
    period_start: string;
    period_end: string;
    base_amount: number;
    bonus?: number;
    deductions?: number;
    notes?: string;
}
