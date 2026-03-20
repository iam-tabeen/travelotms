import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Montez } from "next/font/google";
import "./globals.css";
import "./tailwind.config";
import ScrollToTop from '@/components/ScrollToTop';
import WhatsAppButton from '@/components/WhatsAppButton';
import ToastProvider from '@/components/ToastProvider'; 
import { ThemeProvider } from '@/components/ThemeProvider'; // <-- 1. Import ThemeProvider
import prisma from '@/lib/prisma';
import React from "react";

// --- FONT CONFIGURATIONS ---
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const poppins = Poppins({ weight: ["400", "500", "600", "700", "800", "900"], variable: "--font-poppins", subsets: ["latin"] });
const montez = Montez({ weight: ["400"], variable: "--font-montez", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travelo TMS",
  description: "Tour management system",
};

// --- ROOT LAYOUT ---
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  // Fetch the tenant data once for the whole app
  let tenant = null;
  try {
    tenant = await prisma.tenant.findFirst();
  } catch (error) {
    console.warn("⚠️ Prisma couldn't fetch the tenant. Using default theme.");
  }
  
  // Create the global theme variables
  const globalTheme = {
    '--theme-primary': tenant?.primaryColor || '#003580',
    '--theme-accent': tenant?.accentColor || '#FF8C00',
    '--theme-navbar': tenant?.navbarColor || '#003580',
    '--theme-button': tenant?.buttonColor || '#FF8C00',
    '--theme-heading': tenant?.headingColor || '#1F2937',
    '--theme-footer': tenant?.footerColor || '#111827',
    '--theme-card': tenant?.cardColor || '#111827',
    '--navlink': tenant?.navlink || '#111827',
  } as React.CSSProperties;

  return (
    <ClerkProvider>
      {/* 2. suppressHydrationWarning MUST be on the html tag for next-themes */}
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${montez.variable} antialiased bg-[#F4F7F9] dark:bg-[#0F172A] text-gray-900 dark:text-slate-100 transition-colors duration-300`}
          style={globalTheme}
        >
          {/* 3. Wrap the app contents in ThemeProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider />
            
            {children}
            
            <ScrollToTop />
            <WhatsAppButton />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}