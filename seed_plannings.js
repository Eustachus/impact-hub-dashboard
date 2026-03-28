require('dotenv').config();
const { PrismaClient } = require('./src/generated/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: { startsWith: 'test' } } });
  if (!user) {
    console.error('Test user not found');
    process.exit(1);
  }

  let workspace = await prisma.workspace.findFirst({ where: { name: 'Test Workspace' } });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Test Workspace',
      }
    });
  }

  let project = await prisma.project.findFirst({ where: { name: 'Test Plannings Project' } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Test Plannings Project',
        workspaceId: workspace.id,
      }
    });
  }

  let task = await prisma.task.findFirst({ where: { title: 'Review Planning Documents' } });
  if (!task) {
    task = await prisma.task.create({
      data: {
        title: 'Review Planning Documents',
        projectId: project.id,
        creatorId: user.id,
      }
    });
  }

  const files = [
    'CALAS°BENIN_planning speakup3 et plan oprationnel.docx',
    'CHRONOGRAMME Ecole des Engagés 3.xlsx',
    'CHRONOGRAMME FEA 2 AFRO Bénin.docx',
    'Chronogramme FND.pdf',
    'ROAJELF BENIN Chronogramme .xlsx'
  ];

  for (const file of files) {
    const filePath = path.join(__dirname, 'public', 'uploads', 'plannings', file);
    let stats;
    try {
      stats = fs.statSync(filePath);
    } catch (e) {
      console.error(`Missing file: ${filePath}`);
      continue;
    }

    const ext = path.extname(file).replace('.', '');
    let fileType = 'document';
    if (ext === 'pdf') fileType = 'pdf';
    else if (ext === 'xlsx') fileType = 'excel';
    else if (ext === 'docx') fileType = 'word';

    await prisma.attachment.create({
      data: {
        name: file,
        url: `/uploads/plannings/${encodeURIComponent(file)}`,
        size: stats.size,
        type: fileType,
        taskId: task.id,
      }
    });
    console.log(`Attached ${file} to task ${task.id}`);
  }

  console.log('Successfully seeded attachments.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
