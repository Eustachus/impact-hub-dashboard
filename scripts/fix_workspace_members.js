const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.findFirst({ where: { name: 'Test Workspace' } });
  if (!workspace) {
    console.error('Test Workspace not found');
    return;
  }

  const users = await prisma.user.findMany({
    where: { email: { contains: 'test' } }
  });

  for (const user of users) {
    const exists = await prisma.workspaceMember.findFirst({
      where: { userId: user.id, workspaceId: workspace.id }
    });
    if (!exists) {
      await prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'ADMIN'
        }
      });
      console.log(`Added ${user.email} to Test Workspace`);
    }
  }

  // Also let's run it for "Test Plannings Project" to ensure task documents work ? 
  // Actually the documents query was: 
  // OR: [ { creatorId: userId }, { assignees: { some: { userId } } }, { project: { workspace: { members: { some: { userId } } } } } ]
  // So simply adding the user as Workspace Member solves both the documents visibility AND the projects visibility!
  console.log('Done fixing workspace members.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
