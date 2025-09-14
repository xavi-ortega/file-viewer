import { cookies } from "next/headers";
import { login } from "@/lib/api/login";

async function setCookie(name: string, value: string) {
  (await cookies()).set(name, value, {
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSessionToken() {
  const token = (await cookies()).get("stack_session")?.value;

  if (!token) {
    const response = await login();

    void setSessionToken(response.token);

    return response.token;
  }

  return token;
}

async function setSessionToken(token: string) {
  await setCookie("stack_session", token);
}

export async function getKbId() {
  return (await cookies()).get("stack_kb")?.value;
}

export async function setKbId(kbId: string) {
  await setCookie("stack_kb", kbId);
}
