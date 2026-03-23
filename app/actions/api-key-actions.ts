'use server'

import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

export async function generateApiKey(tenantId: string) {
  try {
    // 1. Generate a secure, random 32-character hex string
    const rawKey = crypto.randomBytes(32).toString('hex');
    
    // Prefix it so it looks professional and is easy to identify
    const formattedKey = `tm_live_${rawKey}`; 

    // 2. Upsert the key (Create it if it doesn't exist, overwrite if it does)
    await prisma.apiKey.upsert({
      where: { tenantId: tenantId },
      update: { key: formattedKey },
      create: {
        tenantId: tenantId,
        key: formattedKey,
      }
    });

    // 3. Refresh the Super Admin page to show the new key instantly
    revalidatePath('/super-admin'); 
    
    return { success: true, message: 'API Key generated successfully!' };
  } catch (error) {
    console.error("Failed to generate API Key:", error);
    return { success: false, message: 'Failed to generate API Key.' };
  }
}