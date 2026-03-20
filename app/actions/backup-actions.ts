"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from '@supabase/supabase-js';
import { sendBackupEmail } from '@/lib/mail';

// Initialize Supabase with the MASTER key so the server can upload to the private bucket
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function createBackup(tenantId: string, type: 'MANUAL' | 'AUTOMATIC') {
    try {
        // 1. FETCH ALL AGENCY DATA
        const leads = await prisma.booking.findMany({ 
            where: { tenantId },
            include: { tour: true } 
        });
        const customLeads = await prisma.customTourLead.findMany({ 
            where: { tenantId } 
        });

        if (leads.length === 0 && customLeads.length === 0) {
            return { success: false, error: "No data found to backup." };
        }

        // 2. BUILD THE CSV CONTENT
        const headers = "Type,Name,Email,Phone,Tour/Details,Value,Date\n";
        
        const regularRows = leads.map(l => {
            const name = `"${(l.customerName || '').replace(/"/g, '""')}"`;
            const email = `"${(l.customerEmail || '').replace(/"/g, '""')}"`;
            const phone = `"${(l.customerPhone || '').replace(/"/g, '""')}"`;
            const tour = `"${(l.tour?.title || 'Deleted Tour').replace(/"/g, '""')}"`;
            return `Regular,${name},${email},${phone},${tour},${l.totalPrice},${l.createdAt.toISOString()}`;
        }).join("\n");

        const customRows = customLeads.map(l => {
            const name = `"${(l.fullName || '').replace(/"/g, '""')}"`;
            const email = `"${(l.email || '').replace(/"/g, '""')}"`;
            const phone = `"${(l.phone || '').replace(/"/g, '""')}"`;
            return `Custom,${name},${email},${phone},"Custom Request",0,${l.createdAt.toISOString()}`;
        }).join("\n");

        const csvContent = headers + regularRows + (customRows ? "\n" + customRows : "");

        // --- NEW: FETCH THE TENANT'S TARGET EMAIL ---
        const tenantInfo = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { backupEmail: true, adminEmail: true }
        });
        
        // Fallback to their admin email if they haven't set a specific backup email
        const targetEmail = tenantInfo?.backupEmail || tenantInfo?.adminEmail;


        // 3. ENFORCE THE 5-BACKUP LIMIT (CLEANUP)
        const existingBackups = await prisma.backup.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'asc' } // Oldest first
        });

        if (existingBackups.length >= 5) {
            const oldestBackup = existingBackups[0];
            
            console.log(`Vault full. Deleting oldest backup to make room...`);

            // Delete the physical file from Supabase Storage
            if (oldestBackup.fileUrl) {
                await supabase.storage.from('backups').remove([oldestBackup.fileUrl]);
            }

            // Delete the record from Prisma
            await prisma.backup.delete({ where: { id: oldestBackup.id } });
        }


        // 4. GENERATE FILE NAMES & SEND EMAIL (IF AUTOMATIC)
        const timestamp = new Date().toISOString().split('T')[0];
        const fileName = `backup_${type.toLowerCase()}_${timestamp}_${Date.now()}.csv`;
        const storagePath = `${tenantId}/${fileName}`;

        // Send the email with the CSV attached!
        if (type === 'AUTOMATIC' && targetEmail) {
            console.log(`Sending automated backup email to: ${targetEmail}`);
            await sendBackupEmail(targetEmail, csvContent, fileName);
        }

        // 5. UPLOAD NEW FILE TO SUPABASE
        const { error: uploadError } = await supabase.storage
            .from('backups')
            .upload(storagePath, csvContent, {
                contentType: 'text/csv',
                upsert: true
            });

        if (uploadError) throw new Error("Failed to upload to Supabase: " + uploadError.message);


        // 6. SAVE NEW RECORD IN PRISMA
        await prisma.backup.create({
            data: {
                fileName,
                fileUrl: storagePath, 
                backupType: type,
                tenantId: tenantId
            }
        });

        revalidatePath('/admin/backups');
        return { success: true };

    } catch (error: any) {
        console.error("Backup Error:", error);
        return { success: false, error: error.message || "Failed to create backup" };
    }
}

export async function getBackupDownloadUrl(fileUrl: string) {
    try {
        // Create a secure URL that only lasts for 60 seconds
        const { data, error } = await supabase.storage
            .from('backups')
            .createSignedUrl(fileUrl, 60);

        if (error) throw new Error(error.message);
        
        return { success: true, url: data.signedUrl };
    } catch (error: any) {
        console.error("Download Error:", error);
        return { success: false, error: error.message };
    }
}
