const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helpers to map "Month Sx" to a dummy 2026 date range
// Each Sx is treated as a 1-week chunk continuously starting from Jan 1, 2026
function getDates(startWeekIdx, endWeekIdx) {
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  const baseDate = new Date('2026-01-01T00:00:00Z').getTime();
  
  const startDate = new Date(baseDate + (startWeekIdx - 1) * MS_PER_WEEK);
  const dueDate = new Date(baseDate + (endWeekIdx * MS_PER_WEEK) - 1000);
  return { startDate, dueDate };
}

// Mapping sections + subtasks to Week indices (1 to 32)
// 1ère session: 
// Jan: 1-4, Feb: 5-8, Mar: 9-12, Apr: 13-16, May: 17-20, Jun: 21-24, Jul: 25-28, Aug: 29-32
const timeline1 = {
  "Rédiger les tdrs et faire valider": [1, 3],
  "Rédiger l'avis à manifestation d'intérêt": [1, 2],
  "Publier l'avis à manifestation": [3, 5],
  "Analyser les offres et sortir le procès verbal d'adjudication": [6, 7],
  "Rechercher et trouver un facilitateur": [1, 3],
  "Préparer les documents, liste de présence, état de paiement, discours Présidente, etc.": [8, 13],
  "Rechercher la salle": [11, 12],
  "Sélection et paiement pour la salle": [13, 14],
  "Animation de la session et Facilitation": [15, 16],
  "Rédiger le rapport de la session": [17, 17],
  "Valider le rapport de session & liste de présence": [19, 19],
  "Photos et vidéos": [19, 19],
  "Préparer et enregistrer les témoignages": [19, 20]
};

const timeline2 = {
  "Rédiger les tdrs et faire valider": [5, 7],
  "Rédiger l'avis à manifestation d'intérêt": [11, 12],
  "Publier l'avis à manifestation": [13, 13],
  "Analyser les offres et sortir le procès verbal d'adjudication": [15, 18],
  "Rechercher et trouver un facilitateur": [16, 17],
  "Préparer les documents, liste de présence, état de paiement, discours Présidente, etc.": [16, 22],
  "Sélection et paiement pour la salle": [18, 19],
  "Animation de la session et Facilitation": [26, 27],
  "Rédiger le rapport de la session": [28, 28],
  "Valider le rapport de session & liste de présence": [29, 29],
  "Photos et vidéos": [29, 29],
  "Préparer et enregistrer les témoignages": [28, 32],
  "Transmission des livrables au partenaires": [32, 32]
};

async function main() {
  const project = await prisma.project.findFirst({ where: { name: 'FND' } });
  if (!project) {
    console.error("FND project not found");
    return;
  }

  const sections = await prisma.section.findMany({ 
    where: { projectId: project.id },
    include: {
      tasks: {
        include: {
          subtasks: true
        }
      }
    }
  });

  for (const section of sections) {
    let mapping = {};
    if (section.name.includes("1ère")) {
      mapping = timeline1;
    } else if (section.name.includes("2ème")) {
      mapping = timeline2;
    }

    // Flatten tasks and subtasks
    const allTasksInSec = [...section.tasks];
    for (const t of section.tasks) {
      if (t.subtasks) allTasksInSec.push(...t.subtasks);
    }

    for (const t of allTasksInSec) {
      if (mapping[t.title]) {
        const [start, end] = mapping[t.title];
        const { startDate, dueDate } = getDates(start, end);
        
        await prisma.task.update({
          where: { id: t.id },
          data: { startDate, dueDate }
        });
        console.log(`Updated ${t.title} -> ${startDate.toISOString().split('T')[0]} to ${dueDate.toISOString().split('T')[0]}`);
      }
    }
  }

  console.log("Done updating FND timeline.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
