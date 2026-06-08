import type { CSSProperties } from 'react';
import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCachedTenant } from '@/lib/cache-helpers';

export type PublicTenant = NonNullable<Awaited<ReturnType<typeof getCachedTenant>>>;

export function tenantThemeVars(tenant: PublicTenant) {
  return {
    '--theme-primary': tenant.primaryColor || '#003580',
    '--theme-accent': tenant.accentColor || '#FF8C00',
    '--theme-navbar': tenant.navbarColor || '#003580',
    '--theme-button': tenant.buttonColor || '#FF8C00',
    '--theme-heading': tenant.headingColor || '#1F2937',
    '--theme-footer': tenant.footerColor || '#111827',
    '--theme-card': tenant.cardColor || '#111827',
    '--navlink': tenant.navlink || '#111827',
    '--axius-primary': tenant.primaryColor || '#003580',
    '--axius-secondary': tenant.headingColor || '#1F2937',
  } as CSSProperties;
}

export async function getPublicTenant() {
  const tenant = await getCachedTenant();
  if (!tenant?.isActive) return null;
  return tenant;
}

export function getCachedPublicTours(search: string, sort: string) {
  return unstable_cache(
  async () => {
    let orderBy: { createdAt?: 'desc'; basePrice?: 'asc' | 'desc' } = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
    if (sort === 'price_desc') orderBy = { basePrice: 'desc' };

    const tours = await prisma.tour.findMany({
      where: {
        status: 'ACTIVE',
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { destination: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      },
      orderBy,
    });

    if (sort === 'duration_asc') {
      tours.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    } else if (sort === 'duration_desc') {
      tours.sort((a, b) => parseInt(b.duration) - parseInt(a.duration));
    }

    return tours;
  },
  ['cache-public-tours-list', search, sort],
  { revalidate: 120, tags: ['tours', 'public'] }
  )();
}

export function getCachedPublicTourDetail(tourId: string) {
  return unstable_cache(
  async () => {
    return prisma.tour.findUnique({
      where: { id: tourId, status: 'ACTIVE' },
      include: {
        itineraryDays: { orderBy: { dayNumber: 'asc' } },
      },
    });
  },
  ['cache-public-tour-detail', tourId],
  { revalidate: 120, tags: ['tours', 'public'] }
  )();
}

export function resolveFixedDepartureDate(tour: {
  departureType: string;
  departureDate: Date | null;
  departureEveryYear: boolean;
}) {
  if (tour.departureType !== 'CUSTOM_DATE' || !tour.departureDate) return undefined;

  const d = new Date(tour.departureDate);
  if (tour.departureEveryYear) {
    const today = new Date();
    let targetDate = new Date(today.getFullYear(), d.getMonth(), d.getDate());
    if (targetDate < today) targetDate.setFullYear(today.getFullYear() + 1);
    return targetDate.toISOString().split('T')[0];
  }
  return d.toISOString().split('T')[0];
}
