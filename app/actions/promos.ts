"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { revalidatePromos } from '@/lib/cache-helpers';

export async function createPromoCode(formData: FormData) {
    const code = (formData.get('code') as string).toUpperCase().replace(/\s+/g, ''); // Force uppercase, no spaces
    const discountType = formData.get('discountType') as string;
    const discountValue = parseFloat(formData.get('discountValue') as string);
    const usageLimitRaw = formData.get('usageLimit') as string;
    const validUntilRaw = formData.get('validUntil') as string;

    const usageLimit = usageLimitRaw ? parseInt(usageLimitRaw) : null;
    const validUntil = validUntilRaw ? new Date(validUntilRaw) : null;

    try {
        await prisma.promoCode.create({
            data: {
                code,
                discountType,
                discountValue,
                usageLimit,
                validUntil,
                isActive: true,
            }
        });
        
        revalidatePath('/dashboard/promos');
        await revalidatePromos();
        return { success: true };
    } catch (error) {
        console.error("Failed to create promo code:", error);
        return { success: false, error: "Code might already exist or invalid data." };
    }
}

export async function togglePromoStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.promoCode.update({
            where: { id },
            data: { isActive: !currentStatus }
        });
        revalidatePath('/dashboard/promos');
        await revalidatePromos();
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle promo:", error);
        return { success: false };
    }
}

export async function validatePromoCode(code: string) {
    try {
        const promo = await prisma.promoCode.findUnique({
            where: { code: code.toUpperCase().replace(/\s+/g, '') }
        });

        if (!promo) return { error: "Invalid promo code." };
        if (!promo.isActive) return { error: "This promo code is no longer active." };
        if (promo.validUntil && new Date() > new Date(promo.validUntil)) return { error: "This promo code has expired." };
        if (promo.usageLimit && promo.timesUsed >= promo.usageLimit) return { error: "This promo code has reached its usage limit." };

        return { 
            success: true, 
            id: promo.id,
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue 
        };
    } catch (error) {
        console.error("Promo validation error:", error);
        return { error: "Something went wrong checking the code." };
    }
}