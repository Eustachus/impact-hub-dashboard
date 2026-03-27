const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  const attachments = await prisma.attachment.findMany({
    where: {
      OR: [
        { type: 'word' },
        { type: 'excel' }
      ]
    }
  });

  for (const att of attachments) {
    if (att.url.endsWith('.pdf')) continue;

    const oldName = att.name;
    const newName = oldName.replace(/\.(docx?|xlsx?)$/i, '.pdf');
    const inPath = path.join(__dirname, '..', 'public', att.url);
    
    // Remove query params or URL encoding
    const inPathDecoded = decodeURIComponent(inPath);
    const outPathDecoded = inPathDecoded.replace(/\.(docx?|xlsx?)$/i, '.pdf');
    
    console.log(`Converting ${oldName} to PDF...`);
    
    try {
      const ps1Path = path.join(__dirname, 'convert_to_pdf.ps1');
      execSync(`powershell.exe -ExecutionPolicy Bypass -File "${ps1Path}" -InputFile "${inPathDecoded}" -OutputFile "${outPathDecoded}"`, {
        stdio: 'inherit'
      });

      const stats = fs.statSync(outPathDecoded);

      await prisma.attachment.update({
        where: { id: att.id },
        data: {
          name: newName,
          url: att.url.replace(/\.(docx?|xlsx?)$/i, '.pdf'),
          size: stats.size,
          type: 'pdf'
        }
      });
      console.log(`Successfully converted and updated: ${newName}`);
    } catch (err) {
      console.error(`Failed to convert ${oldName}:`, err.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
