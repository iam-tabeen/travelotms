
import prisma from '@/lib/prisma';
import Link from 'next/link';
import DeleteTourButton from '@/components/DeleteTourButton';
import { deleteTour } from './add-tour/actions';
import BookingModeDropdown from '@/components/BookingModeDropdown';
import { UserButton } from "@clerk/nextjs";
import { auth } from '@clerk/nextjs/server';
import React from 'react';

export default async function AdminDashboard() {
  const { userId } = await auth(); // Get the logged-in ID

  if (!userId) return null;

  // 1. Fetch the tenant data to get the custom colors
  const tenant = await prisma.tenant.findUnique({
    where: { userId: userId }
  });

  if (!tenant) return <div>Please configure your agency settings first.</div>;

  // 2. Fetch the tours
  const tours = await prisma.tour.findMany({
    where: {
      tenant: { userId: userId } // ONLY fetch tours for this user
    },
    orderBy: { createdAt: 'desc' }
  });

  // 3. Map database colors to global CSS variables
  const globalTheme = {
    '--theme-primary': tenant.primaryColor || '#003580',
    '--theme-accent': tenant.accentColor || '#FF8C00',
    '--theme-navbar': tenant.navbarColor || '#003580',
    '--theme-button': tenant.buttonColor || '#FF8C00',
    '--theme-heading': tenant.headingColor || '#1F2937',
    '--theme-footer': tenant.footerColor || '#111827', 
    '--theme-card': tenant.cardColor || '#111827', 
    '--navlink': tenant.navlink || '#111827', 
    // Mapped the axius variables so your Tailwind classes work here too!
    '--axius-primary': tenant.primaryColor || '#003580',
    '--axius-secondary': tenant.headingColor || '#1F2937',
  } as React.CSSProperties;

  return (
    // 4. Spread the globalTheme into the existing background image styles
    <main style={{
      ...globalTheme,
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0)), url('/assets/images/Background.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }} className="min-h-screen pt-12 pl-12 pr-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8 mb-6">

        {/* Dashboard Header */}
        <div className="bg-white p-8 rounded-2xl flex items-center shadow-sm border border-gray-200 flex justify-between mobile-column">
          <div>
            <h1 className="text-3xl font-black text-axius-secondary uppercase">Agency Dashboard</h1>
            <p className="text-gray-600 font-medium">Manage all your tour activities.</p>
          </div>
          <div className='flex gap-4 items-center mobile-responsive-bottons-container'>
            
            <Link href="/admin/leads" style={{ color:"Black", height: "50px" , fontFamily: 'var(--font-poppins)', fontWeight:"600" , fontSize:"14px" }} className="bg-primary border-2 border-gray-200 shadow-sm text-white px-8 items-center flex rounded-xl font-bold uppercase  tracking-widest text-xs hover:bg-gray-50 transition-all text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"16px"} style={{marginRight:"8px"}}><path fill="currentColor" d="M28.4 86.9C32.9 55.4 59.9 32 91.8 32l328.5 0c31.8 0 58.9 23.4 63.4 54.9l27.8 194.3c.4 3 .6 6 .6 9.1L512 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 290.3c0-3 .2-6.1 .6-9.1L28.4 86.9zM420.2 96l-328.5 0-27.4 192 59.9 0c12.1 0 23.2 6.8 28.6 17.7l14.3 28.6c5.4 10.8 16.5 17.7 28.6 17.7l120.4 0c12.1 0 23.2-6.8 28.6-17.7l14.3-28.6c5.4-10.8 16.5-17.7 28.6-17.7l59.9 0-27.4-192zM152 128l208 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-208 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm0 80l208 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-208 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z"/></svg> View Leads
            </Link>

            <Link href="/admin/settings" style={{ color:"Black", height: "50px" , fontFamily: 'var(--font-poppins)', fontWeight:"600" , fontSize:"14px" }} className="bg-primary border-2 border-gray-200 shadow-sm text-white px-8 items-center flex rounded-xl font-bold uppercase mobile-responsive-buttons  tracking-widest text-xs hover:bg-gray-50 transition-all text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"16px"} style={{marginRight:"8px"}}><path fill="currentColor" d="M195.1 9.5C198.1-5.3 211.2-16 226.4-16l59.8 0c15.2 0 28.3 10.7 31.3 25.5L332 79.5c14.1 6 27.3 13.7 39.3 22.8l67.8-22.5c14.4-4.8 30.2 1.2 37.8 14.4l29.9 51.8c7.6 13.2 4.9 29.8-6.5 39.9L447 233.3c.9 7.4 1.3 15 1.3 22.7s-.5 15.3-1.3 22.7l53.4 47.5c11.4 10.1 14 26.8 6.5 39.9l-29.9 51.8c-7.6 13.1-23.4 19.2-37.8 14.4l-67.8-22.5c-12.1 9.1-25.3 16.7-39.3 22.8l-14.4 69.9c-3.1 14.9-16.2 25.5-31.3 25.5l-59.8 0c-15.2 0-28.3-10.7-31.3-25.5l-14.4-69.9c-14.1-6-27.2-13.7-39.3-22.8L73.5 432.3c-14.4 4.8-30.2-1.2-37.8-14.4L5.8 366.1c-7.6-13.2-4.9-29.8 6.5-39.9l53.4-47.5c-.9-7.4-1.3-15-1.3-22.7s.5-15.3 1.3-22.7L12.3 185.8c-11.4-10.1-14-26.8-6.5-39.9L35.7 94.1c7.6-13.2 23.4-19.2 37.8-14.4l67.8 22.5c12.1-9.1 25.3-16.7 39.3-22.8L195.1 9.5zM256.3 336a80 80 0 1 0 -.6-160 80 80 0 1 0 .6 160z"/></svg> Settings
            </Link>
            
            {/* THE FIX: Fixed the missing closing parenthesis on var(--theme-primary) */}
            <Link href="/admin/add-tour" style={{ background:"#4389f7", height: "50px" , fontFamily: 'var(--font-poppins)', fontWeight:"600" , fontSize:"14px" }} className="bg-primary text-white px-8 items-center flex rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width={"16px"} style={{marginRight:"8px"}}><path fill="currentColor" d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"/></svg> Add New Tour
            </Link>

            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: {
                    width: "2.75rem",
                    height: "2.75rem",
                    border: "2px solid var(--theme-primary)",
                  },
                  userButtonTrigger: {
                    borderRadius: "50%", 
                    boxShadow: "none", 
                    outline: "none",
                  },
                }
              }}
            />
          </div>
        </div>

        {/* Manage Tours Table */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-black text-axius-secondary uppercase tracking-widest" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700"}}>Active Listings ({tours.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-axius-secondary uppercase text-left" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold" , fontSize:"14px"}}>Tour Details</th>
                  <th className="px-6 py-4 text-xs font-black text-axius-secondary uppercase text-left" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold" , fontSize:"14px"}}>Status</th>
                  <th className="px-6 py-4 text-xs font-black text-axius-secondary uppercase text-left" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold" , fontSize:"14px"}}>Booking Option</th>
                  <th className="px-6 py-4 text-xs font-black text-axius-secondary uppercase text-left" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold" , fontSize:"14px"}}>Price</th>
                  <th className="px-6 py-4 text-xs font-black text-axius-secondary uppercase text-right" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold" , fontSize:"14px"}}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
              {tours.map((tour: any) => (
                  <tr key={tour.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-axius-secondary group-hover:text-axius-primary transition-colors" style={{fontFamily: 'var(--font-poppins)', fontWeight:"500" , fontSize:"16px"}}>{tour.title}</p>
                      <p className="text-xs text-gray-400 font-medium">{tour.destination} • {tour.duration}</p>
                    </td>
                    <td className="px-6 py-4" >
                      {tour.status === 'ACTIVE' ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Active
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <BookingModeDropdown
                        tourId={tour.id}
                        currentMode={tour.bookingMode || 'BOTH'}
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-axius-secondary" style={{fontFamily: 'var(--font-poppins)', fontWeight:"500" , fontSize:"16px"}}>
                      Rs. {tour.basePrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/admin/edit-tour/${tour.id}`}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                          title="Edit Tour"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"22px"} ><path fill="currentColor" d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L368 46.1 465.9 144 490.3 119.6c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L432 177.9 334.1 80 172.4 241.7zM96 64C43 64 0 107 0 160L0 416c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 96c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 64z"/></svg>
                        </Link>

                        {/* Delete Form with Server Action */}
                        <DeleteTourButton tourId={tour.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tours.length === 0 && (
            <div className="text-center py-20 text-gray-400 italic font-medium">
              Your database is currently empty.
            </div>
          )}
        </div>
      </div>
      <div className='flex justify-center mt-6 shadow-md  py-2 mobile-responsive-footer' style={{width:"72rem", margin:"auto", position:"inherit", bottom:"0px", backgroundColor:"white", borderRadius:"50px"  }}>
      <p style={{fontFamily: 'var(--font-poppins)', fontWeight:"300" , fontSize:"15px", textAlign:"center"}} >Copyright © 2026 Travelo TMS. All Rights Reserved. A product by Axius Digital</p>
      </div>
    </main>
  );
  <footer></footer>
}