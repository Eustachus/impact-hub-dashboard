const { PrismaClient } = require('../src/generated/client');
const prisma = new PrismaClient();

const data = [
  {
    section: "Organisation de la 1ère session de clarification de valeur pour les professionnels de santé et du droit",
    tasks: [
      { name: "Rédaction des termes de références", subtasks: ["Rédiger les tdrs et faire valider"] },
      { name: "Lancement avis à manifestation des prestataires", subtasks: ["Rédiger l'avis à manifestation d'intérêt", "Publier l'avis à manifestation", "Analyser les offres et sortir le procès verbal d'adjudication"] },
      { name: "Recrutement facilitateur", subtasks: ["Rechercher et trouver un facilitateur"] },
      { name: "Préparation documentaire", subtasks: ["Préparer les documents, liste de présence, état de paiement, discours Présidente, etc."] },
      { name: "Préparation logistique", subtasks: ["Rechercher la salle", "Sélection et paiement pour la salle"] },
      { name: "Tenue de la session", subtasks: ["Animation de la session et Facilitation"] },
      { name: "Rédaction rapport de la session", subtasks: ["Rédiger le rapport de la session"] },
      { name: "Finalisation des livrables", subtasks: ["Valider le rapport de session & liste de présence", "Photos et vidéos", "Préparer et enregistrer les témoignages"] }
    ]
  },
  {
    section: "Assurer les frais connexe de prise en charge des survivantes",
    tasks: [
      { name: "Rédaction de la stratégie de prise en charge", subtasks: ["Rédiger la stratégie"] },
      { name: "Mise en œuvre de la stratégie", subtasks: ["Pour mémoire"] },
      { name: "Finalisation des livrables à mi-parcours", subtasks: ["Rédiger le rapport & Rendre disponible la base des survivantes prises en charge"] }
    ]
  },
  {
    section: "Organisation de la 2ème session de clarification de valeur pour les professionnels de santé et du droit",
    tasks: [
      { name: "Rédaction des termes de références", subtasks: ["Rédiger les tdrs et faire valider"] },
      { name: "Lancement avis à manifestation des prestataires", subtasks: ["Rédiger l'avis à manifestation d'intérêt", "Publier l'avis à manifestation", "Analyser les offres et sortir le procès verbal d'adjudication"] },
      { name: "Recrutement facilitateur", subtasks: ["Rechercher et trouver un facilitateur"] },
      { name: "Préparation documentaire", subtasks: ["Préparer les documents, liste de présence, état de paiement, discours Présidente, etc."] },
      { name: "Préparation logistique", subtasks: ["Identification de la salle", "Sélection et paiement pour la salle"] },
      { name: "Tenue de la session", subtasks: ["Animation de la session et Facilitation"] },
      { name: "Rédaction rapport de la session", subtasks: ["Rédiger le rapport de la session"] },
      { name: "Finalisation des livrables", subtasks: ["Valider le rapport de session & liste de présence", "Photos et vidéos", "Préparer et enregistrer les témoignages"] },
      { name: "Transmission des livrables au partenaires", subtasks: ["Transmission des livrables au partenaires"] }
    ]
  }
];

async function main() {
  const user = await prisma.user.findFirst({ where: { email: { startsWith: 'test' } } });
  if (!user) { console.error('Test user not found'); process.exit(1); }

  let workspace = await prisma.workspace.findFirst({ where: { name: 'Test Workspace' } });
  if (!workspace) {
    workspace = await prisma.workspace.create({ data: { name: 'Test Workspace' } });
  }

  const project = await prisma.project.create({
    data: {
      name: 'FND',
      description: 'Projet de Fondation des Nouvelles Dynamiques (FND)',
      workspaceId: workspace.id,
      status: 'ON_TRACK',
    }
  });

  console.log(`Created Project FND: ${project.id}`);

  let order = 0;
  for (let i = 0; i < data.length; i++) {
    const secData = data[i];
    const section = await prisma.section.create({
      data: {
        name: secData.section,
        projectId: project.id,
        order: i
      }
    });
    console.log(`  Created Section: ${secData.section}`);

    for (let j = 0; j < secData.tasks.length; j++) {
      const taskData = secData.tasks[j];
      const parentTask = await prisma.task.create({
        data: {
          title: taskData.name,
          projectId: project.id,
          sectionId: section.id,
          creatorId: user.id,
          order: j
        }
      });
      console.log(`    Created Task: ${taskData.name}`);

      for (let k = 0; k < taskData.subtasks.length; k++) {
        await prisma.task.create({
          data: {
            title: taskData.subtasks[k],
            projectId: project.id,
            creatorId: user.id,
            parentId: parentTask.id,
            order: k
          }
        });
      }
    }
  }
  console.log('Successfully seeded FND chronogram!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
