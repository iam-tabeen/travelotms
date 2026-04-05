import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <>
      <style>{`
        /* Default Light Theme */
        .loading-bg { background-color: #F9FAFB; } /* bg-gray-50 */
        .loading-text { color: #6B7280; } /* text-gray-500 */
        .loading-spinner { color: #2563EB; } /* text-blue-600 */

        /* Strictly Dark Theme (Only works when HTML has .dark class) */
        html.dark .loading-bg { background-color: #0F172A; }
        html.dark .loading-text { color: #9CA3AF; } /* text-gray-400 */
        html.dark .loading-spinner { color: #60A5FA; } /* text-blue-400 */
      `}</style>

      {/* Tailwind ki dark: classes hata kar custom classes laga di hain */}
      <div className="h-full min-h-[80vh] w-full flex flex-col items-center justify-center transition-colors duration-300 loading-bg">
        <Loader2 className="h-8 w-8 animate-spin mb-4 loading-spinner" />
        <p className="text-sm font-bold uppercase tracking-widest animate-pulse loading-text">
          Loading...
        </p>
      </div>
    </>
  );
}