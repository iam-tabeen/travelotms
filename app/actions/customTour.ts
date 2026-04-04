"use server";

export async function submitCustomTour(tenantId: string, formData: FormData) {
  // 1. Form ka data jama karein
  const payload = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    cityCountry: formData.get('cityCountry') as string,
    dateFrom: formData.get('dateFrom') as string,
    dateTo: formData.get('dateTo') as string,
    travelers: formData.get('travelers') as string,
    accommodation: formData.get('accommodation') as string,
    budget: formData.get('budget') as string,
    requirements: formData.get('requirements') as string,
    destinations: (formData.getAll('destinations') as string[]).join(', '),
    tourTypes: (formData.getAll('tourTypes') as string[]).join(', ')
  };

  try {
    // Vercel Environment Variables se URL aur API Key lein
    const apiUrl = process.env.NEXT_PUBLIC_API_URL; 
    const apiKey = process.env.AGENCY_API_KEY; 

    // 2. Data Backend ko bhejein
    // Note: Agar aapke backend route ka naam kuch aur hai, toh is URL ko update kar lein
    const response = await fetch(`${apiUrl}/api/public/custom-tour`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '' // Secure Connection
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        console.error("Backend URL Not Found or Failed:", response.status);
        return { success: false, error: "Backend connection failed." };
    }

    const result = await response.json();

    if (result.success) {
      return { success: true };
    } else {
      console.error("Backend rejected:", result.error);
      return { success: false, error: result.error };
    }

  } catch (error) {
    console.error("Custom tour fetch failed:", error);
    return { success: false, error: "Network Error" };
  }
}