"use client";

import { useState } from 'react';
import Link from 'next/link';
import { updateTour } from '../../add-tour/actions';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function EditTourForm({ tour }: { tour: any }) {
  // --- WIZARD / TAB STATE ---
  const [activeTab, setActiveTab] = useState(1);
  const totalTabs = 4;

  const [days, setDays] = useState(tour.itineraryDays || []);
  
  // 1. Cover Image State
  const [coverImageUrl, setCoverImageUrl] = useState(tour.coverImage || "");
  const [isUploading, setIsUploading] = useState(false);

  // 2. Gallery Images State
  const [galleryUrls, setGalleryUrls] = useState<string[]>(tour.gallery || []);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);

  // 3. Rich Text State
  const [overview, setOverview] = useState(tour.overview || "");
  const [policy, setPolicy] = useState(tour.policy || "");

  const [addOns, setAddOns] = useState<{name: string, price: number}[]>(tour.addOns ? (typeof tour.addOns === 'string' ? JSON.parse(tour.addOns) : tour.addOns) : []);
  const [newAddOn, setNewAddOn] = useState({ name: '', price: '' });

  const handleAddExtra = () => {
    if (newAddOn.name && newAddOn.price) {
      setAddOns([...addOns, { name: newAddOn.name, price: parseFloat(newAddOn.price) }]);
      setNewAddOn({ name: '', price: '' });
    }
  };

  // 4. Departure Type & Schedule States
  const [departureType, setDepartureType] = useState(tour.departureType || 'CLIENT_CHOICE');
  
  // Parse the blocked dates from the database (fallback to empty array)
  let initialBlockedDates = [];
  try {
    initialBlockedDates = typeof tour.blockedDates === 'string' 
      ? JSON.parse(tour.blockedDates) 
      : (tour.blockedDates || []);
  } catch(e) {}
  
  const [blockedDates, setBlockedDates] = useState<string[]>(initialBlockedDates);
  const [blockDateInput, setBlockDateInput] = useState("");

  // Format the existing database date to YYYY-MM-DD for the HTML input
  const formattedDate = tour.departureDate 
    ? new Date(tour.departureDate).toISOString().split('T')[0] 
    : "";

  // --- Blocked Dates Handlers ---
  const handleAddBlockedDate = () => {
    if (blockDateInput && !blockedDates.includes(blockDateInput)) {
      setBlockedDates([...blockedDates, blockDateInput]);
      setBlockDateInput("");
    }
  };

  const removeBlockedDate = (dateToRemove: string) => {
    setBlockedDates(blockedDates.filter(d => d !== dateToRemove));
  };

  // --- Itinerary Handlers ---
  const handleAddDay = () => {
    setDays([...days, { dayNumber: days.length + 1, title: '', details: '' }]);
  };

  const handleRemoveDay = (indexToRemove: number) => {
    const filteredDays = days.filter((_: any, index: number) => index !== indexToRemove);
    const reIndexedDays = filteredDays.map((day: any, idx: number) => ({
      ...day,
      dayNumber: idx + 1
    }));
    setDays(reIndexedDays);
  };

  const handleDayChange = (index: number, field: string, value: string) => {
    const updatedDays = [...days];
    updatedDays[index] = { ...updatedDays[index], [field]: value };
    setDays(updatedDays);
  };

  // Single Cover Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'tour_uploads'); 
    const cloudName = 'dmjgwmkuy'; 

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.secure_url) {
        setCoverImageUrl(data.secure_url);
      } else {
        alert(`Cloudinary Error: ${data.error?.message || 'Check console for details'}`);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Network error. Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  // Multiple Gallery Images Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsGalleryUploading(true);
    const newUrls: string[] = [];
    const cloudName = 'dmjgwmkuy';

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      formData.append('upload_preset', 'tour_uploads'); 

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) newUrls.push(data.secure_url);
      } catch (error) {
        console.error("Gallery upload failed", error);
      }
    }

    setGalleryUrls((prev) => [...prev, ...newUrls]);
    setIsGalleryUploading(false);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTourWithId = updateTour.bind(null, tour.id);

  return (
    <>
      <style>{`
        /* 🛡️ GUARANTEED DARK MODE OVERRIDES 🛡️ */
        
        /* 1. MAGIC FIX FOR PARENT BACKGROUND */
        html.dark main { background-color: #0F172A !important; }

        html.dark .edit-bg-card { background-color: #1E293B !important; border-color: #334155 !important; }
        html.dark .edit-bg-muted { background-color: rgba(15, 23, 42, 0.6) !important; border-color: #334155 !important; }
        html.dark .edit-border-subtle { border-color: #334155 !important; }
        
        html.dark .edit-text-primary { color: #FFFFFF !important; }
        html.dark .edit-text-secondary { color: #94A3B8 !important; }
        
        /* Form Inputs */
        html.dark .edit-input { background-color: #0F172A !important; border-color: #334155 !important; color: #FFFFFF !important; }
        html.dark .edit-input::placeholder { color: #475569 !important; }
        html.dark .edit-input:focus { border-color: #3B82F6 !important; }
        
        /* 2. MAGIC FIX FOR ITINERARY CONTRAST */
        html.dark .edit-day-card { background-color: #0F172A !important; border-color: #334155 !important; }
        html.dark .edit-day-input { background-color: #1E293B !important; border-color: #475569 !important; color: #FFFFFF !important; }
        html.dark .edit-day-input::placeholder { color: #64748B !important; }
        html.dark .edit-day-input:focus { border-color: #3B82F6 !important; }

        /* Colored Wrappers */
        html.dark .edit-bg-blue-soft { background-color: rgba(59, 130, 246, 0.1) !important; border-color: rgba(59, 130, 246, 0.2) !important; }
        html.dark .edit-bg-orange-soft { background-color: rgba(249, 115, 22, 0.1) !important; border-color: rgba(249, 115, 22, 0.2) !important; }
        html.dark .edit-bg-red-soft { background-color: rgba(239, 68, 68, 0.1) !important; border-color: rgba(239, 68, 68, 0.2) !important; }
        html.dark .edit-tag-red { background-color: rgba(239, 68, 68, 0.2) !important; color: #FCA5A5 !important; border-color: rgba(239, 68, 68, 0.3) !important; }
        
        /* File Input Buttons */
        html.dark .edit-file-input::file-selector-button { background-color: #334155 !important; color: #F1F5F9 !important; border: none !important; }
        html.dark .edit-file-input:hover::file-selector-button { background-color: #475569 !important; }

        /* ReactQuill Overrides */
        html.dark .quill-wrapper { border-color: #334155 !important; }
        html.dark .quill-wrapper .ql-toolbar { background-color: #1E293B !important; border-color: #334155 !important; }
        html.dark .quill-wrapper .ql-container { background-color: #0F172A !important; border-color: #334155 !important; color: #F1F5F9 !important; font-family: inherit; }
        html.dark .quill-wrapper .ql-stroke { stroke: #94A3B8 !important; }
        html.dark .quill-wrapper .ql-fill { fill: #94A3B8 !important; }
        html.dark .quill-wrapper .ql-picker { color: #94A3B8 !important; }
        html.dark .quill-wrapper .ql-picker-options { background-color: #1E293B !important; border-color: #334155 !important; }
      `}</style>

      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12 transition-colors edit-bg-card">
        <div className="mb-8">
        <div className='inline-flex items-center mb-6 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all px-4 py-2.5 rounded-full cursor-pointer shadow-sm edit-bg-muted edit-border-subtle group'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"12px"} style={{marginRight:"8px"}} className="fill-current text-gray-600 edit-text-primary transition-colors">
              <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
            </svg>
            <Link href="/dashboard" style={{fontFamily: 'var(--font-poppins)', fontWeight:"500", textDecoration:"none"}} className="text-sm font-bold text-gray-600 edit-text-primary transition-colors">
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-axius-secondary edit-text-primary uppercase tracking-tight" style={{fontFamily: 'var(--font-poppins)'}}>Edit Expedition</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium edit-text-secondary">Modifying: <span className="italic">{tour.title}</span></p>
        </div>

        {/* STEPPER PROGRESS BAR (BULLETPROOF THEME SYNC) */}
        <div className="flex items-center w-full mb-24 px-2 sm:px-6">
          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Policy" },
            { num: 3, label: "Itinerary" },
            { num: 4, label: "Add-ons" }
          ].map((step, index) => {
            const isActive = activeTab === step.num;
            const isCompleted = activeTab > step.num;

            return (
              <div key={step.num} className="contents">
                <div className="relative flex flex-col items-center shrink-0 z-10">
                  <div className="bg-white p-1.5 rounded-full z-10 transition-colors edit-bg-card">
                    <button 
                      type="button"
                      onClick={() => setActiveTab(step.num)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 outline-none cursor-pointer ${
                        isCompleted 
                          ? "bg-[#2563EB] text-white hover:bg-blue-700 border-none" 
                          : isActive
                            ? "bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20 shadow-md border-none"
                            : "bg-gray-50 text-gray-400 border-2 border-gray-200 edit-bg-main edit-border-subtle"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      ) : (
                        step.num
                      )}
                    </button>
                  </div>
                  
                  <div className="absolute top-16 w-32 text-center pointer-events-none">
                    <span className={`text-[11px] uppercase tracking-widest transition-colors duration-300 ${
                      isActive ? "text-[#2563EB] font-black" : 
                      isCompleted ? "text-gray-800 edit-text-primary font-bold" : 
                      "text-gray-400 edit-text-secondary font-bold"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                </div>

                {index < 3 && (
                  <div className={`flex-auto h-[2px] -mx-4 z-0 transition-colors duration-500 ${
                    activeTab > step.num ? "bg-[#2563EB]" : "bg-gray-200 edit-bg-muted"
                  }`}></div>
                )}
              </div>
            );
          })}
        </div>

        <form action={updateTourWithId} className="space-y-8">
          
          {/* ================= STEP 1: BASIC INFO ================= */}
          <div className={`${activeTab === 1 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl transition-colors edit-bg-muted edit-border-subtle">
              <h2 className="md:col-span-2 text-lg font-black text-axius-secondary border-b border-gray-200 pb-2 uppercase tracking-wider edit-text-primary edit-border-subtle" style={{fontFamily: 'var(--font-poppins)'}}>
                1. Basic Information
              </h2>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-axius-secondary uppercase mb-2 edit-text-secondary">Tour Title</label>
                <input type="text" name="title" defaultValue={tour.title} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white transition-colors edit-input" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2 edit-text-secondary">Cover Image</label>
                <input type="hidden" name="coverImage" value={coverImageUrl || ""} required />
                <div className="flex items-center gap-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white transition-colors edit-bg-card edit-border-subtle">
                  {coverImageUrl ? (
                    <div className="relative w-40 h-24 rounded-lg overflow-hidden shadow-sm border border-gray-200 edit-border-subtle">
                      <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setCoverImageUrl("")} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-black flex items-center justify-center hover:bg-red-600 transition-colors shadow-md cursor-pointer">✕</button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer file:transition-all disabled:opacity-50 cursor-pointer edit-file-input edit-text-secondary" />
                    </div>
                  )}
                  {isUploading && <span className="text-xs font-bold text-[#2563EB] animate-pulse whitespace-nowrap">Uploading...</span>}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2 edit-text-secondary">Gallery Images (Slider)</label>
                <input type="hidden" name="gallery" value={JSON.stringify(galleryUrls)} />
                
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white transition-colors edit-bg-card edit-border-subtle">
                  <input 
                    type="file" 
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    disabled={isGalleryUploading}
                    className="mb-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer disabled:opacity-50 cursor-pointer edit-file-input edit-text-secondary"
                  />
                  {isGalleryUploading && <p className="text-xs font-bold text-[#2563EB] mb-4 animate-pulse">Uploading multiple images...</p>}
                  
                  {galleryUrls.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-2">
                      {galleryUrls.map((url, index) => (
                        <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm edit-border-subtle">
                          <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center hover:bg-red-600 shadow-md cursor-pointer">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-axius-secondary uppercase mb-2 edit-text-secondary">Destination</label>
                <input type="text" name="destination" defaultValue={tour.destination} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white transition-colors edit-input" />
              </div>

              <div>
                <label className="block text-xs font-black text-axius-secondary uppercase mb-2 edit-text-secondary">Base Price (Rs.)</label>
                <input type="number" name="basePrice" defaultValue={tour.basePrice} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white transition-colors edit-input" />
              </div>

              <div>
                <label className="block text-xs font-black text-axius-secondary uppercase mb-2 edit-text-secondary">Duration</label>
                <input type="text" name="duration" defaultValue={tour.duration} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white transition-colors edit-input" />
              </div>

              <div>
                <label className="block text-xs font-black text-axius-secondary uppercase mb-2 edit-text-secondary">Transport</label>
                <select name="transportType" defaultValue={tour.transportType || 'Car'} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white font-bold transition-colors edit-input">
                  <option value="Car">Car</option>
                  <option value="Bus">Bus</option>
                  <option value="Plane">Plane</option>
                </select>
              </div>

              {/* --- DEPARTURE SCHEDULE SECTION --- */}
              <div className="space-y-4 pt-0 md:col-span-2">
                <label className="block text-xs font-black text-axius-secondary uppercase mb-2 edit-text-secondary">Departure Schedule</label>
                
                <select 
                  name="departureType" 
                  value={departureType}
                  onChange={(e) => setDepartureType(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white font-bold transition-colors edit-input"
                >
                  <option value="CLIENT_CHOICE">Client Choice</option>
                  <option value="CUSTOM_DATE">Custom Fixed Date</option>
                </select>

                {/* --- CUSTOM FIXED DATE LOGIC --- */}
                {departureType === 'CUSTOM_DATE' && (
                  <>
                    <div className="flex flex-col gap-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100 transition-colors edit-bg-blue-soft">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <input 
                          type="date" 
                          name="departureDate" 
                          defaultValue={formattedDate}
                          required
                          className="p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#003580] font-medium text-gray-700 w-full sm:w-auto transition-colors edit-input"
                        />
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="departureEveryYear" 
                            value="true"
                            defaultChecked={tour.departureEveryYear}
                            className="w-5 h-5 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]" 
                          />
                          <span className="text-sm font-bold text-gray-700 edit-text-primary transition-colors">Repeats Every Year</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl mt-2 transition-colors edit-bg-orange-soft">
                      <label className="block text-sm font-black text-orange-800 uppercase tracking-widest mb-2 edit-text-primary">
                        Max Capacity Limit
                      </label>
                      <input 
                        type="number" 
                        name="maxCapacity" 
                        min="1" 
                        defaultValue={tour.maxCapacity || ''}
                        className="w-full border border-orange-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-orange-500 bg-white transition-colors edit-input" 
                        placeholder="e.g., 20 (Leave blank for unlimited)" 
                      />
                      <p className="text-xs text-orange-600 font-medium mt-2 edit-text-secondary">
                        When this limit is reached, the booking button will automatically switch to "Join Waitlist".
                      </p>
                    </div>
                  </>
                )}

                {/* --- CLIENT CHOICE LOGIC (BLOCK OUT DATES) --- */}
                {departureType === 'CLIENT_CHOICE' && (
                  <div className="mt-4 p-5 bg-red-50 border border-red-100 rounded-xl transition-colors edit-bg-red-soft">
                    <label className="block text-sm font-black text-red-800 uppercase tracking-widest mb-2 edit-text-primary">
                      Block Out Dates (Unavailable)
                    </label>
                    <p className="text-xs text-red-600 font-medium mb-4 edit-text-secondary">
                      Select dates when this tour is unavailable (e.g., guide is booked, fully sold out).
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <input 
                        type="date" 
                        value={blockDateInput}
                        onChange={(e) => setBlockDateInput(e.target.value)}
                        className="p-3 bg-white border border-red-200 rounded-lg outline-none focus:border-red-500 font-medium text-gray-700 flex-1 transition-colors edit-input"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddBlockedDate}
                        disabled={!blockDateInput}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                      >
                        Block Date
                      </button>
                    </div>

                    {blockedDates.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-red-100 transition-colors edit-bg-card edit-border-subtle">
                        {blockedDates.map((date) => (
                          <span key={date} className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 text-xs font-bold rounded-md transition-colors edit-tag-red">
                            {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            <button 
                              type="button" 
                              onClick={() => removeBlockedDate(date)}
                              className="hover:text-red-500 font-black text-sm cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <input type="hidden" name="blockedDates" value={JSON.stringify(blockedDates)} />
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-axius-secondary uppercase mb-2 edit-text-secondary">Accommodation</label>
                <input type="text" name="accommodation" defaultValue={tour.accommodation} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white transition-colors edit-input" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-axius-secondary uppercase mb-2 edit-text-secondary">Booking Mode</label>
                <select name="bookingMode" defaultValue={tour.bookingMode || 'BOTH'} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white font-bold transition-colors edit-input">
                  <option value="BOTH">📄 Form & WhatsApp</option>
                  <option value="WHATSAPP">📱 WhatsApp Only</option>
                  <option value="FORM">📋 Form Only</option>
                </select>
              </div>

              <div className="md:col-span-2 mt-4">
                <label className="block text-xs font-black text-axius-secondary uppercase mb-2 edit-text-secondary">Visibility Status</label>
                <select name="status" defaultValue={tour?.status || 'ACTIVE'} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white font-bold text-green-700 transition-colors edit-input">
                  <option value="ACTIVE">✅ Active (Public)</option>
                  <option value="DRAFT">📁 Draft (Hidden)</option>
                </select>
              </div>
            </div>
          </div>

          {/* ================= STEP 2: DETAILS & POLICIES ================= */}
          <div className={`${activeTab === 2 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}`}>
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-6 transition-colors edit-bg-muted edit-border-subtle">
              <h2 className="text-lg font-black text-axius-secondary border-b border-gray-200 pb-2 uppercase tracking-wider edit-text-primary edit-border-subtle" style={{fontFamily: 'var(--font-poppins)'}}>
                2. Tour Details & Policy
              </h2>
              
              <div>
                <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2 edit-text-secondary">Overview / Description</label>
                <input type="hidden" name="overview" value={overview} />
                <div className="bg-white rounded-xl overflow-hidden border border-gray-300 transition-colors quill-wrapper">
                  <ReactQuill theme="snow" value={overview} onChange={setOverview} className="h-48 mb-12" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                <div>
                  <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2 edit-text-secondary">Inclusions (One per line)</label>
                  <textarea name="inclusions" defaultValue={tour.inclusions ? tour.inclusions.join('\n') : ''} rows={5} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-axius-secondary focus:ring-2 focus:ring-axius-primary outline-none bg-white transition-colors edit-input"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2 edit-text-secondary">Exclusions (One per line)</label>
                  <textarea name="exclusions" defaultValue={tour.exclusions ? tour.exclusions.join('\n') : ''} rows={5} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-axius-secondary focus:ring-2 focus:ring-axius-primary outline-none bg-white transition-colors edit-input"></textarea>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2 edit-text-secondary">Tour Policy / Terms</label>
                <input type="hidden" name="policy" value={policy} />
                <div className="bg-white rounded-xl overflow-hidden border border-gray-300 transition-colors quill-wrapper">
                  <ReactQuill theme="snow" value={policy} onChange={setPolicy} className="h-48 mb-12" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= STEP 3: ITINERARY ================= */}
          <div className={`${activeTab === 3 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}`}>
            <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm transition-colors edit-bg-card edit-border-subtle">
              <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4 edit-border-subtle">
                <h2 className="text-lg font-black text-axius-secondary uppercase edit-text-primary" style={{fontFamily: 'var(--font-poppins)'}}>3. Edit Itinerary</h2>
                <button type="button" onClick={handleAddDay} className="text-white px-6 py-2 rounded-xl text-xs font-black uppercase bg-[#2563EB] hover:bg-[#1D4ED8] transition-all inline-flex items-center cursor-pointer shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width={"16px"} style={{marginRight:"8px"}} className="fill-current"><path d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"/></svg> Add Day
                </button>
              </div>

              <div className="space-y-6">
                {days.map((day: any, index: number) => (
                  <div key={index} className="relative flex gap-6 p-6 border border-gray-100 rounded-2xl bg-[#FBFDFF] group transition-colors edit-day-card">
                    <button type="button" onClick={() => handleRemoveDay(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Remove Day">
                      <span className="text-xl">×</span>
                    </button>

                    <div className="w-14 h-14 flex-shrink-0 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl transition-colors">
                      {day.dayNumber}
                    </div>
                    <div className="w-full space-y-4">
                      <input type="text" placeholder="Day Heading" value={day.title} onChange={(e) => handleDayChange(index, 'title', e.target.value)} required className="w-full border border-gray-200 text-axius-secondary font-bold rounded-xl px-4 py-2 outline-none bg-white transition-colors edit-day-input" />
                      <textarea placeholder="Activities" value={day.details} onChange={(e) => handleDayChange(index, 'details', e.target.value)} required rows={3} className="w-full border border-gray-200 text-gray-600 rounded-xl px-4 py-2 outline-none bg-white transition-colors edit-day-input" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= STEP 4: ADD ONS & SUBMIT ================= */}
          <div className={`${activeTab === 4 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}`}>
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl transition-colors edit-bg-blue-soft mb-8">
              <h2 className="text-lg font-black text-blue-900 uppercase tracking-wider mb-4 edit-text-primary">4. Optional Add-ons (Upsell)</h2>
              <div className="flex gap-3 mb-4 ">
                <input 
                  type="text" 
                  placeholder="Item (e.g. DSLR Camera)" 
                  value={newAddOn.name}
                  onChange={e => setNewAddOn({...newAddOn, name: e.target.value})}
                  className="flex-1 w-32 p-3 border rounded-xl outline-none transition-colors edit-input" 
                />
                <input 
                  type="number" 
                  placeholder="Price" 
                  value={newAddOn.price}
                  onChange={e => setNewAddOn({...newAddOn, price: e.target.value})}
                  className="w-32 p-3 border rounded-xl outline-none transition-colors edit-input" 
                />
                <button type="button" onClick={handleAddExtra} className="bg-blue-600 hover:bg-blue-700 text-white w-12 px-4 rounded-xl font-bold transition-colors cursor-pointer text-2xl flex items-center justify-center">+</button>
              </div>

              <div className="flex flex-wrap gap-2">
                {addOns.map((item, i) => (
                  <div key={i} className="bg-white px-3 py-2 rounded-lg border border-blue-200 text-sm font-bold flex gap-2 transition-colors edit-bg-card edit-border-subtle text-gray-800 edit-text-primary">
                    {item.name} (+Rs. {item.price})
                    <button type="button" onClick={() => setAddOns(addOns.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-600 cursor-pointer">×</button>
                  </div>
                ))}
              </div>
              <input type="hidden" name="addOns" value={JSON.stringify(addOns)} />
            </div>

            <input type="hidden" name="itinerary" value={JSON.stringify(days)} />

            {/* Premium Success Banner */}
            <div className="p-8 rounded-3xl text-center mb-8 border border-blue-100 bg-blue-50 transition-colors edit-bg-blue-soft">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4 transition-colors edit-bg-card edit-border-subtle border border-gray-100">
                <svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </div>
              
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2 edit-text-primary uppercase tracking-tight">
                Ready to Save Changes!
              </h3>
              
              <p className="text-gray-500 text-sm font-medium max-w-md mx-auto edit-text-secondary">
                Please review your edits from the previous steps. Once you hit save, the tour will be updated immediately.
              </p>
            </div>

            <button style={{cursor:"pointer"}}
              type="submit" 
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black py-5 rounded-2xl text-lg uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02]"
            >
              Save Changes
            </button>
          </div>

          {/* ================= NAVIGATION FOOTER ================= */}
          <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-100 edit-border-subtle">
            {activeTab > 1 ? (
              <button 
                type="button" 
                onClick={() => setActiveTab(prev => prev - 1)} 
                className="px-6 py-3 rounded-xl font-black text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-widest text-xs cursor-pointer dark:hover:bg-gray-800 dark:text-gray-400"
              >
                ← Previous Step
              </button>
            ) : <div></div>}

            {activeTab < totalTabs && (
              <button 
                type="button" 
                onClick={() => setActiveTab(prev => prev + 1)} 
                className="px-8 py-3 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-colors shadow-md cursor-pointer"
              >
                Next Step →
              </button>
            )}
          </div>

        </form>
      </div>
    </>
  );
}