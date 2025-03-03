const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    try {
        await prisma.$connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Failed to connect to the database', error);
        process.exit(1);
    }
})();

module.exports = prisma;
