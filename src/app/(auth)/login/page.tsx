import { LoginForm } from "@/components/auth/LoginForm";
import { Building2 } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="glass-card p-8 animate-fade-in">
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Employee Management
                </h1>
                <p className="text-muted-foreground text-center mt-2">
                    Sign in to your account
                </p>
            </div>
            <LoginForm />
        </div>
    );
}
