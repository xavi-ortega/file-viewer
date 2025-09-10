export async function getOrganization(): Promise<{ organizationId: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/me`,
    {
      cache: "no-store",
    },
  );

  const json = await response.json();

  return json.org_id;
}
