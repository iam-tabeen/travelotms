"use server";

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export async function updateAgencySettings(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // We generate a 100% guaranteed unique email using your local Clerk ID.
  // This ensures your local development never collides with your live Supabase data!
  const guaranteedUniqueEmail = `admin-${userId}@axius.local`;

  try {
    let finalLogoUrl = (formData.get('existingLogoUrl') as string) || "";
    const file = formData.get('logoFile') as File;

    if (file && file.size > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase keys are missing in your .env file!");
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const fileBuffer = await file.arrayBuffer();

      const { error } = await supabase.storage
        .from('logos')
        .upload(fileName, fileBuffer, { contentType: file.type, upsert: true });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      finalLogoUrl = publicUrlData.publicUrl;
    }

    const companyName = (formData.get('companyName') as string) || "Axius Agency";
    const safeSubdomain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now().toString().slice(-4);
    
    // --- Extract backup email from the form data ---
    const backupEmailInput = formData.get('backupEmail') as string;
    const finalBackupEmail = backupEmailInput ? backupEmailInput : null;

    // --- NEW: Extract the Financial Setting Checkbox ---
    // If the checkbox is checked, it sends 'true', otherwise it returns null
    const allowPartialPayments = formData.get('allowPartialPayments') === 'true';

    await prisma.tenant.upsert({
      where: { userId: userId },
      update: {
        companyName: companyName,
        logoUrl: finalLogoUrl,
        backupEmail: finalBackupEmail, 
        allowPartialPayments: allowPartialPayments, // <-- Added here
        primaryColor: (formData.get('primaryColor') as string) || "#003580",
        accentColor: (formData.get('accentColor') as string) || "#FF8C00",
        navbarColor: (formData.get('navbarColor') as string) || "#003580",
        buttonColor: (formData.get('buttonColor') as string) || "#FF8C00",
        headingColor: (formData.get('headingColor') as string) || "#1F2937",
        navlink: (formData.get('navlink') as string) || "#111827",
        cardColor: (formData.get('cardColor') as string) || "#111827",
        footerColor: (formData.get('footerColor') as string) || "#111827",
      },
      create: {
        userId: userId,
        adminEmail: guaranteedUniqueEmail,
        subdomain: safeSubdomain,
        companyName: companyName,
        logoUrl: finalLogoUrl,
        backupEmail: finalBackupEmail, 
        allowPartialPayments: allowPartialPayments, // <-- Added here
        primaryColor: (formData.get('primaryColor') as string) || "#003580",
        accentColor: (formData.get('accentColor') as string) || "#FF8C00",
        navbarColor: (formData.get('navbarColor') as string) || "#003580",
        buttonColor: (formData.get('buttonColor') as string) || "#FF8C00",
        headingColor: (formData.get('headingColor') as string) || "#1F2937",
        navlink: (formData.get('navlink') as string) || "#111827",
        cardColor: (formData.get('cardColor') as string) || "#111827",
        footerColor: (formData.get('footerColor') as string) || "#111827",
      }
    });

  } catch (error) {
    console.error("❌❌❌ DATABASE SAVE FAILED ❌❌❌");
    console.error(error);
    return;
  }

  // Redirect to Dashboard after successful save
  revalidatePath('/admin/settings');
  revalidatePath('/admin/backups'); 
  revalidatePath('/');
  redirect('/admin'); 
} 