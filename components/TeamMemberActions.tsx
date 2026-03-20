"use client";

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Shield, User, Trash2 } from 'lucide-react';
import { updateTeamMemberRole, removeTeamMember } from '@/app/actions/team';

export default function TeamMemberActions({ memberId, currentRole }: { memberId: string, currentRole: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRoleChange = async (newRole: 'AGENT' | 'VIEWER') => {
        setIsLoading(true);
        try {
            await updateTeamMemberRole(memberId, newRole);
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to remove this team member? They will lose access to the dashboard immediately.")) {
            setIsLoading(true);
            try {
                await removeTeamMember(memberId);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <style>{`
                /* 🛡️ DARK MODE ACTION MENU OVERRIDES 🛡️ */
                html.dark .team-action-btn { 
                    background-color: #1E293B !important; 
                    border-color: #334155 !important; 
                    color: #94A3B8 !important; 
                }
                html.dark .team-action-btn:hover { color: white !important; border-color: #475569 !important; }
                
                html.dark .team-action-dropdown { 
                    background-color: #1E293B !important; 
                    border-color: #334155 !important; 
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
                }
                
                html.dark .team-action-item { color: #E2E8F0 !important; }
                html.dark .team-action-item:hover { background-color: rgba(59, 130, 246, 0.1) !important; color: #60A5FA !important; }
                
                html.dark .team-action-divider { background-color: #334155 !important; }
                
                html.dark .team-action-delete { color: #F87171 !important; }
                html.dark .team-action-delete:hover { background-color: rgba(239, 68, 68, 0.1) !important; }
            `}</style>

            <button 
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center team-action-btn ${
                    isOpen || isLoading ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700 bg-white border border-gray-200'
                }`}
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                ) : (
                    < MoreVertical size={16} />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border-2 border-gray-300 z-[100] animate-fadeIn overflow-hidden team-action-dropdown">
                    <div className="p-2 flex flex-col gap-1">
                        
                        {currentRole === 'VIEWER' && (
                            <button 
                                onClick={() => handleRoleChange('AGENT')}
                                className="w-full text-left px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2 cursor-pointer transition-colors team-action-item"
                            >
                                <Shield size={14} /> Make Agent
                            </button>
                        )}

                        {currentRole === 'AGENT' && (
                            <button 
                                onClick={() => handleRoleChange('VIEWER')}
                                className="w-full text-left px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors team-action-item"
                            >
                                <User size={14} /> Make Viewer
                            </button>
                        )}
                        
                        <div className="h-px bg-gray-100 my-0.5 team-action-divider"></div>
                        
                        <button 
                            onClick={handleDelete}
                            className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors team-action-delete"
                        >
                            <Trash2 size={14} /> Remove Access
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}