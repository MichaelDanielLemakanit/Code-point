-- CreateTable
CREATE TABLE IF NOT EXISTS "student_module_progress" (
    "id" VARCHAR(255) NOT NULL,
    "student_email" VARCHAR(255) NOT NULL,
    "student_name" VARCHAR(255) NOT NULL,
    "course_id" VARCHAR(255) NOT NULL,
    "course_title" VARCHAR(255) NOT NULL,
    "module_id" VARCHAR(255) NOT NULL,
    "module_title" VARCHAR(255) NOT NULL,
    "module_number" INTEGER DEFAULT 1,
    "status" VARCHAR(50) NOT NULL DEFAULT 'not_started',
    "student_notes" TEXT DEFAULT '',
    "student_submission_url" TEXT DEFAULT '',
    "teacher_email" VARCHAR(255),
    "teacher_name" VARCHAR(255),
    "teacher_feedback" TEXT,
    "requested_at" VARCHAR(100),
    "reviewed_at" VARCHAR(100),
    "completed_at" VARCHAR(100),
    "created_at" VARCHAR(100) NOT NULL DEFAULT (CURRENT_TIMESTAMP)::text,

    CONSTRAINT "student_module_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_smp_student" ON "student_module_progress"("student_email", "course_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_smp_status" ON "student_module_progress"("status");
