import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Minimalist Health Check
 * Returns plain text to ensure zero JSON overhead and maximum compatibility.
 */
export async function GET() {
    return new Response('OK', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
    });
}
