"use server";

import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import {
  revalidateDashboard,
  revalidateFinance,
  revalidatePromos,
  revalidateTours,
} from '@/lib/cache-helpers';

type BookingPayload = {
  tourId: string;
  fullName: string;
  email: string;
  phone: string;
  travelDate: string;
  travelers: string;
  specialNotes?: string;
  selectedAddOns?: string;
  finalPrice: number;
  promoCodeId?: string | null;
  isWaitlist?: boolean;
};

export async function submitPublicBooking(payload: BookingPayload) {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant?.isActive) {
    return { success: false, error: 'Agency account is not active.' };
  }

  if (!payload.tourId || !payload.fullName || !payload.email || !payload.travelDate) {
    return { success: false, error: 'Missing required booking details.' };
  }

  try {
    const tour = await prisma.tour.findUnique({ where: { id: payload.tourId } });
    const tourName = tour?.title ?? 'Tour';

    if (!payload.isWaitlist && tour) {
      await prisma.tour.update({
        where: { id: payload.tourId },
        data: { bookedSpots: { increment: parseInt(payload.travelers) || 1 } },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        tourId: payload.tourId,
        customerName: payload.fullName,
        customerEmail: payload.email,
        customerPhone: payload.phone,
        travelDate: new Date(payload.travelDate),
        numTravelers: parseInt(payload.travelers) || 1,
        specialNotes: payload.specialNotes || '',
        selectedAddOns: payload.selectedAddOns || '',
        totalPrice: parseInt(String(payload.finalPrice)),
        status: 'PENDING',
        isWaitlist: payload.isWaitlist || false,
        paymentStatus: 'UNPAID',
        amountPaid: 0,
      },
    });

    if (payload.promoCodeId) {
      await prisma.promoCode.update({
        where: { id: payload.promoCodeId },
        data: { timesUsed: { increment: 1 } },
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });
      const notifyEmail = tenant.contactEmail || tenant.adminEmail;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: notifyEmail,
        replyTo: payload.email,
        subject: `New Booking Request: ${tourName} - ${payload.fullName}`,
        html: `<p>New booking from your website for <strong>${tourName}</strong>.</p>
          <p>Customer: ${payload.fullName} (${payload.email})</p>
          <p>Travelers: ${payload.travelers} | Date: ${payload.travelDate}</p>
          <p>Total: Rs. ${parseInt(String(payload.finalPrice)).toLocaleString()}</p>`,
      });
    } catch (emailError) {
      console.error('Booking saved; email failed:', emailError);
    }

    await revalidateDashboard();
    await revalidateFinance();
    await revalidateTours();

    return {
      success: true,
      message: payload.isWaitlist ? 'Added to waitlist!' : 'Booking requested successfully!',
      bookingId: booking.id,
    };
  } catch (error) {
    console.error('submitPublicBooking error:', error);
    return { success: false, error: 'Failed to submit booking.' };
  }
}

export async function validatePublicPromo(code: string) {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant?.isActive || tenant.planTier !== 'PRO') {
    return { error: 'Promo codes are not available.' };
  }

  const normalized = code.toUpperCase().replace(/\s+/g, '');
  const promo = await prisma.promoCode.findUnique({ where: { code: normalized } });

  if (!promo) return { error: 'Invalid promo code.' };
  if (!promo.isActive) return { error: 'This promo code is no longer active.' };
  if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
    return { error: 'This promo code has expired.' };
  }
  if (promo.usageLimit !== null && promo.timesUsed >= promo.usageLimit) {
    return { error: 'This promo code has reached its usage limit.' };
  }

  return {
    success: true,
    promo: {
      id: promo.id,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    },
  };
}
