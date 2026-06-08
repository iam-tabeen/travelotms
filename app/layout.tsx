import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Poppins, Montez } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import './tailwind.config';
import ScrollToTop from '@/components/ScrollToTop';
import ToastProvider from '@/components/ToastProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import WhatsAppButton from '@/components/WhatsAppButton';
import { getCachedTenant } from '@/lib/cache-helpers';
import { tenantThemeVars } from '@/lib/public-site';
import React from 'react';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  subsets: ['latin'],
});
const montez = Montez({ weight: ['400'], variable: '--font-montez', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Travelo TMS',
  description: 'Tour management system',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCachedTenant();
  const globalTheme = tenant ? tenantThemeVars(tenant) : {};
  const pixelId = tenant?.metaPixelId;
  const whatsappNum = tenant?.whatsappNumber;

  return (
    <ClerkProvider afterSignOutUrl="/dashboard">
      <html lang="en" suppressHydrationWarning>
        <head>
          {pixelId && (
            <Script
              id="meta-pixel"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`,
              }}
            />
          )}
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${montez.variable} antialiased bg-[#F4F7F9] dark:bg-[#0F172A] text-gray-900 dark:text-slate-100 transition-colors duration-300`}
          style={globalTheme}
        >
          {pixelId && (
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                alt="Meta Pixel"
              />
            </noscript>
          )}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ToastProvider />
            {children}
            <WhatsAppButton phone={whatsappNum} />
            <ScrollToTop />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
