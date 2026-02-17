import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode('super-secret-key-change-this-in-prod');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Protect /admin routes
    if (pathname.startsWith('/admin')) {
        // Allow access to login page
        if (pathname === '/admin/login') {
            // If already logged in, redirect to dashboard?
            const token = request.cookies.get('admin_session')?.value;
            if (token) {
                try {
                    await jwtVerify(token, JWT_SECRET);
                    return NextResponse.redirect(new URL('/admin', request.url));
                } catch (e) {
                    // Token invalid, allow login page
                }
            }
            return NextResponse.next();
        }

        // Check for session cookie
        const token = request.cookies.get('admin_session')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            const { payload } = await jwtVerify(token, JWT_SECRET);
            const role = payload.role as string;

            // Role-based route protection
            if (role === 'staff') {
                // Staff ONLY allowed /admin/students
                if (pathname !== '/admin/students') {
                    return NextResponse.redirect(new URL('/admin/students', request.url));
                }
            } else if (role === 'exam_coordinator') {
                // Exam Coordinator NOT allowed /admin/questions and /admin/settings
                const restricted = ['/admin/questions', '/admin/settings'];
                if (restricted.some(route => pathname.startsWith(route))) {
                    return NextResponse.redirect(new URL('/admin', request.url));
                }
            }
            // Admin has full access

            return NextResponse.next();
        } catch (e) {
            console.error('Middleware auth error:', e);
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
