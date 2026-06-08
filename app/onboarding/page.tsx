import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Building2, Shield, ArrowRight } from 'lucide-react';

export default async function OnboardingPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Check if a Tenant record exists
  const existingTenant = await prisma.tenant.findFirst();

  // Variables to track our success state so we can redirect OUTSIDE the try/catch
  let shouldRedirectToSettings = false;
  let shouldRedirectToDashboard = false;

  // Case 1: NO Tenant exists - Create the Tenant record and make this user the owner
  if (!existingTenant) {
    try {
      await prisma.tenant.create({
        data: {
          companyName: user.firstName ? `${user.firstName}'s Agency` : 'My Travel Agency',
          subdomain: 'agency', // Default subdomain
          adminEmail: user.emailAddresses[0]?.emailAddress || '',
          userId: userId, // Make this user the owner
          isActive: true,
          planTier: 'BASIC',
        },
      });
      shouldRedirectToSettings = true; // Mark as success!
    } catch (error) {
      console.error('Failed to create tenant:', error);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <Shield size={48} className="mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Setup Error</h1>
            <p className="text-gray-600 mb-6">
              There was an error setting up your agency. Please try again or contact support.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </Link>
          </div>
        </div>
      );
    }
  }

  // Case 2: Tenant exists BUT has no userId - Update to assign this user as owner
  else if (existingTenant && !existingTenant.userId) {
    try {
      await prisma.tenant.update({
        where: { id: existingTenant.id },
        data: {
          userId: userId, // Assign this user as the owner
          adminEmail: user.emailAddresses[0]?.emailAddress || existingTenant.adminEmail,
        },
      });
      shouldRedirectToDashboard = true; // Mark as success!
    } catch (error) {
      console.error('Failed to assign tenant ownership:', error);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <Shield size={48} className="mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Error</h1>
            <p className="text-gray-600 mb-6">
              There was an error granting you access. Please contact your administrator.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      );
    }
  }

  // Case 3: Tenant exists and already has an owner (and it's not this user)
  else if (existingTenant && existingTenant.userId && existingTenant.userId !== userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <Shield size={48} className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            This agency dashboard has already been claimed by another user.
            Please contact your administrator for access.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Agency: {existingTenant.companyName}
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Case 4: The user matches the existing tenant owner!
  else if (existingTenant && existingTenant.userId === userId) {
      shouldRedirectToDashboard = true;
  }

  // --- THE FIX: Perform Redirects OUTSIDE of Try/Catch blocks ---
  if (shouldRedirectToSettings) {
    redirect('/dashboard/settings');
  }

  if (shouldRedirectToDashboard) {
    redirect('/dashboard');
  }

  // Absolute fallback just in case
  redirect('/dashboard');
}