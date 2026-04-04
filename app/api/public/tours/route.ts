import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // 1. Get Agency ID from URL (No API Key needed for public viewing)
        const { searchParams } = new URL(request.url);
        const agencyId = searchParams.get('agencyId');
        
        if (!agencyId) {
            return NextResponse.json({ success: false, error: "Agency ID is required" }, { status: 400 });
        }

        // 2. Extract search and sort filters
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || 'newest';

        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
        if (sort === 'price_desc') orderBy = { basePrice: 'desc' };

        // 3. Fetch the agency and its ACTIVE tours
        const agency = await prisma.tenant.findUnique({
            where: { 
                id: agencyId,
                isActive: true // Security: Don't show tours if agency is suspended
            },
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

        if (!agency) {
            return NextResponse.json({ success: false, error: "Agency not found or inactive" }, { status: 404 });
        }

        // 4. Handle the custom duration sorting
        if (agency.tours) {
            if (sort === 'duration_asc') {
                agency.tours.sort((a: any, b: any) => parseInt(a.duration) - parseInt(b.duration));
            } else if (sort === 'duration_desc') {
                agency.tours.sort((a: any, b: any) => parseInt(b.duration) - parseInt(a.duration));
            }
        }

        // 5. Send the data back!
        return NextResponse.json({ success: true, agency });

    } catch (error) {
        console.error("Public API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}