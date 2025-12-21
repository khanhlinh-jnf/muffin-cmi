// lib/auth.ts

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

// Mock user cố định
const demoUser: SessionUser = {
  id: "demo-user",
  email: "demo@example.com",
  fullName: "Demo User",
  role: "HOST",
};

// Login: kiểm tra email/password rất đơn giản
export async function validateUser(email: string, password: string) {
  if (email === demoUser.email && password === "123456") {
    return demoUser;
  }
  return null;
}

// Tạo "token" giả
export function signToken(user: SessionUser) {
  return `mock-token-for-${user.id}`;
}

// Đọc user từ token (mock)
export async function getUserFromToken(
  _token: string | undefined | null,
): Promise<SessionUser | null> {
  // Bỏ qua validate token, luôn trả demoUser nếu có token
  if (!_token) return null;
  return demoUser;
}

// Nếu chỗ khác cần requireUser / requireUserId
export async function requireUser(): Promise<SessionUser> {
  return demoUser;
}

export async function requireUserId(): Promise<string> {
  return demoUser.id;
}
