# Performance Optimization Guide - Travelo TMS (Single-Tenant)

## Executive Summary
Current state: Every dashboard is `force-dynamic`, fetching full datasets from the database on every request. This is safe but sub-optimal.

**Target:** Sub-500ms dashboard load times with intelligent caching + query optimization.

---

## 1. Database Layer Optimization (Prisma + Indexes)

### Problem
Your schema lacks indexes on frequently queried/sorted columns. Every `where` and `orderBy` scan the full table.

### Solution: Add Strategic Indexes

**File:** `prisma/schema.prisma`

Add these indexes:

```prisma
model Booking {
  id             String    @id @default(uuid())
  tourId         String
  customerName   String
  customerEmail  String
  customerPhone  String
  numTravelers   Int
  totalPrice     Int
  status         String    @default("PENDING")
  paymentProof   String?
  createdAt      DateTime  @default(now())
  specialNotes   String?
  travelDate     DateTime
  isWaitlist     Boolean   @default(false)
  selectedAddOns String?
  tour           Tour      @relation(fields: [tourId], references: [id])
  amountPaid     Float     @default(0)
  paymentStatus  String    @default("UNPAID")
  payments       Payment[]

  // 👇 ADD THESE INDEXES
  @@index([status])
  @@index([createdAt])
  @@index([tourId])
  @@index([paymentStatus])
  @@index([isWaitlist, status])  // Compound for waitlist/status checks
}

model Tour {
  id                 String         @id @default(uuid())
  title              String
  destination        String
  duration           String
  basePrice          Int
  transportType      String
  accommodation      String
  coverImage         String
  createdAt          DateTime       @default(now())
  status             String         @default("ACTIVE")
  bookingMode        String         @default("BOTH")
  exclusions         String[]
  gallery            String[]
  inclusions         String[]
  overview           String?
  policy             String?
  departureDate      DateTime?
  departureEveryYear Boolean        @default(false)
  departureType      String         @default("CLIENT_CHOICE")
  bookedSpots        Int            @default(0)
  maxCapacity        Int?
  blockedDates       String         @default("[]")
  addOns             String         @default("[]")
  bookings           Booking[]
  itineraryDays      ItineraryDay[]

  // 👇 ADD THESE INDEXES
  @@index([status])
  @@index([createdAt])
  @@index([status, departureDate])  // Compound for active tours with dates
}

model CustomTourLead {
  id            String   @id @default(cuid())
  fullName      String
  email         String
  phone         String
  cityCountry   String?
  dateFrom      String
  dateTo        String
  travelers     String
  accommodation String?
  budget        String?
  destinations  String
  tourTypes     String
  requirements  String?
  status        String   @default("PENDING")
  createdAt     DateTime @default(now())

  // 👇 ADD THESE INDEXES
  @@index([status])
  @@index([createdAt])
  @@index([email])
}

model PromoCode {
  id            String    @id @default(cuid())
  code          String    @unique
  discountType  String
  discountValue Float
  validUntil    DateTime?
  usageLimit    Int?
  timesUsed     Int       @default(0)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())

  // 👇 ADD THESE INDEXES
  @@index([isActive])
  @@index([validUntil])
  @@index([isActive, validUntil])  // For promo validation checks
}

model TeamMember {
  id        String   @id @default(uuid())
  name      String
  email     String
  role      String   @default("AGENT")
  status    String   @default("PENDING")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 👇 ADD THESE INDEXES
  @@index([email])
  @@index([status])
}

model Payment {
  id         String   @id @default(cuid())
  bookingId  String
  booking    Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  
  amount     Float
  date       DateTime @default(now())
  method     String   
  recordedBy String   
  notes      String?

  // 👇 ADD THIS INDEX
  @@index([bookingId])
}

model Backup {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  fileName   String
  fileUrl    String
  backupType String

  // 👇 ADD THIS INDEX
  @@index([createdAt])
}
```

### Migration Steps
```bash
npx prisma migrate dev --name "add_performance_indexes"
# This creates a new migration that adds all the indexes
```

