-- AlterTable: Add implementation_method column to soa_entries
ALTER TABLE "soa_entries" ADD COLUMN "implementation_method" TEXT;

-- RedefineTables: Update implementation_status values
-- not-started → not-implemented
-- verified → implemented
-- implemented → partially-implemented
-- planned → planned (unchanged)
UPDATE "soa_entries" SET "implementation_status" = CASE
  WHEN "implementation_status" = 'not-started' THEN 'not-implemented'
  WHEN "implementation_status" = 'verified' THEN 'implemented'
  WHEN "implementation_status" = 'implemented' THEN 'partially-implemented'
  WHEN "implementation_status" = 'planned' THEN 'planned'
  ELSE "implementation_status"
END;
