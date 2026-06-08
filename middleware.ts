import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type NormalizedHost = {
  hostname: string;
  port: string;
};

function normalizeHostValue(rawHost: string) {
  const first = rawHost.split(',')[0]?.trim().toLowerCase() || '';
  const withoutProtocol = first.replace(/^https?:\/\//, '');
  const hostOnly = withoutProtocol.split('/')[0] || '';
  const portMatch = hostOnly.match(/:(\d+)$/);
  const port = portMatch?.[1] || '';
  const hostname = port ? hostOnly.slice(0, -(port.length + 1)) : hostOnly;
  return { hostname, port };
}

function getNormalizedHost(req: NextRequest): NormalizedHost {
  const forwardedHost = req.headers.get('x-forwarded-host');
  const originalHost = req.headers.get('x-original-host');
  const hostHeader = req.headers.get('host');
  const fallback = req.nextUrl.host;
  return normalizeHostValue(forwardedHost || originalHost || hostHeader || fallback);
}

/** Netlify only serves one *.netlify.app hostname per site — admin-* is a different (non-existent) site. */
function isNetlifyAppHost(hostname: string) {
  return hostname.endsWith('.netlify.app');
}

function isAdminHost(hostname: string) {
  if (hostname.startsWith('admin.')) return true;
  if (hostname.endsWith('.netlify.app') && hostname.startsWith('admin-')) return true;
  return false;
}

function buildAdminHostname(hostname: string) {
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return hostname.startsWith('admin.') ? hostname : `admin.${hostname}`;
  }
  if (hostname.endsWith('.netlify.app')) {
    if (hostname.startsWith('admin-') || hostname.startsWith('admin.')) return hostname;
    return `admin-${hostname}`;
  }
  const base = hostname.replace(/^www\./, '').replace(/^admin\./, '');
  return `admin.${base}`;
}

function buildAdminHost(host: NormalizedHost) {
  const adminHostname = buildAdminHostname(host.hostname);
  return host.port ? `${adminHostname}:${host.port}` : adminHostname;
}

const PUBLIC_PASSTHROUGH = ['/tours', '/contact', '/custom-tour'] as const;

const ADMIN_PASSTHROUGH = [
  '/onboarding',
  '/suspended',
  '/super-admin',
  '/sign-in',
  '/sign-up',
  ...PUBLIC_PASSTHROUGH,
] as const;

function isPassthrough(pathname: string, routes: readonly string[]) {
  return routes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtectedAdminPath(pathname: string) {
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const host = getNormalizedHost(req);
  const url = req.nextUrl.clone();
  const { pathname } = url;
  const onNetlify = isNetlifyAppHost(host.hostname);
  const adminHost = isAdminHost(host.hostname);

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.[a-zA-Z0-9]+$/)
  ) {
    return NextResponse.next();
  }

  // Netlify: one hostname only — dashboard lives at /dashboard on the same URL.
  if (onNetlify) {
    if (isProtectedAdminPath(pathname)) {
      await auth.protect();
    }
    return NextResponse.next();
  }

  // Custom domains: redirect /dashboard to admin.yourdomain.com
  if (!adminHost && pathname.startsWith('/dashboard')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.host = buildAdminHost(host);
    return NextResponse.redirect(redirectUrl);
  }

  if (adminHost) {
    if (isPassthrough(pathname, ADMIN_PASSTHROUGH)) {
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
