import { apiFetch } from "@/lib/helpers/apiFetch";

export async function login(): Promise<{ token: string }> {
  const response = await apiFetch("auth/login", {
    method: "POST",
    cache: "no-store",
  });

  return response.json();
}
