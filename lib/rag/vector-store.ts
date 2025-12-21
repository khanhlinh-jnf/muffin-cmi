import { prisma } from '@/lib/prisma'
import { EmbeddingVector, embedText, cosineSimilarity } from './embeddings'

export async function searchSimilarChunks(
  question: string,
  opts: { meetingId?: string; limit?: number } = {},
) {
  const { meetingId, limit = 5 } = opts

  const qVec = embedText(question)

  const where: any = {}
  if (meetingId) where.meetingId = meetingId

  const rows = await prisma.transcriptEmbedding.findMany({
    where,
    include: {
      chunk: true,
      meeting: true,
    },
  })

  const scored = rows.map((row) => {
    const vec = JSON.parse(row.vector) as EmbeddingVector
    const score = cosineSimilarity(qVec, vec)
    return { row, score }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ row, score }) => ({
    meetingId: row.meetingId,
    chunkId: row.chunkId,
    score,
    text: row.chunk.text,
    startTime: row.chunk.startTime,
    endTime: row.chunk.endTime,
  }))
}
