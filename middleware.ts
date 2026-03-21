import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define the routes you want to lock down. This protects /admin and everything inside it.
const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get('host') || '';
  const { pathname } = req.nextUrl;

  // 1. SUBDOMAIN ROUTING: 
  // If they visit the root of the "app." subdomain, instantly redirect them to /admin
  if (hostname.startsWith('app.') && pathname === '/') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // 2. CLERK AUTHENTICATION:
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