-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "announcements" (
    "id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(100) NOT NULL DEFAULT 'Class Update',
    "cohort" VARCHAR(100) NOT NULL DEFAULT 'All Cohorts',
    "course_title" VARCHAR(255) NOT NULL DEFAULT 'All Programs',
    "author_name" VARCHAR(255) NOT NULL DEFAULT 'Faculty Lead',
    "author_role" VARCHAR(100) NOT NULL DEFAULT 'Lead Instructor',
    "is_pinned" INTEGER DEFAULT 0,
    "priority" VARCHAR(50) NOT NULL DEFAULT 'Normal',
    "action_url" TEXT,
    "action_label" VARCHAR(100),
    "created_at" VARCHAR(100) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" VARCHAR(255) NOT NULL,
    "tracking_code" VARCHAR(100) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(100) NOT NULL,
    "course_id" VARCHAR(255),
    "course_title" VARCHAR(255) NOT NULL,
    "intake" VARCHAR(100) NOT NULL,
    "experience_level" VARCHAR(255) NOT NULL,
    "motivation" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" VARCHAR(100) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "course_title" VARCHAR(255) NOT NULL,
    "cohort" VARCHAR(100) NOT NULL DEFAULT 'Cohort 14',
    "description" TEXT,
    "resource_url" TEXT,
    "sheets_url" TEXT,
    "due_date" VARCHAR(100) NOT NULL,
    "max_marks" INTEGER DEFAULT 100,
    "instructor_name" VARCHAR(255),
    "created_at" VARCHAR(100) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" VARCHAR(255) NOT NULL,
    "verification_id" VARCHAR(100) NOT NULL,
    "student_name" VARCHAR(255) NOT NULL,
    "student_email" VARCHAR(255) NOT NULL,
    "course_title" VARCHAR(255) NOT NULL,
    "cohort" VARCHAR(100) NOT NULL,
    "completion_date" VARCHAR(100) NOT NULL,
    "final_grade" VARCHAR(50) NOT NULL DEFAULT 'Distinction',
    "approved_by" VARCHAR(255) NOT NULL DEFAULT 'Academic Board',
    "approved_at" VARCHAR(100) NOT NULL,
    "qr_code_payload" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_lectures" (
    "id" VARCHAR(255) NOT NULL,
    "instructor_email" VARCHAR(255) NOT NULL,
    "instructor_name" VARCHAR(255) NOT NULL,
    "course_id" VARCHAR(100) NOT NULL,
    "course_title" VARCHAR(255) NOT NULL,
    "cohort" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "day_of_week" VARCHAR(50) NOT NULL,
    "start_time" VARCHAR(50) NOT NULL,
    "end_time" VARCHAR(50) NOT NULL,
    "recurrence" VARCHAR(50) NOT NULL DEFAULT 'Weekly',
    "location_type" VARCHAR(100) NOT NULL DEFAULT 'Online Google Meet',
    "meeting_link" TEXT,
    "date" VARCHAR(50),
    "created_at" VARCHAR(100) NOT NULL,

    CONSTRAINT "class_lectures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_modules" (
    "id" VARCHAR(255) NOT NULL,
    "course_id" VARCHAR(255),
    "module_number" INTEGER DEFAULT 1,
    "title" VARCHAR(255) NOT NULL,
    "topics" TEXT DEFAULT '[]',
    "created_at" VARCHAR(100) NOT NULL DEFAULT (CURRENT_TIMESTAMP)::text,

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "duration_weeks" INTEGER NOT NULL DEFAULT 12,
    "price_kes" DECIMAL NOT NULL DEFAULT 0,
    "monthly_kes" DECIMAL NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL DEFAULT '',
    "curriculum" TEXT NOT NULL DEFAULT '[]',
    "level" VARCHAR(100) NOT NULL DEFAULT 'Beginner to Intermediate',
    "delivery_mode" VARCHAR(255) NOT NULL DEFAULT 'Online-First + Ngong Rd Campus Lab Access',
    "schedule" VARCHAR(255) NOT NULL DEFAULT 'Mon-Thu 7:00 PM - 9:30 PM EAT',
    "next_intake" VARCHAR(100) NOT NULL DEFAULT 'Upcoming Cohort',
    "is_featured" INTEGER DEFAULT 1,
    "created_at" VARCHAR(100) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "requested_role" VARCHAR(50) NOT NULL DEFAULT 'student',
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "assigned_role" VARCHAR(50),
    "full_name" VARCHAR(255),
    "attempt_count" INTEGER DEFAULT 1,
    "last_attempt_at" VARCHAR(100) NOT NULL,
    "reviewed_at" VARCHAR(100),
    "reviewed_by" VARCHAR(255),
    "notes" TEXT,
    "initial_password" VARCHAR(255),
    "setup_token" VARCHAR(255),
    "created_at" VARCHAR(100) NOT NULL,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(255),
    "course_title" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" VARCHAR(100) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" VARCHAR(255) NOT NULL,
    "course_id" VARCHAR(255),
    "module_number" INTEGER DEFAULT 1,
    "title" VARCHAR(255) NOT NULL,
    "topics" TEXT DEFAULT '[]',
    "created_at" VARCHAR(100) NOT NULL DEFAULT (CURRENT_TIMESTAMP)::text,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "category" VARCHAR(100) NOT NULL DEFAULT 'Software Development',
    "duration_weeks" INTEGER NOT NULL DEFAULT 12,
    "price_kes" DECIMAL NOT NULL DEFAULT 0,
    "monthly_kes" DECIMAL NOT NULL DEFAULT 0,
    "summary" TEXT NOT NULL DEFAULT '',
    "curriculum" TEXT NOT NULL DEFAULT '[]',
    "level" VARCHAR(100) NOT NULL DEFAULT 'Beginner to Intermediate',
    "delivery_mode" VARCHAR(255) NOT NULL DEFAULT 'Online-First + Ngong Rd Campus Lab Access',
    "schedule" VARCHAR(255) NOT NULL DEFAULT 'Mon-Thu 7:00 PM - 9:30 PM EAT',
    "next_intake" VARCHAR(100) NOT NULL DEFAULT 'Upcoming Cohort',
    "is_featured" INTEGER DEFAULT 1,
    "created_at" VARCHAR(100) NOT NULL DEFAULT (CURRENT_TIMESTAMP)::text,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" VARCHAR(255) NOT NULL,
    "rating" INTEGER NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "role_program" VARCHAR(255) NOT NULL,
    "organization" VARCHAR(255) NOT NULL,
    "testimonial" TEXT NOT NULL,
    "avatar_url" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "is_featured" INTEGER DEFAULT 0,
    "created_at" VARCHAR(100) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" VARCHAR(255) NOT NULL,
    "assignment_id" VARCHAR(255) NOT NULL,
    "assignment_title" VARCHAR(255) NOT NULL,
    "student_name" VARCHAR(255) NOT NULL,
    "student_email" VARCHAR(255) NOT NULL,
    "course_title" VARCHAR(255) NOT NULL,
    "submission_url" TEXT NOT NULL,
    "notes" TEXT,
    "marks" INTEGER,
    "feedback" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "submitted_at" VARCHAR(100) NOT NULL,
    "marked_at" VARCHAR(100),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tuition_fees" (
    "id" VARCHAR(255) NOT NULL,
    "course_id" VARCHAR(255),
    "course_title" VARCHAR(255) NOT NULL,
    "upfront_kes" DECIMAL NOT NULL DEFAULT 0,
    "monthly_installment_kes" DECIMAL NOT NULL DEFAULT 0,
    "installment_months" INTEGER NOT NULL DEFAULT 5,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'KES',
    "discount_percent" DECIMAL NOT NULL DEFAULT 10,
    "notes" TEXT DEFAULT '',
    "created_at" VARCHAR(100) NOT NULL DEFAULT (CURRENT_TIMESTAMP)::text,

    CONSTRAINT "tuition_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "avatar" TEXT,
    "enrolled_course_id" VARCHAR(255),
    "enrolled_course_title" VARCHAR(255),
    "created_at" VARCHAR(100) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_tracking_code_key" ON "applications"("tracking_code");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verification_id_key" ON "certificates"("verification_id");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

