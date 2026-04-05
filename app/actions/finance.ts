"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function logPayment(bookingId: string, amount: number, method: string, notes: string) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const agentName = user.firstName ? `${user.firstName} ${user.lastName}` : "Agent";

    try {
        // 1. Get the current booking
        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!booking) throw new Error("Booking not found");

        // 2. Calculate new totals
        const newAmountPaid = booking.amountPaid + amount;
        
        // If they paid everything (or overpaid), mark it PAID. Otherwise, PARTIAL.
        const newPaymentStatus = newAmountPaid >= booking.totalPrice ? "PAID" : "PARTIAL";

        // 3. Save the payment AND update the booking in one secure transaction
        await prisma.$transaction([
            prisma.payment.create({
                data: {
                    bookingId,
                    amount,
                    method,
                    notes,
                    recordedBy: agentName,
                }
            }),
            prisma.booking.update({
                where: { id: bookingId },
                data: {
                    amountPaid: newAmountPaid,
                    paymentStatus: newPaymentStatus
                }
            })
        ]);

        // 4. Refresh the pages so the UI updates instantly
        revalidatePath('/dashboard/leads');
        revalidatePath('/dashboard/finance');
        
        return { success: true };
    } catch (error) {
        console.error("Failed to log payment:", error);
        return { error: "Failed to log payment" };
    }
}