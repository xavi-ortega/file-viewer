export async function apiFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  return fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/${url}`, options);
}
