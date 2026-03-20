"use server";

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function duplicateTour(tourId: string) {
    try {
        // 1. Fetch the existing tour
        const existingTour = await prisma.tour.findUnique({
            where: { id: tourId },
        });

        if (!existingTour) throw new Error("Tour not found");

        // 2. Strip out unique identifiers 
        // (Removed 'updatedAt' since your schema doesn't use it!)
        // Note: If it throws a red line under 'createdAt' next, just delete 'createdAt, ' from this line too!
        const { id, createdAt, ...tourData } = existingTour;

        // 3. Create the new cloned tour
        const newTour = await prisma.tour.create({
            data: {
                ...tourData,
                title: `${tourData.title} (Copy)`,
                // Note: If your schema has a unique 'slug' field, you'll need to update it here too!
                // slug: `${tourData.slug}-copy-${Date.now()}` 
            }
        });

        // 4. Refresh the page data
        revalidatePath('/admin/tours');
        
        return { success: true, newTourId: newTour.id };

    } catch (error) {
        console.error("Failed to duplicate tour:", error);
        return { success: false, error: "Failed to duplicate tour" };
    }
}