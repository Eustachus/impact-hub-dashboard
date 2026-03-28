const { PrismaClient } = require('./src/generated/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:d:/Studio26/Portfolio/Romance%20HOUNKPATIN/Dashboard/focus/prisma/dev.db'
    }
  }
});

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
