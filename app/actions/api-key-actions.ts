'use server'

import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

export async function generateApiKey() {
  try {
    // 1. Generate a secure, random 32-character hex string
    const rawKey = crypto.randomBytes(32).toString('hex');

    // Prefix it so it looks professional and is easy to identify
    const formattedKey = `tm_live_${rawKey}`;

    // 2. Fetch the single tenant settings row to get its ID
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) throw new Error('Agency settings not found. Please save your settings first.');

    // 3. Upsert the key (Create it if it doesn't exist, overwrite if it does)
    await prisma.apiKey.upsert({
      where: { tenantId: tenant.id },
      update: { key: formattedKey },
      create: {
        tenantId: tenant.id,
        key: formattedKey,
      }
    });

    revalidatePath('/super-admin');

    return { success: true, message: 'API Key generated successfully!' };
  } catch (error) {
    console.error("Failed to generate API Key:", error);
    return { success: false, message: 'Failed to generate API Key.' };
  }
}