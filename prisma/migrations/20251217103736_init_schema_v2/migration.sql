-- AlterTable
ALTER TABLE "MeetingParticipant" ADD COLUMN "source" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "faceExternalId" TEXT;

-- CreateTable
CREATE TABLE "FaceProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FaceProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmotionPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "timeSec" REAL NOT NULL,
    "score" REAL NOT NULL,
    "label" TEXT NOT NULL,
    CONSTRAINT "EmotionPoint_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TranscriptEmbedding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "chunkId" TEXT NOT NULL,
    "vector" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TranscriptEmbedding_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TranscriptEmbedding_chunkId_fkey" FOREIGN KEY ("chunkId") REFERENCES "TranscriptChunk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FaceProfile_userId_idx" ON "FaceProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FaceProfile_provider_externalId_key" ON "FaceProfile"("provider", "externalId");

-- CreateIndex
CREATE INDEX "EmotionPoint_meetingId_idx" ON "EmotionPoint"("meetingId");

-- CreateIndex
CREATE INDEX "EmotionPoint_timeSec_idx" ON "EmotionPoint"("timeSec");

-- CreateIndex
CREATE INDEX "TranscriptEmbedding_meetingId_idx" ON "TranscriptEmbedding"("meetingId");

-- CreateIndex
CREATE INDEX "TranscriptEmbedding_chunkId_idx" ON "TranscriptEmbedding"("chunkId");

-- CreateIndex
CREATE INDEX "ActionItem_meetingId_idx" ON "ActionItem"("meetingId");

-- CreateIndex
CREATE INDEX "ActionItem_assigneeId_idx" ON "ActionItem"("assigneeId");

-- CreateIndex
CREATE INDEX "ActionItem_status_idx" ON "ActionItem"("status");

-- CreateIndex
CREATE INDEX "Chapter_meetingId_idx" ON "Chapter"("meetingId");

-- CreateIndex
CREATE INDEX "Chapter_orderIndex_idx" ON "Chapter"("orderIndex");

-- CreateIndex
CREATE INDEX "Decision_meetingId_idx" ON "Decision"("meetingId");

-- CreateIndex
CREATE INDEX "MeetingParticipant_meetingId_idx" ON "MeetingParticipant"("meetingId");

-- CreateIndex
CREATE INDEX "MeetingParticipant_userId_idx" ON "MeetingParticipant"("userId");

-- CreateIndex
CREATE INDEX "QaLog_meetingId_idx" ON "QaLog"("meetingId");

-- CreateIndex
CREATE INDEX "QaLog_userId_idx" ON "QaLog"("userId");

-- CreateIndex
CREATE INDEX "QaLog_createdAt_idx" ON "QaLog"("createdAt");

-- CreateIndex
CREATE INDEX "QaSource_qaLogId_idx" ON "QaSource"("qaLogId");

-- CreateIndex
CREATE INDEX "QaSource_meetingId_idx" ON "QaSource"("meetingId");

-- CreateIndex
CREATE INDEX "QaSource_chunkId_idx" ON "QaSource"("chunkId");

-- CreateIndex
CREATE INDEX "TranscriptChunk_meetingId_idx" ON "TranscriptChunk"("meetingId");

-- CreateIndex
CREATE INDEX "TranscriptChunk_startTime_idx" ON "TranscriptChunk"("startTime");
