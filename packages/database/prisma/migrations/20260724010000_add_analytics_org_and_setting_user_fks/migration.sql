-- AlterTable: Integrity FKs for AnalyticsEvent.organizationId and Setting.userId
-- Preserves existing architecture; no feature changes.

-- CreateIndex
CREATE INDEX "Setting_userId_key_idx" ON "Setting"("userId", "key");

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
