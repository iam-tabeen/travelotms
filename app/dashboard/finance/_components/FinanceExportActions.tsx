import prisma from '@/lib/prisma';
import FinanceExportButton from '@/components/FinanceExportButton';

export default async function FinanceExportActions({ isPro }: { isPro: boolean }) {
  const transactions = await prisma.payment.findMany({
    select: {
      id: true,
      date: true,
      amount: true,
      method: true,
      notes: true,
      booking: {
        select: {
          customerName: true,
          customerEmail: true,
          tour: { select: { title: true } },
        },
      },
    },
    orderBy: { date: 'desc' },
    take: 500,
  });

  const formattedTransactions = transactions.map((t) => ({
    _rawDate: t.date,
    Payment_ID: t.id,
    Date: new Date(t.date).toLocaleDateString(),
    Amount: t.amount,
    Method: t.method,
    Client_Name: t.booking?.customerName || 'Unknown',
    Client_Email: t.booking?.customerEmail || 'Unknown',
    Tour: t.booking?.tour?.title || 'Unknown Tour',
    Notes: t.notes || '',
  }));

  return <FinanceExportButton transactions={formattedTransactions} isPro={isPro} />;
}
