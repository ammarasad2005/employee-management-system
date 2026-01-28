export const APP_NAME = "Employee Management System";
export const APP_DESCRIPTION = "Track hours, manage salaries, and stay connected";

// Pagination
export const ITEMS_PER_PAGE = 10;

// Date formats
export const DATE_FORMAT = "yyyy-MM-dd";
export const DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

// Roles
export const ROLES = {
    EMPLOYEE: "employee" as const,
    ADMIN: "admin" as const,
};

// Salary types
export const SALARY_TYPES = {
    HOURLY: "hourly" as const,
    MONTHLY: "monthly" as const,
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
    NORMAL: "normal" as const,
    IMPORTANT: "important" as const,
    URGENT: "urgent" as const,
};

// Notification targets
export const NOTIFICATION_TARGETS = {
    ALL: "all" as const,
    EMPLOYEE: "employee" as const,
    ADMIN: "admin" as const,
};

// Salary statuses
export const SALARY_STATUSES = {
    PENDING: "pending" as const,
    PAID: "paid" as const,
};

// Routes
export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    EMPLOYEE_DASHBOARD: "/employee",
    EMPLOYEE_ATTENDANCE: "/employee/attendance",
    EMPLOYEE_SALARY: "/employee/salary",
    EMPLOYEE_NOTIFICATIONS: "/employee/notifications",
    ADMIN_DASHBOARD: "/admin",
    ADMIN_USERS: "/admin/users",
    ADMIN_ATTENDANCE: "/admin/attendance",
    ADMIN_PAYROLL: "/admin/payroll",
    ADMIN_NOTIFICATIONS: "/admin/notifications",
    ADMIN_AUDIT: "/admin/audit-logs",
};

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/api/auth/login",
        LOGOUT: "/api/auth/logout",
        SESSION: "/api/auth/session",
    },
    ATTENDANCE: {
        BASE: "/api/attendance",
        CHECK_IN: "/api/attendance/check-in",
        CHECK_OUT: "/api/attendance/check-out",
        BY_ID: (id: string) => `/api/attendance/${id}`,
    },
    SALARY: {
        BASE: "/api/salary",
        BY_ID: (id: string) => `/api/salary/${id}`,
    },
    NOTIFICATIONS: {
        BASE: "/api/notifications",
        BY_ID: (id: string) => `/api/notifications/${id}`,
        MARK_READ: (id: string) => `/api/notifications/${id}/read`,
    },
    USERS: {
        BASE: "/api/users",
        BY_ID: (id: string) => `/api/users/${id}`,
    },
};
