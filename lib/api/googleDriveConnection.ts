import { apiFetch } from "@/lib/helpers/apiFetch";

export async function getGoogleDriveConnection(): Promise<{
  connectionId: string;
  name: string;
}> {
  const response = await apiFetch("connections/gdrive");

  return response.json();
}
