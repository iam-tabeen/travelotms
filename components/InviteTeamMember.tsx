"use client";

import { useState } from 'react';
import { UserPlus, X, Mail, Shield, User, KeyRound } from 'lucide-react';
import { inviteTeamMember } from '@/app/actions/team';

export default function InviteTeamMember() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        const result = await inviteTeamMember(formData);

        if (result?.error) {
            setError(result.error);
            setIsSubmitting(false);
        } else {
            setIsOpen(false);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <style>{`
                /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
                html.dark .team-modal-bg { background-color: #1E293B !important; }
                html.dark .team-modal-header { background-color: #0F172A !important; border-bottom-color: #334155 !important; }
                
                html.dark .team-text-primary { color: #FFFFFF !important; }
                html.dark .team-text-secondary { color: #94A3B8 !important; }
                
                html.dark .team-input { 
                    background-color: #0F172A !important; 
                    border-color: #334155 !important; 
                    color: white !important; 
                }
                html.dark .team-input:focus { border-color: #3B82F6 !important; background-color: #0F172A !important; }
                
                html.dark .team-border-subtle { border-color: #334155 !important; }
                html.dark .team-close-btn { background-color: #1E293B !important; border-color: #475569 !important; color: #94A3B8 !important; }
                html.dark .team-close-btn:hover { color: #F87171 !important; border-color: rgba(239, 68, 68, 0.3) !important; }
            `}</style>

            <button 
                onClick={() => setIsOpen(true)}
                className="w-full md:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
                <UserPlus size={18} />
                Add Member
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden transform transition-all relative team-modal-bg">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 team-modal-header">
                            <div>
                                <h3 className="font-black text-[#0A1628] uppercase tracking-tight text-lg team-text-primary">Add Team Member</h3>
                                <p className="text-xs font-bold text-gray-500 mt-1 team-text-secondary">Create an account for your staff.</p>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-full p-2 transition-colors cursor-pointer shadow-sm team-close-btn"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center uppercase tracking-widest">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2 flex items-center gap-1.5 team-text-secondary">
                                    <User size={14} className="text-[#2563EB]" /> Full Name
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    required 
                                    placeholder="e.g. Sarah Jenkins"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all bg-gray-50 team-input" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2 flex items-center gap-1.5 team-text-secondary">
                                    <Mail size={14} className="text-[#2563EB]" /> Email Address
                                </label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    required 
                                    placeholder="sarah@agency.com"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all bg-gray-50 team-input" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2 flex items-center gap-1.5 team-text-secondary">
                                    <KeyRound size={14} className="text-[#2563EB]" /> Temporary Password
                                </label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    required 
                                    minLength={8}
                                    placeholder="Must be at least 8 characters"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all bg-gray-50 team-input" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2 flex items-center gap-1.5 team-text-secondary">
                                    <Shield size={14} className="text-[#2563EB]" /> Role & Permissions
                                </label>
                                <select 
                                    name="role" 
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all cursor-pointer text-gray-700 bg-gray-50 team-input"
                                >
                                    <option value="AGENT">Agent (Can view and manage leads)</option>
                                    <option value="ADMIN">Admin (Full workspace access)</option>
                                    <option value="VIEWER">Viewer (Read-only access)</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-gray-100 mt-2 team-border-subtle">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full bg-[#2563EB] text-white font-black py-3 rounded-xl text-sm uppercase tracking-widest shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? "Creating..." : "Create Account"}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}
        </>
    );
}