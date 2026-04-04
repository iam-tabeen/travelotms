'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { unlockSuperAdminDashboard } from './actions';
import { ShieldAlert, Lock } from 'lucide-react';

export default function SuperAdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        startTransition(async () => {
            const res = await unlockSuperAdminDashboard(username, password);
            if (res.success) {
                router.refresh(); // This reloads the page to show the dashboard!
            } else {
                setError(res.error || 'Failed to authenticate');
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex flex-col items-center mb-8 text-center">
                    <ShieldAlert className="text-red-500 w-12 h-12 mb-4" />
                    <h1 className="text-2xl font-black text-white tracking-tight">Restricted Access</h1>
                    <p className="text-gray-400 text-sm mt-2">Please enter the master credentials to proceed.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-red-500 transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 outline-none focus:border-red-500 transition-colors"
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-xs font-bold text-center mt-2">{error}</p>}

                    <button 
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg mt-6 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isPending ? 'Verifying...' : <><Lock size={16} /> Unlock Dashboard</>}
                    </button>
                </form>
            </div>
        </div>
    );
}