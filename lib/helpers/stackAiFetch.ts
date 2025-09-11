import { getSessionToken } from "@/lib/helpers/cookies";

export async function stackAiFetch(path: string, init?: RequestInit) {
  const token = await getSessionToken();
  const res = await fetch(`${process.env.STACK_BACKEND_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    // The cache is handled by TanStack in the client side
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `STACK_API_${res.status}`);
  }

  return res;
}
