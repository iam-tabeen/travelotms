import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    // Changed h-screen to h-full min-h-[80vh] and made background transparent
    <div className="h-full min-h-[80vh] w-full flex flex-col items-center justify-center bg-transparent">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  );
}