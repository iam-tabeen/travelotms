import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type NormalizedHost = {
  hostname: string;
  port: string;
};

function normalizeHostValue(rawHost: string) {
  // x-forwarded-host can contain multiple comma-separated hosts.
  const first = rawHost.split(',')[0]?.trim().toLowerCase() || '';

  // Remove protocol/path if present to keep host parsing stable.
  const withoutProtocol = first.replace(/^https?:\/\//, '');
  const hostOnly = withoutProtocol.split('/')[0] || '';

  const portMatch = hostOnly.match(/:(\d+)$/);
  const port = portMatch?.[1] || '';
  const hostname = port ? hostOnly.slice(0, -(port.length + 1)) : hostOnly;

  return { hostname, port };
}

function getNormalizedHost(req: NextRequest): NormalizedHost {
  // Netlify-proxied requests generally provide x-forwarded-host.
  // x-original-host is a safe secondary fallback.
  const forwardedHost = req.headers.get('x-forwarded-host');
  const originalHost = req.headers.get('x-original-host');
  const hostHeader = req.headers.get('host');
  const fallback = req.nextUrl.host;

  return normalizeHostValue(forwardedHost || originalHost || hostHeader || fallback);
}

function isAdminHost(hostname: string) {
  if (hostname.startsWith('admin.')) return true;

  // Netlify preview/branch/prod style: admin-<host>.netlify.app
  if (hostname.endsWith('.netlify.app') && hostname.startsWith('admin-')) return true;

  return false;
}

function buildAdminHostname(hostname: string) {
  // Local development domains
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return hostname.startsWith('admin.') ? hostname : `admin.${hostname}`;
  }

  // Netlify deploys:
  // - branchname--sitename.netlify.app
  // - deploy-preview-123--sitename.netlify.app
  // - sitename.netlify.app
  if (hostname.endsWith('.netlify.app')) {
    if (hostname.startsWith('admin-') || hostname.startsWith('admin.')) return hostname;
    return `admin-${hostname}`;
  }

  // Production custom domains
  const base = hostname.replace(/^www\./, '').replace(/^admin\./, '');
  return `admin.${base}`;
}

function buildAdminHost(host: NormalizedHost) {
  const adminHostname = buildAdminHostname(host.hostname);
  return host.port ? `${adminHostname}:${host.port}` : adminHostname;
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const host = getNormalizedHost(req);
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const adminHost = isAdminHost(host.hostname);

  // Fast bypass for static/files/api routes.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.[a-zA-Z0-9]+$/)
  ) {
    return NextResponse.next();
  }

  // Optional hardening: if someone opens /dashboard on root domain, send them to admin domain.
  if (!adminHost && pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.host = buildAdminHost(host);
    return NextResponse.redirect(redirectUrl);
  }

  if (adminHost) {
    // Keep these routes outside the /dashboard rewrite path.
    const passthrough = [
      '/onboarding',
      '/suspended',
      '/super-admin',
      '/sign-in',
      '/sign-up',
      '/tours',
      '/contact',
      '/custom-tour',
    ];
    if (passthrough.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return NextResponse.next();
    }

    await auth.protect();

    const targetPath =
      pathname === '/'
        ? '/dashboard'
        : pathname.startsWith('/dashboard')
        ? pathname
        : `/dashboard${pathname}`;

    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = targetPath;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip internals, static assets, and APIs for middleware performance.
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};