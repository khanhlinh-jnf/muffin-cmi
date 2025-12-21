import { NextRequest, NextResponse } from "next/server";
import { validateUser, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await validateUser(email, password);
  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = signToken(user.id);

  // set cookie httpOnly (simple version)
  const res = NextResponse.json({
    access_token: token,
    user: {
      id: user.id,
      full_name: user.fullName,
      role: user.role,
      email: user.email,
    },
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return res;
}
