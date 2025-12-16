import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const linz = await prisma.user.upsert({
    where: { email: 'linh@example.com' },
    update: {},
    create: {
      email: 'linh@example.com',
      passwordHash: 'hashed', // TODO: hash thật
      fullName: 'Khánh Linh',
      role: Role.admin,
    },
  });

  const meeting = await prisma.meeting.create({
    data: {
      title: 'Demo Q4 Planning',
      description: 'Sample seeded meeting',
      ownerId: linz.id,
      status: 'processing',
    },
  });

  console.log({ linz, meeting });
}

main().finally(async () => prisma.$disconnect());
