import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 1. Define exactly what is protected and what is public
const isProtectedRoute = createRouteMatcher(['/admin(.*)']);
const isPublicApiRoute = createRouteMatcher(['/api/public(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;

  // A. SUBDOMAIN ROUTING: 
  if (hostname.startsWith('app.') && pathname === '/') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // B. PUBLIC API BYPASS:
  // If the request is for our headless engine, let it pass instantly!
  if (isPublicApiRoute(req)) {
    return NextResponse.next();
  }

  // C. CLERK AUTHENTICATION:
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};