const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ 
  connectionString: "postgresql://postgres.lsaftvaudadtxfhcpjpq:TabeenSupabasse990s@aws-1-ap-south-1.pooler.supabase.com:5432/postgres" 
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting the database seed...');

  // 1. Upsert a Tenant (Axius Digital)
  const agency = await prisma.tenant.upsert({
    where: { subdomain: 'axius' },
    update: {}, 
    create: {
      companyName: 'Axius Digital',
      subdomain: 'axius',
      adminEmail: 'info@axiusdigital.com',
    },
  });
  console.log(`Created Tenant: ${agency.companyName}`);

  // 2. Create the Hunza Tour
  const hunzaTour = await prisma.tour.create({
    data: {
      title: "7-Day Autumn in Hunza Valley",
      destination: "Hunza",
      basePrice: 65000,
      duration: "7 Days",
      transportType: "Car",
      accommodation: "Hotel",
      coverImage: "https://example.com/hunza-cover.jpg",
      tenantId: agency.id,
      itineraryDays: {
        create: [
          { dayNumber: 1, title: "Departure from Islamabad.", details: "Departure from Islamabad." },
          { dayNumber: 2, title: "Arrival in Chilas.", details: "Arrival in Chilas." },
          { dayNumber: 3, title: "Drive to Hunza.", details: "Drive to Hunza." }
        ],
      },
    },
  });
  console.log(`✅ Created Tour: ${hunzaTour.title}`);

  // 3. Create the Skardu Tour
  const skarduTour = await prisma.tour.create({
    data: {
      title: "5-Day Skardu Expedition",
      destination: "Skardu",
      basePrice: 85000,
      accommodation: "Hotel",
      coverImage: "https://example.com/skardu-cover.jpg",
      duration: "5 Days",
      transportType: "Car",
      tenantId: agency.id,
      itineraryDays: {
        create: [
          { dayNumber: 1, title: "Flight to Skardu.", details: "Flight to Skardu, check-in at Shangrila Resort." },
          { dayNumber: 2, title: "Visit Upper Kachura Lake and Shigar Fort.", details: "Visit Upper Kachura Lake and Shigar Fort." },
          { dayNumber: 3, title: "Visit Kharpocho Lake.", details: "Visit Kharpocho Lake." },
          { dayNumber: 4, title: "Visit Khaplu Fort.", details: "Visit Khaplu Fort." },
          { dayNumber: 5, title: "Return to Skardu.", details: "Return to Skardu." },
          { dayNumber: 6, title: "Arrival in Skardu.", details: "Arrival in Skardu." }
        ]
      }
    }
  });
  console.log(`✅ Created Tour: ${skarduTour.title}`);

  console.log('✅ Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });