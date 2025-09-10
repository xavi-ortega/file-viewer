import { KBItem } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { kbChildrenKey } from "@/lib/keys";

async function listKbChildren(
  kbId: string,
  resourcePath?: string,
): Promise<{
  data: KBItem[];
}> {
  const searchParams = resourcePath
    ? `?resource_path=${encodeURIComponent(resourcePath)}`
    : "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/kb/${kbId}/children${searchParams}`,
    {
      cache: "no-store",
    },
  );

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
