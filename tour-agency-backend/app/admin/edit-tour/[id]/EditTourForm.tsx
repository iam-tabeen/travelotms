"use client";

import { useState } from 'react';
import Link from 'next/link';
import { updateTour } from '../../add-tour/actions';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function EditTourForm({ tour }: { tour: any }) {
  const [days, setDays] = useState(tour.itineraryDays || []);
  
  // 1. Cover Image State (pre-loaded with existing image)
  const [coverImageUrl, setCoverImageUrl] = useState(tour.coverImage || "");
  const [isUploading, setIsUploading] = useState(false);

  // --- NEW: Gallery Images State (pre-loaded with existing gallery) ---
  const [galleryUrls, setGalleryUrls] = useState<string[]>(tour.gallery || []);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);

  // --- NEW: Rich Text State (pre-loaded with existing text) ---
  const [overview, setOverview] = useState(tour.overview || "");
  const [policy, setPolicy] = useState(tour.policy || "");

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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="mb-10">
      <div  className='inline-flex items-center mb-4 row bg-[#000000] hover:bg-[#363636] transition-all' style={{ paddingLeft:"16px" , paddingRight:"16px", paddingTop:"10px", paddingBottom:"10px", borderRadius:"20px", width:"200px"}}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={"12px"} style={{marginRight:"10px"}} ><path fill="white" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
        <Link href="/admin" style={{fontFamily: 'var(--font-poppins)', fontWeight:"500" , fontSize:"14px", textDecoration:"none"}} className="text-sm font-bold text-white hover:underline  inline-block" >
         Back to Dashboard
            </Link>
            </div>
        <h1 className="text-3xl font-black text-axius-secondary" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"28px"}}>Edit Expedition</h1>
        <p className="text-gray-500 mt-2 text-sm italic">Modifying: {tour.title}</p>
      </div>

      <form action={updateTourWithId} className="space-y-8">
        
        {/* SECTION 1: BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-axius-secondary uppercase mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Tour Title</label>
            <input type="text" name="title" defaultValue={tour.title} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Cover Image</label>
            <input type="hidden" name="coverImage" value={coverImageUrl || ""} required />
            <div className="flex items-center gap-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              {coverImageUrl ? (
                <div className="relative w-40 h-24 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setCoverImageUrl("")} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-black flex items-center justify-center hover:bg-red-600 transition-colors shadow-md">✕</button>
                </div>
              ) : (
                <div className="w-full">
                  <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer file:transition-all disabled:opacity-50" />
                </div>
              )}
              {isUploading && <span className="text-xs font-bold text-axius-primary animate-pulse whitespace-nowrap">Uploading...</span>}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Gallery Images (Slider)</label>
            <input type="hidden" name="gallery" value={JSON.stringify(galleryUrls)} />
            
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <input 
                type="file" 
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
                disabled={isGalleryUploading}
                className="mb-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-gray-900 file:text-white hover:file:bg-gray-800 file:cursor-pointer disabled:opacity-50"
              />
              {isGalleryUploading && <p className="text-xs font-bold text-axius-primary mb-4 animate-pulse">Uploading multiple images...</p>}
              
              {galleryUrls.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-2">
                  {galleryUrls.map((url, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center hover:bg-red-600 shadow-md">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Destination</label>
            <input type="text" name="destination" defaultValue={tour.destination} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white" />
          </div>

          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Base Price (Rs.)</label>
            <input type="number" name="basePrice" defaultValue={tour.basePrice} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white" />
          </div>

          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Duration</label>
            <input type="text" name="duration" defaultValue={tour.duration} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white" />
          </div>

          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Transport</label>
            <select name="transportType" defaultValue={tour.transportType || 'Car'} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white font-bold">
              <option value="Car">Car</option>
              <option value="Bus">Bus</option>
              <option value="Plane">Plane</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Accommodation</label>
            <input type="text" name="accommodation" defaultValue={tour.accommodation} required className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white" />
          </div>

          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Booking Mode</label>
            <select name="bookingMode" defaultValue={tour.bookingMode || 'BOTH'} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white font-bold">
              <option value="BOTH">📄 Form & WhatsApp</option>
              <option value="WHATSAPP">📱 WhatsApp Only</option>
              <option value="FORM">📋 Form Only</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-axius-secondary uppercase mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Visibility Status</label>
            <select name="status" defaultValue={tour?.status || 'ACTIVE'} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-axius-primary bg-white font-bold text-green-700">
              <option value="ACTIVE">✅ Active (Public)</option>
              <option value="DRAFT">📁 Draft (Hidden)</option>
            </select>
          </div>
        </div>

        {/* --- NEW SECTION 2: DETAILS & POLICIES --- */}
        <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-6 mt-8">
          <h2 className="text-lg font-black text-axius-secondary border-b border-gray-200 pb-2 uppercase tracking-wider" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"20px"}}>
            2. Tour Details & Policy
          </h2>
          
          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Overview / Description</label>
            <input type="hidden" name="overview" value={overview} />
            <div className="bg-white rounded-xl overflow-hidden border border-gray-300">
              <ReactQuill theme="snow" value={overview} onChange={setOverview} className="h-48 mb-12" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <div>
              <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Inclusions (One per line)</label>
              <textarea name="inclusions" defaultValue={tour.inclusions ? tour.inclusions.join('\n') : ''} rows={5} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-axius-secondary focus:ring-2 focus:ring-axius-primary outline-none bg-white"></textarea>
            </div>
            <div>
              <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Exclusions (One per line)</label>
              <textarea name="exclusions" defaultValue={tour.exclusions ? tour.exclusions.join('\n') : ''} rows={5} className="w-full border border-gray-300 rounded-xl px-4 py-3 text-axius-secondary focus:ring-2 focus:ring-axius-primary outline-none bg-white"></textarea>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px"}}>Tour Policy / Terms</label>
            <input type="hidden" name="policy" value={policy} />
            <div className="bg-white rounded-xl overflow-hidden border border-gray-300">
              <ReactQuill theme="snow" value={policy} onChange={setPolicy} className="h-48 mb-12" />
            </div>
          </div>
        </div>

        {/* SECTION 3: ITINERARY */}
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm mt-16">
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-lg font-black text-axius-secondary uppercase" style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"20px"}}>3. Edit Itinerary</h2>
            <button type="button" onClick={handleAddDay} style={{fontFamily: 'var(--font-poppins)', fontWeight:"700" , fontSize:"14px",  borderRadius:"50px",  cursor:"pointer"}} className=" text-white px-6 py-2 rounded-xl text-xs font-black uppercase bg-[#4389f7] hover:bg-[#2b73d9] transition-all inline-flex items-center row">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width={"16px"} style={{marginRight:"8px"}}><path fill="currentColor" d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"/></svg> Add Day
                </button>
          </div>

          <div className="space-y-6">
            {days.map((day: any, index: number) => (
              <div key={index} className="relative flex gap-6 p-6 border border-gray-100 rounded-2xl bg-[#FBFDFF] group">
                <button type="button" onClick={() => handleRemoveDay(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors" title="Remove Day">
                  <span className="text-xl">×</span>
                </button>

                <div className="w-14 h-14 flex-shrink-0 bg-axius-secondary text-black rounded-2xl flex items-center justify-center font-black text-xl">
                  {day.dayNumber}
                </div>
                <div className="w-full space-y-4">
                  <input type="text" placeholder="Day Heading" value={day.title} onChange={(e) => handleDayChange(index, 'title', e.target.value)} required className="w-full border border-gray-200 text-axius-secondary font-bold rounded-xl px-4 py-2 focus:ring-2 focus:ring-axius-primary" />
                  <textarea placeholder="Activities" value={day.details} onChange={(e) => handleDayChange(index, 'details', e.target.value)} required rows={3} className="w-full border border-gray-200 text-gray-600 rounded-xl px-4 py-2 focus:ring-2 focus:ring-axius-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <input type="hidden" name="itinerary" value={JSON.stringify(days)} />

        <button  style={{cursor:"pointer"}}
  type="submit" 
  className="w-full bg-[#4389f7] hover:bg-[#2b73d9] text-white font-black py-5 rounded-2xl text-lg uppercase tracking-widest transition-all shadow-xl"
>
  Save Changes
</button>
      </form>
    </div>
  );
}