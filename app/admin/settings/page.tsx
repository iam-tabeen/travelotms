import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { updateAgencySettings } from './actions';
import Link from 'next/link';

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Fetch the existing record (will be null for brand new users!)
  const tenant = await prisma.tenant.findUnique({
    where: { userId: userId },
  });

  // THE FIX: We completely deleted the 'if (!tenant)' blocker!
  // The form below will now safely load whether an agency exists or not.

  return (
    <main className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-12 shadow-2xl border border-gray-100">
        <div className="mb-12 flex justify-between items-center">
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Branding</h1>
          <Link href="/admin" className="text-xs font-black text-gray-400 hover:text-gray-900 tracking-widest uppercase">
            ⬅ Dashboard
          </Link>
        </div>

        <form action={updateAgencySettings} className="space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Agency Name</label>
            <input 
              name="companyName" 
              // THE FIX: Added '?' so it doesn't crash if tenant is null
              defaultValue={tenant?.companyName || ""} 
              className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#003580] transition-all font-bold text-gray-900 text-lg shadow-inner"
              required
            />
          </div>
          
          <div className="space-y-3 pt-6">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              Agency Logo
            </label>
            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
              
              {/* Preview the current logo only if it actually exists */}
              {tenant?.logoUrl && (
                <div className="h-16 w-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                  <img src={tenant.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                </div>
              )}
              
              <div className="flex-1">
                <input 
                  type="file" 
                  name="logoFile" 
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#003580] file:text-white hover:file:opacity-90 transition-all cursor-pointer"
                />
                
                <input type="hidden" name="existingLogoUrl" value={tenant?.logoUrl || ""} />
                
                <p className="text-xs text-gray-400 mt-2 font-medium">Recommended: Transparent PNG, 500x500px</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
            {/* Navbar Color */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input type="color" name="navbarColor" defaultValue={tenant?.navbarColor || "#003580"} className="w-12 h-12 rounded cursor-pointer" />
              <div>
                <p className="font-bold text-sm">Navbar Color</p>
                <p className="text-xs text-gray-500">Top navigation bar</p>
              </div>
            </div>

            {/* Button Color */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input type="color" name="buttonColor" defaultValue={tenant?.buttonColor || "#FF8C00"} className="w-12 h-12 rounded cursor-pointer" />
              <div>
                <p className="font-bold text-sm">Button Color</p>
                <p className="text-xs text-gray-500">Primary action buttons</p>
              </div>
            </div>

            {/* Primary Color */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input type="color" name="primaryColor" defaultValue={tenant?.primaryColor || "#003580"} className="w-12 h-12 rounded cursor-pointer" />
              <div>
                <p className="font-bold text-sm">Primary Brand</p>
                <p className="text-xs text-gray-500">Icons and overlays</p>
              </div>
            </div>

            {/* Accent Color */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input type="color" name="accentColor" defaultValue={tenant?.accentColor || "#FF8C00"} className="w-12 h-12 rounded cursor-pointer" />
              <div>
                <p className="font-bold text-sm">Accent Color</p>
                <p className="text-xs text-gray-500">Badges and highlights</p>
              </div>
            </div>

            {/* Heading Color */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input type="color" name="headingColor" defaultValue={tenant?.headingColor || "#1F2937"} className="w-12 h-12 rounded cursor-pointer" />
              <div>
                <p className="font-bold text-sm">Heading Text</p>
                <p className="text-xs text-gray-500">Main titles (H1, H2)</p>
              </div>
            </div>

            {/* Footer Color */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input type="color" name="footerColor" defaultValue={tenant?.footerColor || "#111827"} className="w-12 h-12 rounded cursor-pointer" />
              <div>
                <p className="font-bold text-sm">Footer Color</p>
                <p className="text-xs text-gray-500">Background for the bottom footer</p>
              </div>
            </div>

            {/* Nav Links Color */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input type="color" name="navlink" defaultValue={tenant?.navlink || "#111827"} className="w-12 h-12 rounded cursor-pointer" />
              <div>
                <p className="font-bold text-sm">Nav Links Color</p>
                <p className="text-xs text-gray-500">Color for the Nav Links</p>
              </div>
            </div>

            {/* Card Color */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input type="color" name="cardColor" defaultValue={tenant?.cardColor || "#111827"} className="w-12 h-12 rounded cursor-pointer" />
              <div>
                <p className="font-bold text-sm">Card Color</p>
                <p className="text-xs text-gray-500">Background for the card Elements</p>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#003580] text-white font-black py-6 rounded-2xl uppercase tracking-[0.3em] text-sm hover:scale-[1.02] transition-all shadow-2xl "
          >
            Save Brand Settings
          </button>
        </form>
      </div>
    </main>
  );
}