"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ChangePasswordForm() {
  const { user, isLoaded } = useUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("New passwords do not match!");
      return;
    }

    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    try {
      setStatus("loading");
      // Clerk's native secure password update function
      await user?.updatePassword({
        currentPassword,
        newPassword
      });
      
      setStatus("success");
      setMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Reset success message after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
      
    } catch (err: any) {
      setStatus("error");
      // Extract Clerk's error message
      setMessage(err.errors?.[0]?.message || "Incorrect current password or update failed.");
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="pt-0 set-border-subtle mt-0">
      
      {/* 🛡️ GUARANTEED THEME SYNC FOR ALERTS & BUTTONS 🛡️ */}
      <style>{`
        /* Default Light Theme is handled by regular Tailwind classes (bg-red-50, etc.) */
        
        /* Strictly Dark Theme overrides */
        html.dark .set-alert-error {
          background-color: rgba(127, 29, 29, 0.3) !important; /* Deep red tint */
          border-color: rgba(153, 27, 27, 0.5) !important;
          color: #F87171 !important;
        }
        
        html.dark .set-alert-success {
          background-color: rgba(6, 78, 59, 0.3) !important; /* Deep green tint */
          border-color: rgba(6, 95, 70, 0.5) !important;
          color: #34D399 !important;
        }
        
        html.dark .set-btn-primary {
          background-color: #FFFFFF !important;
          color: #111827 !important;
        }
      `}</style>

      <div className="mb-6">
        <h2 className="text-lg font-black text-gray-900 set-text-primary flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" />
          Security Settings
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-medium set-text-secondary">
          Update your admin account password. You will be kept logged in after this change.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest set-text-secondary block mb-2">
            Current Password
          </label>
          <input 
            type="password" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none transition-all font-bold text-gray-900 shadow-inner set-input"
            required
            placeholder="Enter current password"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* New Password */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest set-text-secondary block mb-2">
              New Password
            </label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none transition-all font-bold text-gray-900 shadow-inner set-input"
              required
              placeholder="Min. 8 characters"
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest set-text-secondary block mb-2">
              Confirm New Password
            </label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none transition-all font-bold text-gray-900 shadow-inner set-input"
              required
              placeholder="Retype new password"
            />
          </div>
        </div>

        {/* Status Messages - 100% Theme Safe Now */}
        {status === "error" && (
          <div className="w-full p-4 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl text-sm font-black flex items-center gap-3 transition-colors set-alert-error">
            <AlertCircle className="w-5 h-5 shrink-0" /> {message}
          </div>
        )}
        
        {status === "success" && (
          <div className="w-full p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl text-sm font-black flex items-center gap-3 transition-colors set-alert-success">
            <CheckCircle2 className="w-5 h-5 shrink-0" /> {message}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={status === "loading" || !currentPassword || !newPassword || !confirmPassword}
          className="w-full bg-blue-500 text-white font-black py-4 rounded-xl text-sm hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2 set-btn-primary"
        >
          {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === "loading" ? "Updating Security..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}