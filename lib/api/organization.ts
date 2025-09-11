import { apiFetch } from "@/lib/helpers/apiFetch";

export async function getOrganization(): Promise<{ organizationId: string }> {
  const response = await apiFetch("auth/me", {
    cache: "no-store",
  });

  const json = await response.json();

  return json.org_id;
}
