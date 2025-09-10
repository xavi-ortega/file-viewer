export async function getGoogleDriveConnection(): Promise<{
  connectionId: string;
  name: string;
}> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/connections/gdrive`,
    {
      cache: "no-store",
    },
  );

  return response.json();
}
