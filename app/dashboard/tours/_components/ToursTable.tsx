import prisma from '@/lib/prisma';
import Link from 'next/link';
import DeleteTourButton from '@/components/DeleteTourButton';
import DuplicateTourButton from '@/components/DuplicateTourButton';
import BookingModeDropdown from '@/components/BookingModeDropdown';

export default async function ToursTable() {
  const tours = await prisma.tour.findMany({
    select: {
      id: true,
      title: true,
      destination: true,
      duration: true,
      status: true,
      bookedSpots: true,
      maxCapacity: true,
      departureType: true,
      bookingMode: true,
      basePrice: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="table-card bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="text-base font-extrabold text-gray-900">Tour Inventory</div>
        <div className="text-sm text-gray-500 mt-1">{tours.length} total packages</div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-8 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-500">Tour Details</th>
              <th className="px-8 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-500">Status</th>
              <th className="px-8 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-500">Capacity</th>
              <th className="px-8 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-500">Booking Option</th>
              <th className="px-8 py-4 text-left text-[11px] font-black uppercase tracking-widest text-gray-500">Price</th>
              <th className="px-8 py-4 text-right text-[11px] font-black uppercase tracking-widest text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => {
              const isClientChoice = tour.departureType === 'CLIENT_CHOICE';
              const booked = tour.bookedSpots || 0;
              const max = tour.maxCapacity || 0;
              const isInfinity = max === 0;
              const isFull = !isInfinity && booked >= max;
              const percent = isInfinity ? 0 : Math.min((booked / max) * 100, 100);
              const isWarning = !isInfinity && percent >= 80 && !isFull;

              return (
                <tr key={tour.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-8 py-5">
                    <div className="text-[15px] font-bold text-gray-900">{tour.title}</div>
                    <div className="text-[13px] text-gray-500 mt-1">{tour.destination} · {tour.duration}</div>
                  </td>
                  <td className="px-8 py-5">
                    {tour.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase bg-gray-100 text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    {isClientChoice ? (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-widest whitespace-nowrap">
                        Client Choice
                      </span>
                    ) : (
                      <div className="w-36">
                        <span className={`text-xs font-bold ${isFull ? 'text-red-600' : 'text-gray-700'}`}>
                          {isFull ? 'Sold Out' : `${booked} / ${isInfinity ? '∞' : max} Booked`}
                        </span>
                        {!isInfinity && (
                          <div className="w-full h-1.5 bg-gray-200 rounded mt-1.5 overflow-hidden">
                            <div className={`h-full ${isFull ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <BookingModeDropdown tourId={tour.id} currentMode={tour.bookingMode || 'BOTH'} />
                  </td>
                  <td className="px-8 py-5 text-[15px] font-bold text-gray-900">Rs. {tour.basePrice.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <div className="flex justify-end gap-2 items-center">
                      <DuplicateTourButton tourId={tour.id} />
                      <Link
                        href={`/dashboard/edit-tour/${tour.id}`}
                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        title="Edit Tour"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </Link>
                      <div className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-700">
                        <DeleteTourButton tourId={tour.id} />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
