const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.findFirst();
  const user = await prisma.user.findFirst();

  if (!workspace || !user) {
    console.error("No workspace or user found");
    return;
  }

  const workspaceId = workspace.id;
  const creatorId = user.id;

  // 1. ROAJELF & FND
  const project1 = await prisma.project.create({
    data: {
      name: "ROAJELF & FND",
      description: "Projet de lutte contre les VBG et renforcement des droits",
      status: "ON_TRACK",
      workspaceId,
      tasks: {
        create: [
          { title: "Rédaction du projet et ANO d'exécution", startDate: new Date("2025-11-01"), dueDate: new Date("2026-01-31"), status: "DONE", creatorId },
          { title: "LANCEMENT OFFICIEL DU PROJET Cotonou", startDate: new Date("2026-02-01"), dueDate: new Date("2026-04-30"), status: "IN_PROGRESS", creatorId },
          { title: "Séminaire national sur la clarification", startDate: new Date("2026-06-01"), dueDate: new Date("2026-07-31"), status: "TODO", creatorId },
          { title: "Former les acteurs sur le contentieux stratégique", startDate: new Date("2026-05-01"), dueDate: new Date("2026-07-31"), status: "TODO", creatorId },
          { title: "Étude sur les parcours des survivantes", startDate: new Date("2026-03-01"), dueDate: new Date("2026-09-30"), status: "TODO", creatorId },
          { title: "Appuyer le comité multi acteurs", startDate: new Date("2026-03-01"), dueDate: new Date("2027-03-31"), status: "IN_PROGRESS", creatorId }
        ]
      }
    }
  });

  // 2. KINOWENDIA
  const project2 = await prisma.project.create({
    data: {
      name: "KINOWENDIA",
      description: "Programme de formation et production de films",
      status: "ON_TRACK",
      workspaceId,
      tasks: {
        create: [
          { title: "Signature officielle des partenariats", startDate: new Date("2026-01-01"), dueDate: new Date("2026-03-31"), status: "DONE", creatorId },
          { title: "Mise en place de l'équipe projet", startDate: new Date("2026-01-01"), dueDate: new Date("2026-03-31"), status: "DONE", creatorId },
          { title: "Définition des objectifs et budget", startDate: new Date("2026-01-01"), dueDate: new Date("2026-03-31"), status: "DONE", creatorId },
          { title: "Élaboration des supports de communication", startDate: new Date("2026-03-01"), dueDate: new Date("2026-05-31"), status: "IN_PROGRESS", creatorId },
          { title: "Identification des formatrices", startDate: new Date("2026-03-01"), dueDate: new Date("2026-05-31"), status: "IN_PROGRESS", creatorId },
          { title: "Finalisation de l'appel à candidatures", startDate: new Date("2026-05-01"), dueDate: new Date("2026-07-31"), status: "TODO", creatorId },
          { title: "Formation en ligne (phase intensive)", startDate: new Date("2027-02-01"), dueDate: new Date("2027-04-30"), status: "TODO", creatorId }
        ]
      }
    }
  });

  console.log("Projects seeded successfully:", project1.name, project2.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
