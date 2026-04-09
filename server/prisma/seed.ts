// prisma/seed.ts
import { prisma } from '../src/lib/prisma';
import { seedAdmin } from './seeds/admin';

async function main() {
  try {
    console.log('🌱 Starting database seed...');
    await seedAdmin();
    console.log('✅ Seeding completed successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Crucial: Disconnect Prisma so the script can exit
    await prisma.$disconnect();
  }
}

main();
