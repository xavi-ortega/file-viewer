export async function login(): Promise<{ token: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/login`,
    {
      method: "POST",
      cache: "no-store",
    },
  );

  return response.json();
}
