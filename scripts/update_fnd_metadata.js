const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.findFirst({ where: { name: 'FND' } });
  if (!project) {
    console.error("FND project not found");
    return;
  }

  const attachment = await prisma.attachment.findFirst({
    where: { name: { contains: 'FND' }, url: { endsWith: '.pdf' } }
  });

  console.log("Found Project:", project.id);
  console.log("Found Attachment:", attachment ? attachment.url : "Not Found");
  
  if (attachment) {
    // Add brief
    const brief = `Le Forum National sur la Décentralisation (FND) est une initiative stratégique visant à structurer et valider le cadre opérationnel de la décentralisation. 

Ce projet s'articule autour de deux sessions majeures :
1. Une phase préparatoire de rédaction des TDRs, sélection des facilitateurs et logistique.
2. Une phase d'exécution incluant l'animation des sessions, la validation des rapports et la transmission des livrables aux partenaires.

L'objectif est d'assurer une coordination fluide entre les acteurs locaux et les partenaires institutionnels pour renforcer l'efficacité des politiques de décentralisation.`;

    await prisma.project.update({
      where: { id: project.id },
      data: { brief }
    });
    console.log("Brief updated.");

    // Link resource
    const existingResource = await prisma.projectResource.findFirst({
      where: { projectId: project.id, url: attachment.url }
    });

    if (!existingResource) {
      await prisma.projectResource.create({
        data: {
          projectId: project.id,
          title: "Chronogramme FND (Officiel)",
          url: attachment.url,
          type: "LINK"
        }
      });
      console.log("Resource linked.");
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
