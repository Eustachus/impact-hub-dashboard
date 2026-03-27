import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const workspace = await prisma.workspace.findFirst()
  const user = await prisma.user.findFirst()
  console.log(JSON.stringify({ workspaceId: workspace?.id, userId: user?.id }))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
