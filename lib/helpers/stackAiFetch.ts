import { getSessionToken, setSessionToken } from "@/lib/helpers/cookies";
import { login } from "@/lib/api/login";

export async function stackAiFetch(path: string, init?: RequestInit) {
  const token = await getSessionToken();
  const res = await fetch(`${process.env.STACK_BACKEND_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const json = await res.json().catch(() => "");

    if (json.detail === "Not authenticated") {
      const { token } = await login();

      await setSessionToken(token);

      return stackAiFetch(path, init);
    } else {
      throw new Error(json || `STACK_API_${res.status}`);
    }
  }

  return res;
}
