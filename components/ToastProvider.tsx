"use client";

import { useEffect, Suspense } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// 1. Move the searchParams logic into its own hidden component
function ToastLogic() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const successMsg = searchParams.get('success');
        const errorMsg = searchParams.get('error');

        if (successMsg) {
            toast.success(successMsg.replace(/_/g, ' '), { duration: 4000 });
            // Clean the URL without reloading the page
            router.replace(pathname, { scroll: false });
        }

        if (errorMsg) {
            toast.error(errorMsg.replace(/_/g, ' '), { duration: 5000 });
            // Clean the URL without reloading the page
            router.replace(pathname, { scroll: false });
        }
    }, [searchParams, pathname, router]);

    return null; // This component doesn't render any UI
}

// 2. Wrap the logic component in Suspense
export default function ToastProvider() {
    return (
        <>
            <Toaster 
                position="bottom-right" 
                toastOptions={{
                    style: {
                        background: '#fff',
                        color: '#0A1628',
                        fontWeight: '600',
                        fontSize: '14px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                        border: '1px solid #E5E9F2'
                    },
                    success: {
                        iconTheme: { primary: '#10B981', secondary: '#fff' },
                    },
                    error: {
                        iconTheme: { primary: '#EF4444', secondary: '#fff' },
                    },
                }}
            />
            {/* The Suspense boundary protects the build from crashing here */}
            <Suspense fallback={null}>
                <ToastLogic />
            </Suspense>
        </>
    );
}