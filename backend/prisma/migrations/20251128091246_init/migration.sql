-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'auditor',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "documents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL DEFAULT 'PDF',
    "file_size" TEXT,
    "upload_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'raw',
    "uploaded_by" INTEGER,
    "summary_short" TEXT,
    "summary_detailed" TEXT,
    "summary_iso_compliance" TEXT,
    "read_percentage" REAL NOT NULL DEFAULT 0.0,
    "gap_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "annex_a_controls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rating" INTEGER NOT NULL DEFAULT 0,
    "explanation" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "control_suggested_actions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "control_id" TEXT NOT NULL,
    "action_text" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "control_suggested_actions_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "annex_a_controls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "annotations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "document_id" INTEGER NOT NULL,
    "paragraph_id" TEXT,
    "position_data" TEXT NOT NULL,
    "highlighted_text" TEXT NOT NULL,
    "annotation_text" TEXT,
    "color" TEXT NOT NULL DEFAULT '#ffeb3b',
    "created_by" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "annotations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "annotations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "annotation_controls" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "annotation_id" INTEGER NOT NULL,
    "control_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "annotation_controls_annotation_id_fkey" FOREIGN KEY ("annotation_id") REFERENCES "annotations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "annotation_controls_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "annex_a_controls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "gaps" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "document_id" INTEGER,
    "control_id" TEXT,
    "gap_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "gaps_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "gaps_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "annex_a_controls" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "respondents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "division" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "questions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_text" TEXT NOT NULL,
    "question_category" TEXT,
    "target_controls" TEXT,
    "created_by" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "respondent_id" INTEGER NOT NULL,
    "interview_date" DATETIME NOT NULL,
    "interviewer_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "ai_summary" TEXT,
    "ai_key_statements" TEXT,
    "ai_contradictions" TEXT,
    "ai_maturity_score" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "interviews_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "respondents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "interviews_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "interview_qa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "interview_id" INTEGER NOT NULL,
    "question_id" INTEGER,
    "question_text" TEXT NOT NULL,
    "answer_text" TEXT,
    "question_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interview_qa_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "interview_qa_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "interview_qa_controls" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "qa_id" INTEGER NOT NULL,
    "control_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interview_qa_controls_qa_id_fkey" FOREIGN KEY ("qa_id") REFERENCES "interview_qa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "interview_qa_controls_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "annex_a_controls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "soa_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "control_id" TEXT NOT NULL,
    "applicability" TEXT NOT NULL,
    "justification" TEXT,
    "implementation_status" TEXT,
    "responsible_party" TEXT,
    "target_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "soa_entries_control_id_fkey" FOREIGN KEY ("control_id") REFERENCES "annex_a_controls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "activity_type" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" INTEGER,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "documents_slug_key" ON "documents"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "annotation_controls_annotation_id_control_id_key" ON "annotation_controls"("annotation_id", "control_id");

-- CreateIndex
CREATE UNIQUE INDEX "interview_qa_controls_qa_id_control_id_key" ON "interview_qa_controls"("qa_id", "control_id");

-- CreateIndex
CREATE UNIQUE INDEX "soa_entries_control_id_key" ON "soa_entries"("control_id");
