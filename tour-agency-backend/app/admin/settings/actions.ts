"use server";

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Storage Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function updateAgencySettings(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    let finalLogoUrl = formData.get('existingLogoUrl') as string;
    const file = formData.get('logoFile') as File;

    // 1. Check if a new file was actually selected
    if (file && file.size > 0) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      // 2. THE FIX: Convert the raw file into an ArrayBuffer so Node.js can process it safely
      const fileBuffer = await file.arrayBuffer();

      // 3. Upload the buffer directly to Supabase
      const { error } = await supabase.storage
        .from('logos')
        .upload(fileName, fileBuffer, {
          contentType: file.type,
          upsert: true // Allows overwriting if needed
        });

      if (error) {
        console.error("Supabase Upload Error:", error.message);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      finalLogoUrl = publicUrlData.publicUrl;
    }

    // 4. Update Database
    await prisma.tenant.update({
      where: { userId: userId },
      data: {
        companyName: formData.get('companyName') as string,
        logoUrl: finalLogoUrl,
        primaryColor: formData.get('primaryColor') as string,
        accentColor: formData.get('accentColor') as string,
        navbarColor: formData.get('navbarColor') as string,
        buttonColor: formData.get('buttonColor') as string,
        headingColor: formData.get('headingColor') as string,
        navlink: formData.get('navlink') as string,
        cardColor: formData.get('cardColor') as string,
        footerColor: formData.get('footerColor') as string,
      },
    });

    revalidatePath('/admin/settings');
    revalidatePath('/'); 
  } catch (error) {
    console.error("Failed to update settings:", error);
  }
}