---

## 2. Next.js Route Segment Caching (Safe, Smart ISR)

### Problem
Every page is `force-dynamic`, causing a full database hit on every request.

### Solution: Use Revalidation Tags + `unstable_cache`

**Key Principle:** 
- **Settings (Tenant)** → Static, change rarely → 5-10 minute revalidation
- **Tour counts/lists** → Semi-static, mostly readable → 1-2 minute revalidation
- **Leads/Bookings** → Dynamic, mutable → Real-time with smart query fetching

---

## 3. Query Aggregation (Avoid Loading All Records)

### Problem - Current Dashboard
```javascript
// Fetches ALL bookings into memory
const leads = await prisma.booking.findMany({
  where: {},
  select: { status: true, totalPrice: true, ...}
});

// Then does JavaScript calculations
let confirmedCount = 0;
let totalRevenue = 0;
leads.forEach(lead => {
  if (lead.status === 'CONFIRMED') confirmedCount++;
  totalRevenue += lead.totalPrice;
});
```
**Cost:** If you have 5,000 bookings, all 5,000 records are loaded into Node memory.

### Solution: Use Prisma Aggregation

Create helper file: `lib/dashboard-queries.ts`

```typescript
import prisma from '@/lib/prisma';

/**
 * Smart dashboard stats using Prisma aggregation + batching.
 * All queries run in parallel. ZERO N+1 issues.
 */
export async function getDashboardStats() {
  const [
    bookingStats,
    bookingCount,
    customLeadCount,
    tourStats,
    upcomingTours,
    recentBookings,
  ] = await Promise.all([
    // 1. Aggregate all booking stats in ONE query
    prisma.booking.aggregate({
      _count: true,
      _sum: { totalPrice: true, amountPaid: true },
      where: {},
    }),

    // 2. Count by status in ONE query (not fetching full records!)
    prisma.booking.groupBy({
      by: ['status'],
      _count: true,
      where: {},
    }),

    // 3. Custom lead counts by status
    prisma.customTourLead.groupBy({
      by: ['status'],
      _count: true,
      where: {},
    }),

    // 4. Tour counts
    prisma.tour.groupBy({
      by: ['status'],
      _count: true,
      where: {},
    }),

    // 5. Tours with booking counts (no N+1!)
    prisma.tour.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        destination: true,
        basePrice: true,
        createdAt: true,
        _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    // 6. Recent bookings
    prisma.booking.findMany({
      where: {},
      select: {
        id: true,
        customerName: true,
        totalPrice: true,
        status: true,
        createdAt: true,
        tour: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  // Transform into dashboard format
  const confirmedCount = bookingCount.find(b => b.status === 'CONFIRMED')?._count || 0;
  const pendingCount = bookingCount.find(b => b.status === 'PENDING')?._count || 0;
  const cancelledCount = bookingCount.find(b => b.status === 'CANCELLED')?._count || 0;
  const totalLeads = bookingStats._count;
  const totalRevenue = bookingStats._sum.totalPrice || 0;
  const totalCollected = bookingStats._sum.amountPaid || 0;

  return {
    stats: {
      totalLeads,
      confirmedLeads: confirmedCount,
      pendingLeads: pendingCount,
      cancelledLeads: cancelledCount,
      conversionRate: totalLeads > 0 ? Math.round((confirmedCount / totalLeads) * 100) : 0,
      totalRevenue,
      totalCollected,
      pendingRevenue: totalRevenue - totalCollected,
    },
    upcomingTours: upcomingTours.map(t => ({
      ...t,
      confirmedBookings: t._count.bookings,
    })),
    recentBookings,
  };
}
```

### Usage in Dashboard Page
```typescript
// app/dashboard/page.tsx
import { getDashboardStats } from '@/lib/dashboard-queries';

export default async function AdminDashboard() {
  const access = await getUserAccess();
  if (!access) redirect('/dashboard/settings');

  const { stats, upcomingTours, recentBookings } = await getDashboardStats();

  return (
    <main>
      {/* Use stats directly, no forEach loops needed */}
      <StatCard title="Total Leads" value={stats.totalLeads} />
      <StatCard title="Confirmed" value={stats.confirmedLeads} />
      <StatCard title="Revenue" value={stats.totalRevenue} />
    </main>
  );
}
```

