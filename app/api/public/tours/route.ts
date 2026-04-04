import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Using our Turbopack-safe import!

export async function GET(request: Request) {
    try {
        // 1. Check for the API Key sent by the frontend
        const apiKey = request.headers.get('x-api-key');
        
        if (!apiKey) {
            return NextResponse.json({ success: false, error: "Unauthorized: Missing API Key" }, { status: 401 });
        }

        // 2. Find which agency owns this API Key
        const keyRecord = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { tenant: true }
        });

        // 3. Security check: Does the key exist? Is the agency active?
        if (!keyRecord || !keyRecord.tenant || !keyRecord.tenant.isActive) {
            return NextResponse.json({ success: false, error: "Unauthorized or Agency Suspended" }, { status: 401 });
        }

        const tenantId = keyRecord.tenantId;

        // 4. Extract search and sort filters from the URL
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || 'newest';

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
        if (sort === 'price_desc') orderBy = { basePrice: 'desc' };

        // 5. Fetch the agency and its ACTIVE tours
        const agency = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                tours: {
                    where: { 
                        status: 'ACTIVE',
                        ...(search ? {
                            OR: [
                                { title: { contains: search, mode: 'insensitive' } },
                                { destination: { contains: search, mode: 'insensitive' } }
                            ]
                        } : {})
                    },
                    orderBy: orderBy
                }
            }
        });

        // 6. Handle the custom duration sorting
        if (agency && agency.tours) {
            if (sort === 'duration_asc') {
                agency.tours.sort((a: any, b: any) => parseInt(a.duration) - parseInt(b.duration));
            } else if (sort === 'duration_desc') {
                agency.tours.sort((a: any, b: any) => parseInt(b.duration) - parseInt(a.duration));
            }
        }

        // 7. Send the data back to the frontend!
        return NextResponse.json({ success: true, agency });

    } catch (error) {
        console.error("Public API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}