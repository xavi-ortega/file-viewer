import { apiFetch } from "@/lib/helpers/apiFetch";

export async function getOrganization(): Promise<{ organizationId: string }> {
  const response = await apiFetch("auth/me");

  const json = await response.json();

  return { organizationId: json.org_id };
}
