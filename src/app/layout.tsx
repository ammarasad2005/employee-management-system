import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// Use system fonts for better hosting compatibility
const fontClass = "font-sans";

export const metadata: Metadata = {
  title: "Employee Management System",
  description: "Track hours, manage salaries, and stay connected",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={fontClass}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              border: "1px solid hsl(var(--border))",
            },
            success: {
              iconTheme: {
                primary: "hsl(var(--primary))",
                secondary: "hsl(var(--card))",
              },
            },
            error: {
              iconTheme: {
                primary: "hsl(var(--destructive))",
                secondary: "hsl(var(--card))",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
