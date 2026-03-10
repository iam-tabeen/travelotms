"use client";

import { useState } from 'react';
import { submitBooking } from '@/app/actions/booking';

export default function BookingForm({ 
  tourId, 
  tenantId, 
  basePrice 
}: { 
  tourId: string; 
  tenantId: string; 
  basePrice: number; 
}) {
  const [travelers, setTravelers] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Bind the extra arguments to the server action
  const formAction = submitBooking.bind(null, tourId, tenantId, basePrice);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await formAction(formData);
      setIsSuccess(true);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 p-8 rounded-2xl text-center shadow-sm">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-black text-green-800 uppercase tracking-widest mb-2">Request Received!</h3>
        <p className="text-green-700 font-medium text-sm">
          Thank you! We have received your booking request. Our team will contact you shortly via phone or email to confirm details.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100" style={{border:"3px solid var(--theme-heading)"}}>
      <h3 className="text-xl font-black text-axius-secondary uppercase tracking-widest mb-6 border-b border-gray-100 pb-4">
        Request to Book
      </h3>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold"}}>Full Name</label>
          <input type="text" name="customerName" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-axius-primary bg-gray-50 focus:bg-white transition-all" placeholder="Ali Khan" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold"}}>Email</label>
            <input type="email" name="customerEmail" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-axius-primary bg-gray-50 focus:bg-white transition-all" placeholder="ali@example.com" />
          </div>
          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold"}}>Phone</label>
            <input type="tel" name="customerPhone" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-axius-primary bg-gray-50 focus:bg-white transition-all" placeholder="0300 1234567" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold"}}>Travel Date</label>
            <input type="date" name="travelDate" required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-axius-primary bg-gray-50 focus:bg-white transition-all text-gray-700" />
          </div>
          <div>
            <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold"}}>Travelers</label>
            <input 
              type="number" 
              name="numTravelers" 
              min="1" 
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
              required 
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-axius-primary bg-gray-50 focus:bg-white transition-all" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-axius-secondary uppercase tracking-widest mb-2" style={{fontFamily: 'var(--font-poppins)', fontWeight:"bold"}}>Special Requests (Optional)</label>
          <textarea name="specialNotes" rows={2} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-axius-primary bg-gray-50 focus:bg-white transition-all" placeholder="e.g., Vegetarian meals, window seats..."></textarea>
        </div>

        {/* Dynamic Price Calculation */}
        <div className="bg-axius-bg p-4 rounded-xl flex justify-between items-center border border-gray-200">
          <span className="text-sm font-bold text-gray-500">Total Price:</span>
          <span className="text-xl font-black text-axius-primary">
            Rs. {(basePrice * travelers).toLocaleString()}
          </span>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-black text-white cursor-pointer font-black py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-axius-primary transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        
        >
          {isSubmitting ? "Sending Request..." : "Submit Booking"}
        </button>
      </form>
    </div>
  );
}