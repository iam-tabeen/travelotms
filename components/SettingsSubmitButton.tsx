"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export default function SettingsSubmitButton() {
  // Yeh hook automatically form ka status detect kar lega
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full flex items-center justify-center gap-3 bg-[#003580] dark:bg-blue-600 text-white font-black py-5 md:py-6 rounded-2xl text-md transition-all shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] cursor-pointer"
    >
      {pending && <Loader2 className="w-5 h-5 animate-spin text-white" />}
      {pending ? "Saving Settings..." : "Save Brand Settings"}
    </button>
  );
}