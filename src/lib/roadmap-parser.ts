export interface ParsedTask {
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: string;
}

export interface ParsedSection {
  name: string;
  tasks: ParsedTask[];
}

export interface ParsedProject {
  name: string;
  description: string;
  sections: ParsedTask[][];
  sectionNames: string[];
  totalTasks: number;
}

// Common section/phase headers in roadmaps
const SECTION_PATTERNS = [
  // Phase patterns
  /^(?:phase|étape|step|stage)\s*\d+[:\s.-]*(.*)/i,
  // Quarter patterns
  /^q[1-4]\s*(?:20\d{2})?[:\s.-]*(.*)/i,
  // Sprint patterns
  /^sprint\s*\d+[:\s.-]*(.*)/i,
  // Month patterns
  /^(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s*(?:20\d{2})?[:\s.-]*(.*)/i,
  // Numbered headers
  /^\d+[\.\)]\s+[A-ZÀ-Ü].{3,}/,
  // ALL CAPS headers
  /^[A-ZÀ-Ü][A-ZÀ-Ü\s]{4,}$/,
  // Markdown headers
  /^#{1,3}\s+(.+)/,
  // Bracketed labels
  /^\[([^\]]+)\]/,
];

const TASK_PATTERNS = [
  // Bullet points
  /^[\s]*[-*•●○▪▸▹→➜]\s+(.+)/,
  // Checkbox patterns
  /^[\s]*\[?\s?\]\s+(.+)/,
  // Numbered sub-items
  /^[\s]*\d+[\.\)]\s+(.+)/,
  // Lettered items
  /^[\s]*[a-z][\.\)]\s+(.+)/,
];

const PRIORITY_KEYWORDS: Record<string, ParsedTask["priority"]> = {
  urgent: "URGENT",
  critique: "URGENT",
  critical: "URGENT",
  high: "HIGH",
  élevé: "HIGH",
  importante: "HIGH",
  medium: "MEDIUM",
  moyen: "MEDIUM",
  standard: "MEDIUM",
  low: "LOW",
  bas: "LOW",
  minor: "LOW",
};

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 200) return false;

  for (const pattern of SECTION_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }

  // Short line that ends with : or is followed by tasks
  if (trimmed.endsWith(":") && trimmed.length < 80) return true;

  return false;
}

function isTaskLine(line: string): { match: boolean; text: string } {
  for (const pattern of TASK_PATTERNS) {
    const match = line.match(pattern);
    if (match) return { match: true, text: match[1].trim() };
  }
  return { match: false, text: "" };
}

function detectPriority(text: string): ParsedTask["priority"] {
  const lower = text.toLowerCase();
  for (const [keyword, priority] of Object.entries(PRIORITY_KEYWORDS)) {
    if (lower.includes(keyword)) return priority;
  }
  return "MEDIUM";
}

function cleanSectionName(raw: string): string {
  return raw
    .replace(/^#+\s*/, "")
    .replace(/^\d+[\.\)]\s*/, "")
    .replace(/[:\-–—]+$/, "")
    .trim()
    .slice(0, 100);
}

export function parseRoadmapText(text: string): ParsedProject {
  const cleaned = cleanText(text);
  const lines = cleaned.split("\n").map(l => l.trim()).filter(l => l.length > 0);

  // Extract project name from first meaningful line
  let projectName = "Imported Project";
  const projectDescription = "Project created from PDF roadmap";
  const firstLines = lines.slice(0, 10);

  for (const line of firstLines) {
    // Look for a title-like line
    if (line.length > 5 && line.length < 100 && !isTaskLine(line).match && !isSectionHeader(line)) {
      if (line.toUpperCase() === line || line.length < 60) {
        projectName = line.replace(/[:\-–—]+$/, "").trim();
        break;
      }
    }
  }

  // Parse sections and tasks
  const sections: ParsedTask[][] = [];
  const sectionNames: string[] = [];
  let currentTasks: ParsedTask[] = [];
  let currentSectionName = "General";
  let foundFirstSection = false;

  for (const line of lines) {
    // Skip very short lines
    if (line.length < 3) continue;

    // Check if it's a section header
    if (isSectionHeader(line)) {
      // Save previous section if it has tasks
      if (currentTasks.length > 0) {
        sections.push(currentTasks);
        sectionNames.push(currentSectionName);
      } else if (foundFirstSection) {
        // Empty section, still push
        sections.push([]);
        sectionNames.push(currentSectionName);
      }

      currentSectionName = cleanSectionName(line);
      currentTasks = [];
      foundFirstSection = true;
      continue;
    }

    // Check if it's a task line
    const taskCheck = isTaskLine(line);
    if (taskCheck.match) {
      const taskText = taskCheck.text;
      if (taskText.length > 3) {
        currentTasks.push({
          title: taskText.slice(0, 200),
          description: taskText.length > 200 ? taskText.slice(200) : undefined,
          priority: detectPriority(taskText),
          status: "TODO",
        });
      }
      continue;
    }

    // If we haven't found any sections yet, treat lines as tasks under "General"
    if (!foundFirstSection && line.length > 5 && line.length < 200) {
      // Skip lines that look like metadata (dates, URLs, etc.)
      if (/^https?:\/\//.test(line)) continue;
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(line)) continue;

      currentTasks.push({
        title: line.slice(0, 200),
        priority: detectPriority(line),
        status: "TODO",
      });
    }
  }

  // Don't forget the last section
  if (currentTasks.length > 0) {
    sections.push(currentTasks);
    sectionNames.push(currentSectionName);
  }

  // If no sections were found, create one from all tasks
  if (sections.length === 0 && currentTasks.length === 0) {
    // Fallback: treat every non-empty line as a task
    const fallbackTasks: ParsedTask[] = lines
      .filter(l => l.length > 5 && l.length < 200)
      .slice(0, 30)
      .map(l => ({
        title: l.slice(0, 200),
        priority: "MEDIUM" as const,
        status: "TODO",
      }));

    if (fallbackTasks.length > 0) {
      sections.push(fallbackTasks);
      sectionNames.push("Tasks");
    }
  }

  const totalTasks = sections.reduce((sum, s) => sum + s.length, 0);

  return {
    name: projectName,
    description: projectDescription,
    sections,
    sectionNames,
    totalTasks,
  };
}
