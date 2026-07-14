import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { hashPassword } from "../lib/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@barberhub.az";
const DEMO_PASSWORD = "demo1234";

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log("Demo bərbər artıq mövcuddur, seed atlanıldı.");
    return;
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      barberProfile: {
        create: {
          slug: "nail-barber",
          fullName: "Nail Bərbər",
          phone: "0501234567",
          city: "Bakı",
          bio: "10 illik təcrübəyə malik bərbər.",
          services: {
            create: [
              { name: "Saç kəsimi", durationMinutes: 30, price: 15 },
              { name: "Saqqal düzəltmə", durationMinutes: 20, price: 10 },
            ],
          },
          workingHours: {
            create: Array.from({ length: 7 }, (_, weekday) => ({
              weekday,
              startTime: "09:00",
              endTime: "19:00",
              isOff: weekday === 0,
            })),
          },
        },
      },
    },
    include: { barberProfile: true },
  });

  console.log(`Demo bərbər yaradıldı: /barber/${user.barberProfile?.slug} (email: ${DEMO_EMAIL}, parol: ${DEMO_PASSWORD})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
