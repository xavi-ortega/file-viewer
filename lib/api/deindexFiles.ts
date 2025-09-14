import { apiFetch } from "@/lib/helpers/apiFetch";

export async function deindexFiles(kbId: string, resourcePaths: string[]) {
  if (!resourcePaths.length) return;
  await Promise.all(
    resourcePaths.map((p) =>
      apiFetch(`kb/${kbId}/deindex?resource_path=${encodeURIComponent(p)}`, {
        method: "DELETE",
      }),
    ),
  );
}
