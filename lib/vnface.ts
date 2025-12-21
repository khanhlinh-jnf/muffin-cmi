const VNFACE_ENDPOINT = process.env.VNFACE_ENDPOINT!
const VNFACE_API_KEY = process.env.VNFACE_API_KEY!

export type VnFaceMatchResult =
  | { success: true; userExternalId: string; score: number }
  | { success: false }

export async function vnFaceVerify(imageBase64: string): Promise<VnFaceMatchResult> {
  // Tùy theo doc BTC: có thể là JSON hoặc multipart.
  // Ví dụ đơn giản JSON:
  const res = await fetch(VNFACE_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': VNFACE_API_KEY,
    },
    body: JSON.stringify({
      image: imageBase64,
      // thêm group_id / org_id nếu cần
    }),
  })

  if (!res.ok) {
    console.error('vnFace error', await res.text())
    return { success: false }
  }

  const data = await res.json() as any

  // Map theo response thật của vnFace:
  // ví dụ: { matched: true, external_id: 'user-host', score: 0.93 }
  if (!data.matched) return { success: false }

  return {
    success: true,
    userExternalId: data.external_id,
    score: data.score,
  }
}

