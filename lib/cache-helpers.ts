import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { getDashboardStats, getFinanceStats } from '@/lib/dashboard-queries';

/**
 * CACHING STRATEGY FOR TRAVELO TMS:
 *
 * ✅ Tenant Settings: 10 min TTL (practically static)
 * ✅ Tour Data: 2 min TTL (mostly readable)
 * ✅ Dashboard Stats: 30 sec TTL (real-time accuracy maintained)
 * ✅ Finance Data: 60 sec TTL (accurate within ~1 minute)
 * ✅ Public API: 5 min TTL (tours/promos rarely change)
 * ✅ Leads/Bookings: Real-time (no caching for mutable data)
 */

/**
 * Cache Tenant Settings (singleton)
 * These almost never change during a session
 * 10-minute TTL is safe and provides huge speed boost
 */
export const getCachedTenant = unstable_cache(
  async () => {
    return prisma.tenant.findFirst({
      select: {
        id: true,
        companyName: true,
        logoUrl: true,
        primaryColor: true,
        accentColor: true,
        navbarColor: true,
        buttonColor: true,
        headingColor: true,
        footerColor: true,
        cardColor: true,
        navlink: true,
        planTier: true,
        isActive: true,
        contactEmail: true,
        whatsappNumber: true,
        backupEmail: true,
        allowPartialPayments: true,
        metaPixelId: true,
      },
    });
  },
  ['cache-tenant'],
  {
    revalidate: 600, // 10 minutes
    tags: ['tenant'],
  }
);

/**
 * Cache Tour Statistics
 * Mostly read-only, safe to cache for 2 minutes
 */
export const getCachedTourStats = unstable_cache(
  async () => {
    const [activeCount, totalCount] = await Promise.all([
      prisma.tour.count({ where: { status: 'ACTIVE' } }),
      prisma.tour.count({}),
    ]);

    return {
      active: activeCount,
      total: totalCount,
    };
  },
  ['cache-tour-stats'],
  {
    revalidate: 120, // 2 minutes
    tags: ['tours'],
  }
);

/**
 * Cache Dashboard Statistics
 * Uses aggregation queries, so even with 30-second TTL
 * the database hit is minimal
 */
export const getCachedDashboardStats = unstable_cache(
  async () => {
    return getDashboardStats();
  },
  ['cache-dashboard-stats'],
  {
    revalidate: 30, // 30 seconds for near real-time
    tags: ['bookings', 'leads', 'dashboard'],
  }
);

/**
 * Cache Finance Dashboard
 * 60-second TTL - accurate within ~1 minute
 */
export const getCachedFinanceStats = unstable_cache(
  async () => {
    return getFinanceStats();
  },
  ['cache-finance-stats'],
  {
    revalidate: 60, // 1 minute
    tags: ['bookings', 'finance'],
  }
);

/**
 * Cache Active Tours (for public API)
 * Safe to cache for 5 minutes since tours rarely change
 */
export const getCachedActiveTours = unstable_cache(
  async () => {
    return prisma.tour.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        destination: true,
        duration: true,
        basePrice: true,
        coverImage: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },
  ['cache-active-tours'],
  {
    revalidate: 300, // 5 minutes
    tags: ['tours', 'public'],
  }
);

/**
 * Cache Active Promo Codes
 * 10-minute TTL - promos rarely change and expiration is validated at runtime
 */
export const getCachedActivePromos = unstable_cache(
  async () => {
    return prisma.promoCode.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        validUntil: true,
        usageLimit: true,
        timesUsed: true,
      },
    });
  },
  ['cache-active-promos'],
  {
    revalidate: 600, // 10 minutes
    tags: ['promos'],
  }
);

/**
 * Cache Team Members (for role-based access)
 * 5-minute TTL - team roster rarely changes
 */
export const getCachedTeamMembers = unstable_cache(
  async () => {
    return prisma.teamMember.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
      where: { status: 'ACTIVE' },
    });
  },
  ['cache-team-members'],
  {
    revalidate: 300, // 5 minutes
    tags: ['team'],
  }
);

/**
 * INSTANT CACHE INVALIDATION HELPERS
 *
 * Use these in your server actions when data changes
 * Example:
 *   export async function submitBooking(...) {
 *     await prisma.booking.create(...);
 *     revalidateDashboard();  // Instant cache bust
 *   }
 */

export async function revalidateDashboard() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('bookings', 'max');
  revalidateTag('leads', 'max');
  revalidateTag('dashboard', 'max');
}

export async function revalidateFinance() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('bookings', 'max');
  revalidateTag('finance', 'max');
}

export async function revalidateTours() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('tours', 'max');
  revalidateTag('public', 'max');
}

export async function revalidatePromos() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('promos', 'max');
}

export async function revalidateTeam() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('team', 'max');
}

export async function revalidateTenant() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('tenant', 'max');
}

export async function revalidateAll() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('bookings', 'max');
  revalidateTag('leads', 'max');
  revalidateTag('dashboard', 'max');
  revalidateTag('tours', 'max');
  revalidateTag('promos', 'max');
  revalidateTag('team', 'max');
  revalidateTag('tenant', 'max');
  revalidateTag('finance', 'max');
  revalidateTag('public', 'max');
}
