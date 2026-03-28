const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.update({
    where: { email: 'test@example.com' },
    data: { password: hashedPassword }
  });
  console.log('Password reset for test@example.com to password123');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
