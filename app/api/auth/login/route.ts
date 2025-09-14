import { NextResponse } from "next/server";

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
    },
  );

  const json = await res.json();

  return NextResponse.json({ token: json.access_token });
}
