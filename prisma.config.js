import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Put exactly this, do not paste your URL here!
    url: env("DATABASE_URL"), 
  },
});

// // prisma.config.js
// module.exports = {
//     schema: "prisma/schema.prisma",
//     datasource: {
//       // I changed 6543 to 5432
//       url: "postgresql://postgres.lsaftvaudadtxfhcpjpq:TabeenSupabasse990s@aws-1-ap-south-1.pooler.supabase.com:5432/postgres",
//     },
//   };