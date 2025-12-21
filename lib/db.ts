// lib/db.ts

// Mock prisma để build / deploy trên Vercel.
// Khi cần dùng DB thật, tạo file khác (vd: db-real.ts) cho môi trường local.

export const prisma = {
  meeting: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data: any) => ({ id: "mock-meeting", ...data }),
    update: async (_args: any) => null,
  },
  // Thêm model mock khác nếu code có dùng:
  meetingParticipant: {
    findMany: async () => [],
  },
  transcriptChunk: {
    findMany: async () => [],
  },
} as any;
