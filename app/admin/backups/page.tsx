import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ShieldCheck, Lock, Download, FileText } from 'lucide-react';
import BackupActions from '@/components/BackupActions';
import DownloadBackupButton from '@/components/DownloadBackupButton';
import { getUserAccess } from '@/lib/getTenant';

// Force Next.js to always fetch the freshest data for this page
export const dynamic = 'force-dynamic';

export default async function SafetyVaultPage() {
    // 2. Fetch the access object
    const access = await getUserAccess();
    if (!access) redirect('/admin/settings');
    
    const { tenant, role } = access;

    // 🛡️ THE ROUTE GUARD: Kick out anyone who isn't an Owner or Admin
    if (role !== 'OWNER' && role !== 'ADMIN') {
        redirect('/admin'); 
    }

    // 3. Fetch the backups explicitly using tenantId
    const backups = await prisma.backup.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' } // Shows newest first
    });

    const isPro = tenant.planTier === 'PRO';

    return (
        <main className="min-h-screen bg-axius-bg py-12 px-6 sm:px-12 lg:px-24 transition-colors duration-300 vault-bg-main">
            
            {/* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */}
            <style>{`
                html.dark .vault-bg-main { background-color: #0F172A !important; }
                html.dark .vault-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
                html.dark .vault-bg-muted { background-color: #0F172A !important; border-color: #334155 !important; }
                
                html.dark .vault-text-primary { color: #FFFFFF !important; }
                html.dark .vault-text-secondary { color: #94A3B8 !important; }
                
                html.dark .vault-border-main { border-color: #334155 !important; }
                html.dark .vault-divide > :not([hidden]) ~ :not([hidden]) { border-top-color: #334155 !important; }
                html.dark .vault-hover-row:hover { background-color: rgba(30, 41, 59, 0.5) !important; }

                /* Badges */
                html.dark .vault-badge-purple { background-color: rgba(168, 85, 247, 0.15) !important; color: #C084FC !important; border-color: rgba(168, 85, 247, 0.3) !important; }
                html.dark .vault-badge-blue { background-color: rgba(59, 130, 246, 0.15) !important; color: #60A5FA !important; border-color: rgba(59, 130, 246, 0.3) !important; }
                html.dark .vault-badge-green { color: #4ADE80 !important; }

                /* Upsell */
                html.dark .vault-btn-dark { background-color: #F1F5F9 !important; color: #0F172A !important; }
                html.dark .vault-btn-dark:hover { background-color: #FFFFFF !important; }
            `}</style>

            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 transition-colors vault-bg-card vault-border-main">
                    <div>
                        <h1 className="text-3xl font-black text-axius-secondary  tracking-tighter flex items-center gap-3 vault-text-primary">
                            <ShieldCheck className="text-green-500 vault-badge-green" size={32} />
                            Database Backups
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium vault-text-secondary">Manage your automated and manual database backups.</p>
                    </div>

                    {/* The Backup Trigger Button */}
                    <BackupActions isPro={isPro} tenantId={tenant.id} />
                </div>

                {!isPro ? (
                    /* PRO UPSELL CARD */
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center shadow-sm transition-colors vault-bg-card vault-border-main">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors vault-bg-muted vault-border-main border border-transparent">
                            <Lock className="text-gray-400 vault-text-secondary" size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-axius-secondary uppercase tracking-tighter vault-text-primary">Unlock Data Insurance</h2>
                        <p className="text-gray-500 max-w-md mx-auto mt-4 leading-relaxed vault-text-secondary">
                            Automatic monthly backups, manual snapshots, and secure cloud storage are exclusive to <strong className="vault-text-primary">PRO members</strong>. Never lose a lead again.
                        </p>
                        <a 
                            href="https://travelotms.com/pricing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all shadow-md w-full sm:w-auto cursor-pointer vault-btn-dark"
                        >
                            Upgrade to Pro
                        </a>
                    </div>
                ) : (
                    /* BACKUP LIST */
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 px-4 vault-text-secondary">Recent Backups (Last 5)</h3>

                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden transition-colors vault-bg-card vault-border-main">
                            {backups.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center justify-center">
                                    <FileText size={48} className="text-gray-200 vault-text-secondary mb-4 opacity-20" />
                                    <p className="text-gray-400 font-bold italic vault-text-secondary">No backups created yet. Click the button above to generate your first backup.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-100 transition-colors vault-bg-muted vault-border-main">
                                        <tr>
                                            <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest vault-text-secondary">Date & Time</th>
                                            <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest vault-text-secondary">Type</th>
                                            <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest vault-text-secondary">Status</th>
                                            <th className="p-6 text-xs font-black text-axius-secondary uppercase tracking-widest text-right vault-text-secondary">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 vault-divide">
                                        {backups.map((backup) => (
                                            <tr key={backup.id} className="hover:bg-gray-50 transition-colors vault-hover-row">
                                                <td className="p-6">
                                                    <div className="text-sm font-bold text-gray-900 vault-text-primary">
                                                        {new Date(backup.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium mt-1 vault-text-secondary">
                                                        {new Date(backup.createdAt).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md border transition-colors ${backup.backupType === 'AUTOMATIC'
                                                            ? 'bg-purple-50 text-purple-600 border-purple-100 vault-badge-purple'
                                                            : 'bg-blue-50 text-axius-primary border-blue-100 vault-badge-blue'
                                                        }`}>
                                                        {backup.backupType}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 vault-badge-green">
                                                        <ShieldCheck size={14} /> Secure
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <DownloadBackupButton fileUrl={backup.fileUrl} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-500 text-center italic mt-6 vault-text-secondary">
                            * Vault capacity is limited to 5 backups. Oldest backups are automatically emailed to your admin address to make room for new ones.
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}