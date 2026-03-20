// app/suspended/page.tsx
import { ShieldAlert } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

export default function SuspendedPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="absolute top-6 right-6">
                <UserButton afterSignOutUrl="/" />
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-red-100 max-w-md text-center">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="text-red-500 w-10 h-10" />
                </div>
                
                <h1 className="text-2xl font-black text-gray-900 mb-2">Account Suspended</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Your access to the Tour Management System has been temporarily restricted. This is usually due to an overdue subscription payment.
                </p>
                
                <a 
                    href="https://wa.me/+923393836344" 
                    className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                    Contact Billing Support
                </a>
            </div>
        </div>
    );
}