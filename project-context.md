# Project Context: Travelo TMS

## 1. Project Overview
* **Name:** Travelo TMS
* **Creator:** Muhammad Tabeen Haider (Axius Digital)
* **Purpose:** A B2B and B2C SaaS platform designed specifically for domestic tour operators and travel agencies in Pakistan.
* **Core Features:** Sub-agent management (B2B portals), direct booking websites (B2C storefronts), financial ledgers, lead tracking, and automated reporting.

## 2. Tech Stack & Infrastructure
* **Frontend/Framework:** Next.js (App Router), React, Tailwind CSS, Lucide Icons.
* **Hosting:** Vercel (Pro Plan - $20/mo).
* **Database & Auth:** Supabase (Free Tier). Strictly used for text data (JSON, leads, tour details) to stay within the 500MB/5GB limits.
* **Image Storage:** DigitalOcean Spaces ($5/mo plan). 
* **Critical Rule for AI:** ALL images must be uploaded to and served from DigitalOcean Spaces using `@aws-sdk/client-s3`. NEVER suggest uploading files to Supabase storage. 

## 3. Business Model & Pricing
* **Target Audience:** Local Pakistani travel agencies looking for affordable, scalable software.
* **Basic Plan:** Rs. 5,000/month (Includes dashboard, tour management, WhatsApp/Form bookings, simple ledgers).
* **PRO Plan:** Rs. 8,000/month (Includes RBAC, sub-agent portals, promo codes, advanced financial ledgers with partial payments, and lead exports).
* **Profitability Metric:** Server costs are strictly capped at ~$25/month. Every feature developed must keep this lean infrastructure in mind.

## 4. Coding Standards & Quirks
* **Next.js Config:** `transpilePackages: ['lucide-react']` is required in `next.config` to prevent server compilation crashes.
* **Images:** Use the standard Next.js `<Image>` component for automatic optimization via Vercel's edge network.
* **UI Components:** heavily utilizing Framer Motion for animations and Radix UI for accessible components (Accordions, Tabs).