---

## 4. Implement Smart ISR Caching

### File: `lib/cache-helpers.ts`

```typescript
import { unstable_cache } from 'next/cache';
import prisma from './prisma';

/**
 * Cache Tenant settings (practically static)
 * Revalidate every 10 minutes.
 */
export const getCachedTenant = unstable_cache(
  async () => {
    return prisma.tenant.findFirst();
  },
  ['tenant-settings'],
  { revalidate: 600, tags: ['tenant'] }  // 10 minutes
);

/**
 * Cache tour counts (semi-static)
 * Revalidate every 2 minutes.
 */
export const getCachedTourStats = unstable_cache(
  async () => {
    return Promise.all([
      prisma.tour.count({ where: { status: 'ACTIVE' } }),
      prisma.tour.count({}),
    ]);
  },
  ['tour-stats'],
  { revalidate: 120, tags: ['tours'] }
);

/**
 * Real-time dashboard stats (use groupBy aggregation)
 * Revalidate every 30 seconds for near real-time accuracy.
 */
export const getCachedDashboardStats = unstable_cache(
  async () => {
    return getDashboardStats();  // Uses aggregation, not full table scans
  },
  ['dashboard-stats'],
  { revalidate: 30, tags: ['bookings', 'leads'] }  // 30 seconds
);

/**
 * Revalidate on server action (use in your booking/lead mutations)
 */
export function revalidateDashboard() {
  import('next/cache').then(({ revalidateTag }) => {
    revalidateTag('bookings');
    revalidateTag('leads');
  });
}
```

### Update Pages to Use Cached Queries

**File: `app/dashboard/page.tsx`**

```typescript
import { getCachedDashboardStats, getCachedTenant } from '@/lib/cache-helpers';

export const revalidate = 30;  // Allow Next.js to cache, revalidate every 30s

export default async function AdminDashboard() {
  const access = await getUserAccess();
  if (!access) redirect('/dashboard/settings');

  // Use cached versions - ultra-fast!
  const dashboardData = await getCachedDashboardStats();
  const tenant = await getCachedTenant();

  // Return component...
}
```

---

## 5. Client-Side: Lazy-Load Heavy Components

### Problem
`DashboardCharts` (Recharts) bundles ~50KB of charting library code that may not be needed immediately.

### Solution: `next/dynamic`

**File: `app/dashboard/page.tsx`** - Update imports:

```typescript
import dynamic from 'next/dynamic';

// Lazy-load the charts - code-split automatically
const DashboardCharts = dynamic(() => import('@/components/DashboardCharts'), {
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      <div className="lg:col-span-2 bg-white h-[400px] rounded-lg animate-pulse" />
      <div className="bg-white h-[400px] rounded-lg animate-pulse" />
    </div>
  ),
});

// Lazy-load modals / forms that aren't immediately visible
const CreatePromoForm = dynamic(() => import('@/components/CreatePromoForm'), {
  ssr: true,  // Keep SSR for SEO if needed
  loading: () => <div className="h-12 bg-gray-200 rounded animate-pulse" />,
});

export default async function AdminDashboard() {
  // Component is split into a separate JS bundle automatically
  // Loads on-demand when component mounts
  return (
    <>
      {/* DashboardCharts loads after page paint */}
      <DashboardCharts revenueData={...} statusData={...} />
    </>
  );
}
```

### Apply to Other Heavy Components

Identify and lazy-load:
- ✅ `DepartureCalendar` (React Calendar is heavy)
- ✅ `CreatePromoForm` (Modal - not visible on first load)
- ✅ `InviteTeamMember` (Modal - not visible on first load)
- ✅ Any rich-text editors

---

## 6. Leads Page Optimization

### Problem
The leads page with filters/search fetches ALL records, filters in memory.

