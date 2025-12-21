import crypto from 'crypto'

export type EmbeddingVector = number[]

// Fake embedding cho MVP (hash text) – sau đổi sang VNPT / OpenAI propre
export function embedText(text: string): EmbeddingVector {
  const hash = crypto.createHash('sha256').update(text).digest()
  // lấy 64 số đầu, normalize về [0,1]
  return Array.from(hash.slice(0, 64)).map((b) => b / 255)
}

export function cosineSimilarity(a: EmbeddingVector, b: EmbeddingVector): number {
  const dot = a.reduce((sum, v, i) => sum + v * (b[i] ?? 0), 0)
  const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0))
  const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0))
  if (!normA || !normB) return 0
  return dot / (normA * normB)
}
