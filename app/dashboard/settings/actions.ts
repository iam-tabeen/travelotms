"use server";

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { revalidateTenant } from '@/lib/cache-helpers';
import { getUserAccess } from '@/lib/getTenant';

export type SettingsFormState = { error?: string } | null;

export async function updateAgencySettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const { userId } = await auth();
  if (!userId) {
    return { error: 'You must be signed in to save settings.' };
  }

  const access = await getUserAccess();
  if (!access || (access.role !== 'OWNER' && access.role !== 'ADMIN')) {
    return { error: 'You do not have permission to update agency settings.' };
  }

  try {
    const existing = await prisma.tenant.findFirst();
    let finalLogoUrl = (formData.get('existingLogoUrl') as string) || existing?.logoUrl || '';
    const file = formData.get('logoFile') as File;

    if (file && file.size > 0) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return { error: 'Logo upload is not configured (missing Supabase keys).' };
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const fileBuffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, fileBuffer, { contentType: file.type, upsert: true });

      if (uploadError) {
        console.error('Logo upload failed:', uploadError);
        return { error: `Logo upload failed: ${uploadError.message}` };
      }

      const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      finalLogoUrl = publicUrlData.publicUrl;
    }

    const companyName = (formData.get('companyName') as string)?.trim() || 'My Agency';
    if (!companyName) {
      return { error: 'Agency name is required.' };
    }

    const backupEmailInput = (formData.get('backupEmail') as string)?.trim();
    const contactEmailInput = (formData.get('contactEmail') as string)?.trim();

    const sharedData = {
      companyName,
      logoUrl: finalLogoUrl || null,
      backupEmail: backupEmailInput || null,
      allowPartialPayments: formData.get('allowPartialPayments') === 'true',
      primaryColor: (formData.get('primaryColor') as string) || '#003580',
      accentColor: (formData.get('accentColor') as string) || '#FF8C00',
      navbarColor: (formData.get('navbarColor') as string) || '#003580',
      buttonColor: (formData.get('buttonColor') as string) || '#FF8C00',
      headingColor: (formData.get('headingColor') as string) || '#1F2937',
      navlink: (formData.get('navlink') as string) || '#111827',
      cardColor: (formData.get('cardColor') as string) || '#111827',
      footerColor: (formData.get('footerColor') as string) || '#111827',
      contactEmail: contactEmailInput || null,
      metaPixelId: ((formData.get('metaPixelId') as string) || '').trim() || null,
      whatsappNumber: ((formData.get('whatsappNumber') as string) || '').trim() || null,
    };

    if (existing) {
      await prisma.tenant.update({
        where: { id: existing.id },
        data: sharedData,
      });
    } else {
      const safeSubdomain =
        companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now().toString().slice(-4);

      await prisma.tenant.create({
        data: {
          userId,
          adminEmail: access.tenant.adminEmail ?? `admin-${userId}@agency.local`,
          subdomain: safeSubdomain,
          isActive: true,
          planTier: 'BASIC',
          ...sharedData,
        },
      });
    }
  } catch (error) {
    console.error('DATABASE SAVE FAILED:', error);
    const message = error instanceof Error ? error.message : 'Failed to save settings.';
    return { error: message };
  }

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/backups');
  revalidatePath('/');
  await revalidateTenant();
  redirect('/dashboard/settings');
}