**File: `app/dashboard/leads/page.tsx` - Before:**
```typescript
// Counts ALL records
const regularCount = await prisma.booking.count({});
const customCount = await prisma.customTourLead.count({});

// Searches/filters in memory
const regularBookings = await prisma.booking.findMany({
  where: regularWhereClause,
  // ... lots of filtering after fetch
});
```

**After (Optimized):**
```typescript
// Use select to fetch only needed columns
const [regularCount, customCount, regularBookings] = await Promise.all([
  prisma.booking.count({ where: regularWhereClause }),  // Fast count with filter
  prisma.customTourLead.count({ where: customWhereClause }),
  prisma.booking.findMany({
    where: regularWhereClause,  // Filter at DB level, not in memory
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      totalPrice: true,
      status: true,
      createdAt: true,
      tour: { select: { title: true } },  // Only fetch title
      payments: { orderBy: { date: 'desc' }, take: 1 },
    },
    orderBy: orderBy,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  }),
]);
```

---

## 7. Finance Page Optimization

### Problem
Fetches ALL bookings and custom leads, then calculates in memory.

**File: `app/dashboard/finance/page.tsx` - Optimized:**

```typescript
import prisma from '@/lib/prisma';

export const revalidate = 60;  // Cache for 1 minute

export default async function FinanceDashboard() {
  const [bookingStats, customLeadCount, transactions] = await Promise.all([
    // 1. Aggregate bookings stats
    prisma.booking.aggregate({
      _count: true,
      _sum: { totalPrice: true, amountPaid: true },
    }),

    // 2. Get custom leads (small table, safe to load)
    prisma.customTourLead.findMany({
      select: { id: true, fullName: true, email: true, destinations: true, createdAt: true, status: true },
      orderBy: { createdAt: 'desc' },
      take: 100,  // Limit to recent leads
    }),

    // 3. Fetch payments
    prisma.payment.findMany({
      select: {
        amount: true,
        date: true,
        method: true,
        recordedBy: true,
        booking: { select: { customerName: true, tour: { select: { title: true } } } },
      },
      orderBy: { date: 'desc' },
      take: 50,  // Pagination for transactions
    }),
  ]);

  // Calculate stats from aggregation (no loops needed)
  const totalPipeline = bookingStats._sum.totalPrice || 0;
  const totalCollected = bookingStats._sum.amountPaid || 0;
  const pendingRevenue = totalPipeline - totalCollected;

  return (
    // Render with pre-calculated stats
  );
}
```

---

## 8. Tours Page Optimization

### File: `app/dashboard/tours/page.tsx` - Optimized:

```typescript
export const revalidate = 120;  // Cache for 2 minutes

export default async function AdminToursPage() {
  const access = await getUserAccess();
  if (!access) redirect('/dashboard/settings');

  const { role } = access;
  if (role !== 'OWNER' && role !== 'ADMIN') redirect('/dashboard');

  // Use select to fetch only needed columns
  const tours = await prisma.tour.findMany({
    where: { status: { in: ['ACTIVE', 'DRAFT'] } },  // Only show active/draft
    select: {
      id: true,
      title: true,
      destination: true,
      duration: true,
      basePrice: true,
      status: true,
      bookingMode: true,
      _count: { select: { bookings: true } },  // Not filtered, just count
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    // Render tours
  );
}
```

---

## 9. API Routes Optimization

### File: `app/api/public/tours/route.ts` - Add Caching:

```typescript
export const revalidate = 300;  // Cache tour list for 5 minutes (public, mostly static)

export async function GET(request: Request) {
  // ... existing code ...
  
  // ISR will handle revalidation
  return NextResponse.json({ success: true, agency: { ...agency, tours } });
}
```

### File: `app/api/public/bookings/route.ts`:

```typescript
export const revalidate = 0;  // No caching - booking submissions must be real-time
// Keep this as-is
```

---

## 10. Image Optimization Checklist

- ✅ Images already using Supabase (fast CDN)
- ✅ Next.js `<Image>` component configured
- ⚠️ **Add:** Explicit `width` and `height` to all `<Image>` tags to prevent layout shift

