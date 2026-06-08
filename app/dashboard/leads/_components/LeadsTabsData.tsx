import prisma from '@/lib/prisma';
import LeadsTabs from '@/components/LeadsTabs';

export default async function LeadsTabsData() {
  const [regularCount, customCount] = await Promise.all([
    prisma.booking.count(),
    prisma.customTourLead.count(),
  ]);

  return <LeadsTabs regularCount={regularCount} customCount={customCount} />;
}
