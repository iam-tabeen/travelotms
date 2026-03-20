import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Users, Lock, ShieldCheck, Mail, MoreVertical } from 'lucide-react';
import InviteTeamMember from '@/components/InviteTeamMember';
import { getUserAccess } from '@/lib/getTenant'; 
import TeamMemberActions from '@/components/TeamMemberActions';

export const dynamic = 'force-dynamic';

export default async function TeamDashboard() {
    const access = await getUserAccess();
    
    if (!access) redirect('/admin/settings');

    const { tenant, role } = access;

    // 🛡️ THE ROUTE GUARD: Kick out anyone who isn't an Owner or Admin
    if (role !== 'OWNER' && role !== 'ADMIN') {
        redirect('/admin'); 
    }

    const isPro = tenant.planTier === 'PRO';

    const teamMembers = isPro ? await prisma.teamMember.findMany({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: 'desc' }
    }) : [];

    return (
        <main className="min-h-screen bg-[#F4F7F9] py-6 md:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 team-bg-main">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

                <style>{`
                  /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                  html.dark .team-bg-main { background-color: #0F172A !important; }
                  html.dark .team-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
                  html.dark .team-bg-muted { background-color: #0F172A !important; border-color: #334155 !important; }
                  
                  html.dark .team-text-primary { color: #FFFFFF !important; }
                  html.dark .team-text-secondary { color: #94A3B8 !important; }
                  
                  html.dark .team-border-main { border-color: #334155 !important; }
                  html.dark .team-divide > :not([hidden]) ~ :not([hidden]) { border-top-color: #334155 !important; }
                  html.dark .team-hover-row:hover { background-color: rgba(30, 41, 59, 0.5) !important; }

                  /* Badges & Icons */
                  html.dark .team-badge-admin { background-color: #F1F5F9 !important; color: #0F172A !important; }
                  html.dark .team-badge-purple { background-color: rgba(168, 85, 247, 0.1) !important; color: #C084FC !important; border-color: rgba(168, 85, 247, 0.2) !important; }
                  html.dark .team-badge-blue { background-color: rgba(59, 130, 246, 0.1) !important; color: #60A5FA !important; border-color: rgba(59, 130, 246, 0.2) !important; }
                  html.dark .team-avatar-bg { background-color: #334155 !important; color: #94A3B8 !important; }

                  /* --- MOBILE RESPONSIVE TABLE MAGIC --- */
                  @media (max-width: 1024px) {
                    .table-container { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
                    .responsive-table, .responsive-table thead, .responsive-table tbody, .responsive-table th, .responsive-table td, .responsive-table tr { display: block; width: 100%; }
                    .responsive-table thead { display: none; }
                    
                    .responsive-table tbody tr { background: #fff; border-radius: 20px; border: 1px solid #E5E9F2; margin-bottom: 20px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
                    html.dark .responsive-table tbody tr { background: #1E293B !important; border-color: #334155 !important; }

                    .responsive-table tbody td { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F0F2F7; text-align: right; }
                    html.dark .responsive-table tbody td { border-bottom-color: #334155 !important; }
                    
                    .responsive-table tbody td:first-child { flex-direction: column; align-items: flex-start; padding-top: 0; border-bottom: 2px solid #F4F7F9; margin-bottom: 8px; }
                    html.dark .responsive-table tbody td:first-child { border-bottom-color: #0F172A !important; }

                    .responsive-table tbody td:last-child { border-bottom: none; padding-bottom: 0; padding-top: 16px; justify-content: flex-end; }
                    
                    .responsive-table tbody td::before { font-size: 10px; font-weight: 800; color: #8A93A7; text-transform: uppercase; letter-spacing: 0.08em; }
                    html.dark .responsive-table tbody td::before { color: #94A3B8 !important; }

                    .responsive-table tbody td:nth-child(1)::before { display: none; }
                    .responsive-table tbody td:nth-child(2)::before { content: 'Role & Access'; }
                    .responsive-table tbody td:nth-child(3)::before { content: 'Status'; }
                    .responsive-table tbody td:nth-child(4)::before { display: none; }
                  }
                `}</style>

                {/* Header */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-colors team-bg-card team-border-main">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-[#0A1628] uppercase tracking-tighter flex items-center gap-3 team-text-primary">
                            <Users className="text-[#2563EB]" size={32} />
                            Team Management
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium text-sm md:text-base team-text-secondary">Invite staff, travel agents, and manage workspace access.</p>
                    </div>
                    
                    {isPro && (
                        <InviteTeamMember tenantId={tenant.id} />
                    )}
                </div>

                {!isPro ? (
                    /* PRO UPSELL CARD */
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-[24px] p-8 md:p-12 text-center shadow-sm transition-colors team-bg-card team-border-main">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors team-bg-muted team-border-main border border-transparent">
                            <Lock className="text-gray-400 team-text-secondary" size={32} />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-[#0A1628] uppercase tracking-tighter team-text-primary">Unlock Workspace Teams</h2>
                        <p className="text-gray-500 max-w-md mx-auto mt-4 leading-relaxed text-sm md:text-base team-text-secondary">
                            Stop sharing passwords. Invite your travel agents, assign specific roles, and collaborate securely. Exclusive to <strong className="team-text-primary">PRO members</strong>.
                        </p>
                        <a 
                            href="https://travelotms.com/pricing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-8 inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all shadow-md w-full sm:w-auto cursor-pointer"
                        >
                            Upgrade to Pro
                        </a>
                    </div>
                ) : (
                    /* TEAM LIST (For Pro Users Only) */
                    <div className="table-container bg-white  shadow-sm border border-gray-100 overflow-visible transition-colors team-bg-card team-border-main">
                        <table className="responsive-table w-full text-left border-collapse">
                            <thead className="bg-gray-50/80 border-b border-gray-100 rounded-[24px] transition-colors team-bg-muted team-border-main">
                                <tr>
                                    <th className="p-5 md:p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest team-text-secondary">Team Member</th>
                                    <th className="p-5 md:p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest team-text-secondary">Role & Access</th>
                                    <th className="p-5 md:p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest team-text-secondary">Status</th>
                                    <th className="p-5 md:p-6 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right team-text-secondary">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 team-divide">
                                {/* The Owner is row #1 */}
                                <tr className="hover:bg-gray-50/50 transition-colors team-hover-row">
                                    <td className="p-5 md:p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black team-badge-blue border border-transparent">
                                                {tenant.companyName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 team-text-primary">You (Owner)</div>
                                                <div className="text-xs text-gray-500 font-medium mt-0.5 team-text-secondary">{tenant.adminEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 md:p-6">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest team-badge-admin">
                                            <ShieldCheck size={12} /> Admin
                                        </span>
                                    </td>
                                    <td className="p-5 md:p-6">
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                                        </span>
                                    </td>
                                    <td className="p-5 md:p-6 text-right">
                                        <span className="text-[11px] font-bold text-gray-400 italic team-text-secondary">Workspace Owner</span>
                                    </td>
                                </tr>

                                {teamMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3 transition-colors team-bg-muted">
                                                <Mail className="text-gray-400 team-text-secondary" size={20} />
                                            </div>
                                            <p className="text-gray-400 font-bold text-sm team-text-secondary">No team members invited yet.</p>
                                            <p className="text-gray-400 text-xs mt-1 team-text-secondary">Click "Invite Member" above to add staff.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    teamMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50/50 transition-colors team-hover-row">
                                            <td className="p-5 md:p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-black team-avatar-bg">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 team-text-primary">{member.name}</div>
                                                        <div className="text-xs text-gray-500 font-medium mt-0.5 team-text-secondary">{member.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5 md:p-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                                    member.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100 team-badge-purple' : 'bg-blue-50 text-[#2563EB] border-blue-100 team-badge-blue'
                                                }`}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="p-5 md:p-6">
                                                {member.status === 'ACTIVE' ? (
                                                    <span className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Active
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-bold text-orange-500 flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-5 md:p-6 flex justify-end">
                                                <TeamMemberActions memberId={member.id} currentRole={member.role} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}