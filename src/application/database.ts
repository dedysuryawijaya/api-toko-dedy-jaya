import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from './logging.js';
import 'dotenv/config'

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg(
    {connectionString},
    {schema: 'public'}
);

export const prismaClient = new PrismaClient({
    adapter,
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
    ]
});
prismaClient.$on('query', (e) => {
    logger.info(e);
});
prismaClient.$on('info', (e) => {
    logger.info(e);
});
prismaClient.$on('warn', (e) => {
    logger.warn(e);
});
prismaClient.$on('error', (e) => {
    logger.error(e);
});