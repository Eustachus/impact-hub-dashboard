export function exportTasksToCSV(tasks: Record<string, unknown>[], filename = "tasks") {
  if (!tasks || tasks.length === 0) return;

  const headers = ["ID", "Title", "Status", "Priority", "Due Date", "Created At", "Project", "Assignees"];
  
  const rows = tasks.map((t: Record<string, unknown>) => {
    const assignees = ((t.assignees as Record<string, unknown>[]) || [])
      .map((a: Record<string, unknown>) => ((a.user as Record<string, unknown> | undefined)?.name as string) || "")
      .filter(Boolean)
      .join(", ");

    return [
      t.id || "",
      `"${(t.title as string || "").replace(/"/g, '""')}"`,
      t.status || "",
      t.priority || "",
      t.dueDate ? new Date(t.dueDate as string).toLocaleDateString() : "",
      t.createdAt ? new Date(t.createdAt as string).toLocaleDateString() : "",
      (t.project as Record<string, unknown> | undefined)?.name || "",
      assignees,
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
