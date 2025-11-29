-- AlterTable
ALTER TABLE "annex_a_controls" ADD COLUMN "assessed_by" INTEGER;
ALTER TABLE "annex_a_controls" ADD COLUMN "assessment_date" DATETIME;
ALTER TABLE "annex_a_controls" ADD COLUMN "baseline_maturity" TEXT DEFAULT 'not-assessed';
ALTER TABLE "annex_a_controls" ADD COLUMN "baseline_notes" TEXT;

-- CreateTable
CREATE TABLE "declarations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "organization_name" TEXT NOT NULL,
    "scope_description" TEXT NOT NULL,
    "scope_exclusions" TEXT,
    "isms_policy" TEXT,
    "objectives_statement" TEXT,
    "leadership_commitment" TEXT,
    "created_by" INTEGER,
    "approved_by" INTEGER,
    "approval_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "declarations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "evidence_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'missing',
    "file_path" TEXT,
    "document_id" INTEGER,
    "notes" TEXT,
    "collected_by" INTEGER,
    "collected_date" DATETIME,
    "verified_by" INTEGER,
    "verified_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "evidence_items_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
