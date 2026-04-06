// prisma/seeds/admin.ts
import bcrypt from 'bcrypt';
import Prisma from '../../src/lib/prisma'; // Ensure this points to your prisma instance
import { getConfig } from '../../src/config/env'; // Use relative path for safety

export async function seedAdmin() {
  const config = getConfig(); // Get fresh config
  const adminObj = config.admin || {};

  const email = adminObj.email || 'admin@example.com';
  const password = adminObj.password || 'ChangeMe123!';
  const fullName = adminObj.name || 'Super Admin';
  
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await Prisma.admin.upsert({
    where: { email },
    update: { passwordHash, fullName },
    create: { email, passwordHash, fullName },
  });

  console.log(`✓ Admin seeded → id: ${admin.id}  email: ${admin.email}`);
}