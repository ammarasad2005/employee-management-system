import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        supabaseResponse.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Protected routes logic
    const isAuthPage = request.nextUrl.pathname.startsWith("/login");
    const isEmployeePage = request.nextUrl.pathname.startsWith("/employee");
    const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
    const isProtectedRoute = isEmployeePage || isAdminPage;

    // If user is not signed in and the current route is protected, redirect to login
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // If user is signed in and tries to access auth pages, redirect to dashboard
    if (user && isAuthPage) {
        // Get user profile to determine role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const url = request.nextUrl.clone();
        url.pathname = profile?.role === "admin" ? "/admin" : "/employee";
        return NextResponse.redirect(url);
    }

    // Check role-based access
    if (user && isProtectedRoute) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        // Redirect employees trying to access admin pages
        if (isAdminPage && profile?.role !== "admin") {
            const url = request.nextUrl.clone();
            url.pathname = "/employee";
            return NextResponse.redirect(url);
        }

        // Redirect admins to admin dashboard if they try to access employee pages
        if (isEmployeePage && profile?.role === "admin") {
            const url = request.nextUrl.clone();
            url.pathname = "/admin";
            return NextResponse.redirect(url);
        }
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse;
}
