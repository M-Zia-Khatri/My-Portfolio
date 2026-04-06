// src/lib/prisma.ts
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client.js';
import { getConfig } from '../config/env.js';

let prisma: PrismaClient;

export function getPrisma() {
  if (prisma) return prisma;

  const config = getConfig(); // Call it when needed

  const adapter = new PrismaMariaDb({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    connectionLimit: 5,
  });

  prisma = new PrismaClient({ adapter });
  return prisma;
}

export default getPrisma();