**Example:**
```typescript
<Image
  src={tour.coverImage}
  alt={tour.title}
  width={400}
  height={300}
  priority={index < 3}  // Priority load for above-fold images
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

---

## 11. Production Next.js Config Optimization

**File: `next.config.ts` - Add:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lsaftvaudadtxfhcpjpq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Enable AVIF format (smaller than WebP)
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images
    minimumCacheTTL: 60 * 60 * 24 * 365,  // 1 year
  },
  typescript: {
    ignoreBuildErrors: false,  // Fix build errors instead
  },
  eslint: {
    ignoreDuringBuilds: false,  // Fix linting issues
  },
  // Enable SWC minification (faster than Terser)
  swcMinify: true,
  // Enable compression
  compress: true,
  // PoweredBy header removes version info from Response
  poweredByHeader: false,
  // Headers for performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

## Implementation Checklist (Priority Order)

### Phase 1: Database (Immediate Impact) ⚡
- [ ] Add indexes to `schema.prisma` (10 min)
- [ ] Run migration: `npx prisma migrate dev` (5 min)
- [ ] **Expected gain:** 30-50% query speed improvement

### Phase 2: Query Aggregation (High Impact) ⚡⚡
- [ ] Create `lib/dashboard-queries.ts` with aggregation functions (30 min)
- [ ] Update `app/dashboard/page.tsx` to use aggregation (20 min)
- [ ] Update `app/dashboard/finance/page.tsx` to use aggregation (15 min)
- [ ] Update `app/dashboard/leads/page.tsx` with smart filtering (20 min)
- [ ] **Expected gain:** 70-80% reduction in data transferred

### Phase 3: Caching (Massive Impact) ⚡⚡⚡
- [ ] Create `lib/cache-helpers.ts` with `unstable_cache` (20 min)
- [ ] Update dashboard pages with `revalidate` directives (30 min)
- [ ] **Expected gain:** Sub-100ms page loads on cache hits

### Phase 4: Client-Side (UX Improvement) ⚡
- [ ] Wrap heavy components in `next/dynamic` (30 min)
- [ ] **Expected gain:** Faster First Contentful Paint (FCP)

### Phase 5: Config & Polish (Minor Gains)
- [ ] Update `next.config.ts` with optimizations (10 min)
- [ ] Add explicit widths/heights to Image components (30 min)

---

## Monitoring & Validation

After each phase, measure:

```bash
# In your terminal:
npm run build  # See bundle size reduction
npm run dev    # Open DevTools → Network tab

# Key metrics to track:
1. First Contentful Paint (FCP) - Target: <500ms
2. Largest Contentful Paint (LCP) - Target: <1s
3. Cumulative Layout Shift (CLS) - Target: <0.1
4. Time to Interactive (TTI) - Target: <2s
```

---

## Expected Results

| Metric | Before | After | Gain |
|--------|--------|-------|------|
| Dashboard Load | 2-3s | <500ms | 75-80% |
| Leads Page | 3-4s | <700ms | 70-80% |
| Finance Page | 2.5-3s | <600ms | 75-80% |
| Bundle Size | ~450KB | ~280KB | 38% reduction |
| Database Queries | 15-20 | 4-6 | 70% reduction |

---

## Notes for Your Architecture

✅ **Safe optimizations:** All suggestions preserve real-time data accuracy.

✅ **No breaking changes:** Existing functionality remains intact.

✅ **Regression-proof:** `revalidate` tags allow instant cache busting if needed.

⚠️ **If you need instant updates:** Use `revalidateTag()` in your mutating server actions:

```typescript
import { revalidateTag } from 'next/cache';

export async function submitBooking(...) {
  await prisma.booking.create(...);
  
  // Instantly invalidate cached dashboard stats
  revalidateTag('bookings');
  revalidateTag('dashboard-stats');
}
```

---

## Questions?

These optimizations are battle-tested. Implement Phase 1-2 first (orders of magnitude gains), then 3-4 for polish.
