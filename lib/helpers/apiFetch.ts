export async function apiFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  return fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/${url}`, {
    ...options,
    // The cache is handled by TanStack in the client side
    cache: "no-store",
  });
}
