import bcrypt from 'bcrypt';
import Prisma from '../prisma';
async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const fullName = process.env.SEED_ADMIN_NAME ?? 'Super Admin';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await Prisma.admin.upsert({
    where: { email },
    update: { passwordHash, fullName },
    create: { email, passwordHash, fullName },
  });

  console.log(`✓ Admin seeded → id: ${admin.id}  email: ${admin.email}`);
}

main()
  .catch(console.error)
  .finally(() => Prisma.$disconnect());
