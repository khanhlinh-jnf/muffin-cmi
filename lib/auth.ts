// lib/auth.ts

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  // Mock: luôn trả 1 user cố định
  return {
    id: "demo-user",
    email: "demo@example.com",
    name: "Demo User",
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated (mock auth).");
  }
  return user;
}
