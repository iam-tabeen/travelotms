import { ShieldAlert, Loader2 } from "lucide-react";

export default function SuperAdminLoading() {
  return (
    <div className="h-full min-h-[80vh] w-full flex flex-col items-center justify-center bg-transparent">
      <div className="relative flex items-center justify-center mb-4">
        <Loader2 className="h-12 w-12 animate-spin text-red-500/50 absolute" />
        <ShieldAlert className="h-6 w-6 text-red-500" />
      </div>
      <p className="text-xs font-black text-red-500/80 uppercase tracking-widest animate-pulse">
        Decrypting Vault...
      </p>
    </div>
  );
}