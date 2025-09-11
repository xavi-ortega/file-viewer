import { KBItem } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { kbChildrenKey } from "@/lib/keys";
import { apiFetch } from "@/lib/helpers/apiFetch";

async function listKbChildren(
  kbId: string,
  resourcePath?: string,
): Promise<{
  data: KBItem[];
}> {
  const searchParams = resourcePath
    ? `?resource_path=${encodeURIComponent(resourcePath)}`
    : "";

  const res = await apiFetch(`kb/${kbId}/children${searchParams}`);

  if (!res.ok) throw new Error("Failed to list KB children");

  return res.json();
}

export function useKbChildrenListing(params: {
  kbId: string;
  resourcePath?: string;
}) {
  const { kbId, resourcePath } = params;

  return useQuery({
    queryKey: kbChildrenKey(kbId, resourcePath),
    queryFn: async () => {
      const response = await listKbChildren(kbId, resourcePath);

      return response.data;
    },
    enabled: Boolean(kbId),
    staleTime: 5_000,
  });
}
