import { NextResponse } from "next/server";
import { setSessionToken } from "@/lib/helpers/cookies";

export async function POST() {
  const { STACK_SUPABASE_ANON_KEY, DEMO_USER, DEMO_PASSWORD } = process.env;

  if (!STACK_SUPABASE_ANON_KEY || !DEMO_USER || !DEMO_PASSWORD) {
    throw new Error("Missing env vars");
  }

  const res = await fetch(
    `${process.env.STACK_AUTH_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Apikey: STACK_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email: DEMO_USER,
        password: DEMO_PASSWORD,
        gotrue_meta_security: {},
      }),
      cache: "no-store",
    },
  );

  const json = await res.json();

  const token = json.access_token;

  void setSessionToken(token);

  return NextResponse.json({ token });
}
