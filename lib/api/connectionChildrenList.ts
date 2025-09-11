import { ConnItem } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { connChildrenKey } from "@/lib/keys";
import { apiFetch } from "@/lib/helpers/apiFetch";

async function listConnChildren(
  connectionId: string,
  resourceId?: string,
  cursor?: string,
): Promise<{ data: ConnItem[]; nextCursor?: string }> {
  const searchParams = new URLSearchParams();

  if (resourceId) searchParams.set("resource_id", resourceId);
  if (cursor) searchParams.set("cursor", cursor);

  const response = await apiFetch(
    `connections/${connectionId}/children?${searchParams.toString()}`,
  );

  const json = await response.json()

  return {
    data: json.data,
    nextCursor: json.nextCursor,
  };
}

export function useConnChildrenListing(params: {
  connId: string;
  resourceId?: string;
}) {
  const { connId, resourceId } = params;

  const query = useInfiniteQuery({
    queryKey: connChildrenKey(connId, resourceId),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      listConnChildren(connId, resourceId, pageParam),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 60_000,
  });

  return {
    ...query,
    data: query.data?.pages.flatMap((page) => page.data),
  };
}
