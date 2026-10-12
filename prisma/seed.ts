import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, type Category } from "../src/generated/prisma/client";

/**
 * Seeds exactly 15 events:
 *   10 active + upcoming
 *    2 inactive + upcoming
 *    3 in the past
 * across all five categories and all six cities.
 *
 * Dates are relative to the moment you run the seed, so the "upcoming" filter
 * keeps working no matter when the project is set up. Every row uses a stable
 * id, so running the seed twice updates the same 15 events instead of adding
 * duplicates.
 */

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function istDayKey(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(instant);
}

/** `hours` is in IST (UTC+5:30), which is where all events take place. */
function istDateTime(dayOffset: number, time: string): Date {
  const target = new Date(Date.now() + dayOffset * 86_400_000);
  return new Date(`${istDayKey(target)}T${time}:00+05:30`);
}

type SeedEvent = {
  id: string;
  title: string;
  category: Category;
  city: string;
  dayOffset: number;
  time: string;
  price: number;
  description: string;
  isActive: boolean;
};

const seedEvents: SeedEvent[] = [
  // ---------------------------------------------------------------- upcoming, active
  {
    id: "seed-event-01",
    title: "Neon Nights: Indie Music Fest",
    category: "MUSIC",
    city: "Coimbatore",
    dayOffset: 3,
    time: "19:00",
    price: 799,
    description:
      "An open-air night of indie bands, food trucks and a laser-lit skyline. Bring a jacket, the breeze from the hills gets cold after the second set.",
    isActive: true,
  },
  {
    id: "seed-event-02",
    title: "Sunrise Yoga & Wellness Workshop",
    category: "WORKSHOP",
    city: "Pune",
    dayOffset: 4,
    time: "06:30",
    price: 499,
    description:
      "A two-hour guided session on breathing, posture and mindful mornings. Mats and herbal tea included; suitable for absolute beginners.",
    isActive: true,
  },
  {
    id: "seed-event-03",
    title: "Street Food Carnival",
    category: "FOOD",
    city: "Mumbai",
    dayOffset: 6,
    time: "17:00",
    price: 0,
    description:
      "Forty stalls of pav bhaji, vada pav, chaat and kebabs along the sea face. Entry is free - pay only for what you eat.",
    isActive: true,
  },
  {
    id: "seed-event-04",
    title: "City Half Marathon 21K",
    category: "SPORTS",
    city: "Bangalore",
    dayOffset: 9,
    time: "05:30",
    price: 1200,
    description:
      "A certified 21K route through Cubbon Park and the old airport road. Timing chips, hydration stations and a finisher medal for every runner.",
    isActive: true,
  },
  {
    id: "seed-event-05",
    title: "Little Explorers Science Camp",
    category: "KIDS",
    city: "Chennai",
    dayOffset: 11,
    time: "10:00",
    price: 650,
    description:
      "A hands-on morning of rockets, slime and simple circuits for ages 6 to 12. All materials provided and every child takes their kit home.",
    isActive: true,
  },
  {
    id: "seed-event-06",
    title: "Acoustic Evening with Local Artists",
    category: "MUSIC",
    city: "Pune",
    dayOffset: 13,
    time: "18:30",
    price: 350,
    description:
      "Six singer-songwriters share an intimate stage in a restored heritage hall. Unplugged sets, poetry between songs and a coffee counter.",
    isActive: true,
  },
  {
    id: "seed-event-07",
    title: "Pottery & Clay Wheel Workshop",
    category: "WORKSHOP",
    city: "Coimbatore",
    dayOffset: 16,
    time: "15:00",
    price: 1500,
    description:
      "Learn centring, pulling and trimming on a real potter's wheel. Firing and glazing are included, and your finished piece is delivered in two weeks.",
    isActive: true,
  },
  {
    id: "seed-event-08",
    title: "Biryani & Kebab Food Fair",
    category: "FOOD",
    city: "Delhi",
    dayOffset: 19,
    time: "12:30",
    price: 250,
    description:
      "Twelve legendary kitchens, one lawn. Dum biryani, seekh kebabs, phirni and live folk music from noon until the plates run out.",
    isActive: true,
  },
  {
    id: "seed-event-09",
    title: "Junior Football League Finals",
    category: "SPORTS",
    city: "Mumbai",
    dayOffset: 22,
    time: "16:00",
    price: 200,
    description:
      "The season finale for under-14 teams across the city. Two semi-finals, a skills zone for younger kids and an open community stand.",
    isActive: true,
  },
  {
    id: "seed-event-10",
    title: "Puppet Show & Story Hour",
    category: "KIDS",
    city: "Bangalore",
    dayOffset: 25,
    time: "11:00",
    price: 0,
    description:
      "Traditional string puppets retell folk tales for young audiences. Free entry, seating on a first-come basis, 45 minutes long.",
    isActive: true,
  },

  // -------------------------------------------------------------- upcoming, inactive
  {
    id: "seed-event-11",
    title: "Rooftop Jazz Night",
    category: "MUSIC",
    city: "Delhi",
    dayOffset: 8,
    time: "20:00",
    price: 999,
    description:
      "A five-piece jazz outfit plays two sets above the city lights. Postponed - ticket holders will be notified with the new date shortly.",
    isActive: false,
  },
  {
    id: "seed-event-12",
    title: "Weekend Startup Founders Workshop",
    category: "WORKSHOP",
    city: "Bangalore",
    dayOffset: 12,
    time: "09:30",
    price: 2500,
    description:
      "A full-day session on pricing, hiring and fundraising with three practising founders. Paused while the venue is being reconfirmed.",
    isActive: false,
  },

  // --------------------------------------------------------------------------- past
  {
    id: "seed-event-13",
    title: "Monsoon Food Festival",
    category: "FOOD",
    city: "Mumbai",
    dayOffset: -14,
    time: "13:00",
    price: 300,
    description:
      "Pakoras, chai and hot bhajiya stalls under a canopy of fairy lights. Thank you to the 3,000 people who braved the rain with us.",
    isActive: true,
  },
  {
    id: "seed-event-14",
    title: "Classical Dance Recital",
    category: "MUSIC",
    city: "Chennai",
    dayOffset: -30,
    time: "18:00",
    price: 450,
    description:
      "Bharatanatyam and Carnatic ensemble performances from students of three city academies. A full house and a standing ovation.",
    isActive: true,
  },
  {
    id: "seed-event-15",
    title: "Kids Storytelling Hour",
    category: "KIDS",
    city: "Coimbatore",
    dayOffset: -45,
    time: "10:30",
    price: 0,
    description:
      "An hour of folk tales, shadow puppets and sing-alongs for the youngest readers in the neighbourhood library.",
    isActive: true,
  },
];

async function main() {
  for (const event of seedEvents) {
    const data = {
      title: event.title,
      category: event.category,
      city: event.city,
      eventDate: istDateTime(event.dayOffset, event.time),
      price: event.price,
      description: event.description,
      imageUrl: `https://picsum.photos/seed/${event.id}/1200/800`,
      isActive: event.isActive,
    };

    await prisma.event.upsert({
      where: { id: event.id },
      create: { id: event.id, ...data },
      update: data,
    });
  }

  const [total, active, upcoming] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { isActive: true } }),
    prisma.event.count({ where: { isActive: true, eventDate: { gt: new Date() } } }),
  ]);

  console.log(`Seed complete: ${total} events (${active} active, ${upcoming} active + upcoming).`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
