"use client";

import { useState } from 'react';
import Link from 'next/link';
import BookingForm from '@/components/BookingForm';
import Navbar from '@/components/lovable/Navbar';
import React from 'react';
import prisma from '@/lib/prisma';

export default function TourClient({ tour }: { tour: any }) {
    // State for interactive elements
    const [activeTab, setActiveTab] = useState('overview');
    const [mainImage, setMainImage] = useState(tour.coverImage);

    // Combine cover image and gallery for the slider thumbnails
    const allImages = [tour.coverImage, ...(tour.gallery || [])];

    return (
        <main className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* --- HEADER --- */}
                <div>
                    <Link href="/" className="text-sm font-bold text-gray-500 hover:text-axius-primary transition-colors mb-4 inline-block">
                        &larr; Back to Home
                    </Link>
                    <h1 className="text-4xl lg:text-5xl font-black text-axius-secondary mb-3">{tour.title}</h1>
                    <p className="text-gray-500 font-medium flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1" style={{fontFamily: 'var(--font-poppins)', fontWeight:"500"}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width={"12px"} style={{marginRight:"8px"}}><path fill="var(--theme-heading)" d="M192 284.4C256.1 269.9 304 212.5 304 144 304 64.5 239.5 0 160 0S16 64.5 16 144c0 68.5 47.9 125.9 112 140.4L128 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-195.6zM168 96c-30.9 0-56 25.1-56 56 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-57.4 46.6-104 104-104 13.3 0 24 10.7 24 24s-10.7 24-24 24z"/></svg> {tour.destination}</span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1" style={{fontFamily: 'var(--font-poppins)', fontWeight:"500"}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"16px"} style={{marginRight:"8px"}} color='var(--theme-heading)' ><path fill="currentColor" d="M256 0a256 256 0 1 1 0 512 256 256 0 1 1 0-512zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg> {tour.duration}</span>
                    </p>
                </div>

                {/* --- HERO GALLERY --- */}
                <div className="space-y-4">
                    {/* Main Large Image */}
                    <div className="w-full h-[400px] lg:h-[600px] rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative group">
                        <img src={mainImage} alt={tour.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>

                    {/* Thumbnails (Only show if there are extra gallery images) */}
                    {allImages.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto p-2  scrollbar-hide">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setMainImage(img)}
                                    className={`flex-shrink-0 w-32 h-20 rounded-xl overflow-hidden border-2 border-theme-primary  transition-all  ${mainImage === img ? 'border-axius-primary opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- MAIN CONTENT & SIDEBAR GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT COLUMN: Tabs & Content */}
                    <div className="lg:col-span-2 space-y-8 min-w-0">


                        {/* The 4 Tabs */}
                        <div className="flex flex-wrap bg-white rounded-2xl shadow-sm border border-gray-100 p-2 gap-2">
                            {['overview', 'itinerary', 'inclusions', 'policy'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab
                                            ? 'bg-axius-primary shadow-md'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-axius-secondary'
                                        } `}
                                >
                                    {tab === 'inclusions' ? 'Inclusions & Exclusions' : tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content Areas */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-10 min-h-[400px]">

                            {activeTab === 'overview' && (
                                <div className="animate-fadeIn">
                                    <h2 className="text-2xl font-black text-axius-secondary mb-6">Tour Overview</h2>
                                    {tour.overview ? (
                                        // THE FIX: Replaced invisible non-breaking spaces with real spaces so words wrap normally!
                                        <div 
                                          className="text-gray-600 leading-relaxed overflow-hidden break-words [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6"
                                          dangerouslySetInnerHTML={{ __html: tour.overview.replace(/&nbsp;/g, ' ') }} 
                                        />
                                    ) : (
                                        <p className="text-gray-400 italic">Overview coming soon.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'itinerary' && (
                                <div className="animate-fadeIn">
                                    <h2 className="text-2xl font-black text-axius-secondary mb-8">Day-by-Day Itinerary</h2>
                                    <div className="space-y-8">
                                        {tour.itineraryDays.map((day: any, index: number) => (
                                            <div key={day.id} className="relative flex gap-6">
                                                {/* Connecting Line */}
                                                {index !== tour.itineraryDays.length - 1 && (
                                                    <div className="absolute top-12 bottom-[-2rem] left-6 w-0.5 bg-gray-100"></div>
                                                )}
                                                <div className="relative z-10 w-12 h-12 bg-[#FBFDFF] border-2 border-axius-primary text-axius-primary rounded-2xl flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
                                                    {day.dayNumber}
                                                </div>
                                                <div className="pt-2 pb-6 min-w-0">
                                                    <h3 className="text-lg font-bold text-axius-secondary">{day.title}</h3>
                                                    <p className="text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap break-words">{day.details}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inclusions' && (
                                <div className="animate-fadeIn">
                                    <h2 className="text-2xl font-black text-axius-secondary mb-8">What's Included</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div>
                                            <h3 className="text-sm font-black uppercase text-green-600 tracking-widest mb-4 flex items-center gap-2">
                                                <span>✅</span> Inclusions
                                            </h3>
                                            <ul className="space-y-4">
                                                {tour.inclusions?.length > 0 ? tour.inclusions.map((inc: string, i: number) => (
                                                    <li key={i} className="flex gap-3 text-gray-600 text-sm font-medium">
                                                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> 
                                                        <span className="break-words">{inc}</span>
                                                    </li>
                                                )) : <li className="text-gray-400 italic text-sm">No inclusions listed.</li>}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase text-red-500 tracking-widest mb-4 flex items-center gap-2">
                                                <span>❌</span> Exclusions
                                            </h3>
                                            <ul className="space-y-4">
                                                {tour.exclusions?.length > 0 ? tour.exclusions.map((exc: string, i: number) => (
                                                    <li key={i} className="flex gap-3 text-gray-600 text-sm font-medium">
                                                        <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span> 
                                                        <span className="break-words">{exc}</span>
                                                    </li>
                                                )) : <li className="text-gray-400 italic text-sm">No exclusions listed.</li>}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'policy' && (
                                <div className="animate-fadeIn">
                                    <h2 className="text-2xl font-black text-axius-secondary mb-6">Tour Policy & Terms</h2>
                                    {tour.policy ? (
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            {/* THE FIX: Replaced invisible non-breaking spaces here as well */}
                                            <div 
                                              className="text-gray-600 leading-relaxed text-sm overflow-hidden break-words [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6"
                                              dangerouslySetInnerHTML={{ __html: tour.policy.replace(/&nbsp;/g, ' ') }} 
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 italic">Policies coming soon.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">

                            {/* Booking Box */}
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Price Per Person</p>
                                    <h3 className="text-4xl font-black text-axius-secondary" style={{ color: "var(--theme-primary)" }}>
                                        Rs. {tour.basePrice.toLocaleString()}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {tour.bookingMode !== 'WHATSAPP' && (
                                        <BookingForm tourId={tour.id} tenantId={tour.tenantId} basePrice={tour.basePrice} />
                                    )}

                                    {tour.bookingMode === 'BOTH' && (
                                        <div className="flex items-center gap-4 px-2 my-4">
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Or</span>
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                        </div>
                                    )}

                                    {tour.bookingMode !== 'FORM' && (
                                        <a
                                            href={`https://wa.me/923393836344?text=${encodeURIComponent(`Hello Axius Digital! I am interested in booking the "${tour.title}" for Rs. ${tour.basePrice.toLocaleString()}. Please share more details.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#1ebd5a] transition flex items-center justify-center gap-2 text-center shadow-md"
                                            style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold" , fontSize:"16px"}} >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width={"26px"} style={{marginRight:"10px"}} ><path fill="currentColor" d="M380.9 97.1c-41.9-42-97.7-65.1-157-65.1-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480 117.7 449.1c32.4 17.7 68.9 27 106.1 27l.1 0c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1s56.2 81.2 56.1 130.5c0 101.8-84.9 184.6-186.6 184.6zM325.1 300.5c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8s-14.3 18-17.6 21.8c-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7s-12.5-30.1-17.1-41.2c-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4s4.6-24.1 3.2-26.4c-1.3-2.5-5-3.9-10.5-6.6z"/></svg> Book on WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Need Help Box */}
                            <div className="bg-[#FBFDFF] rounded-3xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-xl font-black text-axius-secondary mb-6" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold"}}>Need Help?</h3>
                                <ul className="space-y-5">
                                    <li className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-axius-primary flex items-center justify-center text-lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"18px"} color='var(--theme-heading)' ><path fill="currentColor" d="M160.2 25C152.3 6.1 131.7-3.9 112.1 1.4l-5.5 1.5c-64.6 17.6-119.8 80.2-103.7 156.4 37.1 175 174.8 312.7 349.8 349.8 76.3 16.2 138.8-39.1 156.4-103.7l1.5-5.5c5.4-19.7-4.7-40.3-23.5-48.1l-97.3-40.5c-16.5-6.9-35.6-2.1-47 11.8l-38.6 47.2C233.9 335.4 177.3 277 144.8 205.3L189 169.3c13.9-11.3 18.6-30.4 11.8-47L160.2 25z"/></svg></div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold">Call us on</p>
                                            <p className="text-sm font-black text-axius-secondary" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold"}}>+92 339 3836344</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-axius-primary flex items-center justify-center text-lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"18px"}  color='var(--theme-heading)' ><path fill="currentColor" d="M256 0a256 256 0 1 1 0 512 256 256 0 1 1 0-512zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg></div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold">Timing</p>
                                            <p className="text-sm font-black text-axius-secondary" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold"}}>10AM to 7PM</p>
                                        </div>
                                    </li>
                                    <li className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-axius-primary flex items-center justify-center text-lg"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"18px"} color='var(--theme-heading)'><path fill="currentColor" d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm0-336c-17.7 0-32 14.3-32 32 0 13.3-10.7 24-24 24s-24-10.7-24-24c0-44.2 35.8-80 80-80s80 35.8 80 80c0 47.2-36 67.2-56 74.5l0 3.8c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-8.1c0-20.5 14.8-35.2 30.1-40.2 6.4-2.1 13.2-5.5 18.2-10.3 4.3-4.2 7.7-10 7.7-19.6 0-17.7-14.3-32-32-32zM224 368a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg></div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold">Got Questions?</p>
                                            <button className="text-sm font-black text-axius-primary hover:underline" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold"}}>Let Us Call You</button>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}