import "dotenv/config";
import pg from "pg";
import { 
  DEFAULT_COURSES, 
  DEFAULT_USERS, 
  DEFAULT_SITE_SETTINGS, 
  DEFAULT_REVIEWS, 
  DEFAULT_ASSIGNMENTS, 
  DEFAULT_SUBMISSIONS, 
  DEFAULT_ANNOUNCEMENTS, 
  DEFAULT_LOGIN_ATTEMPTS, 
  DEFAULT_LECTURES,
  DEFAULT_STUDENT_PROGRESS,
  DEFAULT_STUDENT_FEES
} from "./db.js";

const { Pool } = pg;

export const DEFAULT_NEON_DATABASE_URL =
  "postgresql://neondb_owner:npg_s5GmlkHyQg3c@ep-old-sunset-b4j9fx8b-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require";

export async function runDatabaseMigrations(customConnectionString?: string): Promise<{ success: boolean; details: string }> {
  const connectionString =
    customConnectionString ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    DEFAULT_NEON_DATABASE_URL;

  console.log(`[Migration] Starting migration against database: ${connectionString.split("@")[1] || "connection target"}...`);

  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
  });

  const client = await pool.connect();

  try {
    console.log("[Migration] Connected successfully. Executing DDL table definitions...");

    await client.query("BEGIN");

    // 1. Table: courses
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Software Development',
        duration_weeks INTEGER NOT NULL DEFAULT 12,
        price_kes NUMERIC NOT NULL DEFAULT 0,
        monthly_kes NUMERIC NOT NULL DEFAULT 0,
        summary TEXT NOT NULL DEFAULT '',
        curriculum TEXT NOT NULL DEFAULT '[]',
        level VARCHAR(100) NOT NULL DEFAULT 'Beginner to Intermediate',
        delivery_mode VARCHAR(255) NOT NULL DEFAULT 'Online-First + Ngong Rd Campus Lab Access',
        schedule VARCHAR(255) NOT NULL DEFAULT 'Mon-Thu 7:00 PM - 9:30 PM EAT',
        next_intake VARCHAR(100) NOT NULL DEFAULT 'Upcoming Cohort',
        is_featured INTEGER DEFAULT 1,
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
    `);

    // Ensure all columns exist on courses if table was created by older schema
    const courseColumns = [
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug VARCHAR(255)",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Software Development'",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration_weeks INTEGER DEFAULT 12",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS price_kes NUMERIC DEFAULT 0",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS monthly_kes NUMERIC DEFAULT 0",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS summary TEXT DEFAULT ''",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS curriculum TEXT DEFAULT '[]'",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(100) DEFAULT 'Beginner to Intermediate'",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS delivery_mode VARCHAR(255) DEFAULT 'Online-First + Ngong Rd Campus Lab Access'",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS schedule VARCHAR(255) DEFAULT 'Mon-Thu 7:00 PM - 9:30 PM EAT'",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS next_intake VARCHAR(100) DEFAULT 'Upcoming Cohort'",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_featured INTEGER DEFAULT 1",
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at VARCHAR(100) DEFAULT CURRENT_TIMESTAMP::text"
    ];

    for (const sql of courseColumns) {
      await client.query(sql);
    }

    // 2. Table: programs (Direct replica / synonym table for programs catalog & analytics)
    await client.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255),
        category VARCHAR(100) NOT NULL DEFAULT 'Software Development',
        duration_weeks INTEGER NOT NULL DEFAULT 12,
        price_kes NUMERIC NOT NULL DEFAULT 0,
        monthly_kes NUMERIC NOT NULL DEFAULT 0,
        summary TEXT NOT NULL DEFAULT '',
        curriculum TEXT NOT NULL DEFAULT '[]',
        level VARCHAR(100) NOT NULL DEFAULT 'Beginner to Intermediate',
        delivery_mode VARCHAR(255) NOT NULL DEFAULT 'Online-First + Ngong Rd Campus Lab Access',
        schedule VARCHAR(255) NOT NULL DEFAULT 'Mon-Thu 7:00 PM - 9:30 PM EAT',
        next_intake VARCHAR(100) NOT NULL DEFAULT 'Upcoming Cohort',
        is_featured INTEGER DEFAULT 1,
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
    `);

    // 3. Table: course_modules (Normalized curriculum module units)
    await client.query(`
      CREATE TABLE IF NOT EXISTS course_modules (
        id VARCHAR(255) PRIMARY KEY,
        course_id VARCHAR(255) REFERENCES courses(id) ON DELETE CASCADE,
        module_number INTEGER DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        topics TEXT DEFAULT '[]',
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
    `);

    // 4. Table: modules (Alternative naming compatibility)
    await client.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id VARCHAR(255) PRIMARY KEY,
        course_id VARCHAR(255),
        module_number INTEGER DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        topics TEXT DEFAULT '[]',
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
    `);

    // 5. Table: tuition_fees (Tuition structure, installment breakdown & pricing tiers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS tuition_fees (
        id VARCHAR(255) PRIMARY KEY,
        course_id VARCHAR(255),
        course_title VARCHAR(255) NOT NULL,
        upfront_kes NUMERIC NOT NULL DEFAULT 0,
        monthly_installment_kes NUMERIC NOT NULL DEFAULT 0,
        installment_months INTEGER NOT NULL DEFAULT 5,
        currency VARCHAR(10) NOT NULL DEFAULT 'KES',
        discount_percent NUMERIC NOT NULL DEFAULT 10,
        notes TEXT DEFAULT '',
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
    `);

    // 6. Table: applications
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(255) PRIMARY KEY,
        tracking_code VARCHAR(100) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        course_id VARCHAR(255),
        course_title VARCHAR(255) NOT NULL,
        intake VARCHAR(100) NOT NULL,
        experience_level VARCHAR(255) NOT NULL,
        motivation TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at VARCHAR(100) NOT NULL
      );
    `);

    // 7. Table: users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        avatar TEXT,
        enrolled_course_id VARCHAR(255),
        enrolled_course_title VARCHAR(255),
        created_at VARCHAR(100) NOT NULL
      );
    `);

    // 8. Table: site_settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // 9. Table: messages
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(100) NOT NULL,
        subject VARCHAR(255),
        course_title VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at VARCHAR(100) NOT NULL
      );
    `);

    // 10. Table: reviews
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(255) PRIMARY KEY,
        rating INTEGER NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role_program VARCHAR(255) NOT NULL,
        organization VARCHAR(255) NOT NULL,
        testimonial TEXT NOT NULL,
        avatar_url TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        is_featured INTEGER DEFAULT 0,
        created_at VARCHAR(100) NOT NULL
      );
    `);

    // 11. Table: assignments
    await client.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        course_title VARCHAR(255) NOT NULL,
        cohort VARCHAR(100) NOT NULL DEFAULT 'Cohort 14',
        description TEXT,
        resource_url TEXT,
        sheets_url TEXT,
        due_date VARCHAR(100) NOT NULL,
        max_marks INTEGER DEFAULT 100,
        instructor_name VARCHAR(255),
        created_at VARCHAR(100) NOT NULL
      );
    `);

    // 12. Table: submissions
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(255) PRIMARY KEY,
        assignment_id VARCHAR(255) NOT NULL,
        assignment_title VARCHAR(255) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        student_email VARCHAR(255) NOT NULL,
        course_title VARCHAR(255) NOT NULL,
        submission_url TEXT NOT NULL,
        notes TEXT,
        marks INTEGER,
        feedback TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        submitted_at VARCHAR(100) NOT NULL,
        marked_at VARCHAR(100)
      );
    `);

    // 13. Table: certificates
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(255) PRIMARY KEY,
        verification_id VARCHAR(100) UNIQUE NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        student_email VARCHAR(255) NOT NULL,
        course_title VARCHAR(255) NOT NULL,
        cohort VARCHAR(100) NOT NULL,
        completion_date VARCHAR(100) NOT NULL,
        final_grade VARCHAR(50) NOT NULL DEFAULT 'Distinction',
        approved_by VARCHAR(255) NOT NULL DEFAULT 'Academic Board',
        approved_at VARCHAR(100) NOT NULL,
        qr_code_payload TEXT
      );
    `);

    // 14. Table: announcements
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Class Update',
        cohort VARCHAR(100) NOT NULL DEFAULT 'All Cohorts',
        course_title VARCHAR(255) NOT NULL DEFAULT 'All Programs',
        author_name VARCHAR(255) NOT NULL DEFAULT 'Faculty Lead',
        author_role VARCHAR(100) NOT NULL DEFAULT 'Lead Instructor',
        is_pinned INTEGER DEFAULT 0,
        priority VARCHAR(50) NOT NULL DEFAULT 'Normal',
        action_url TEXT,
        action_label VARCHAR(100),
        created_at VARCHAR(100) NOT NULL
      );
    `);

    // 15. Table: login_attempts
    await client.query(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        requested_role VARCHAR(50) NOT NULL DEFAULT 'student',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        assigned_role VARCHAR(50),
        full_name VARCHAR(255),
        attempt_count INTEGER DEFAULT 1,
        last_attempt_at VARCHAR(100) NOT NULL,
        reviewed_at VARCHAR(100),
        reviewed_by VARCHAR(255),
        notes TEXT,
        initial_password VARCHAR(255),
        setup_token VARCHAR(255),
        created_at VARCHAR(100) NOT NULL
      );
    `);

    // 16. Table: class_lectures
    await client.query(`
      CREATE TABLE IF NOT EXISTS class_lectures (
        id VARCHAR(255) PRIMARY KEY,
        instructor_email VARCHAR(255) NOT NULL,
        instructor_name VARCHAR(255) NOT NULL,
        course_id VARCHAR(100) NOT NULL,
        course_title VARCHAR(255) NOT NULL,
        cohort VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        day_of_week VARCHAR(50) NOT NULL,
        start_time VARCHAR(50) NOT NULL,
        end_time VARCHAR(50) NOT NULL,
        recurrence VARCHAR(50) NOT NULL DEFAULT 'Weekly',
        location_type VARCHAR(100) NOT NULL DEFAULT 'Online Google Meet',
        meeting_link TEXT,
        date VARCHAR(50),
        created_at VARCHAR(100) NOT NULL
      );
    `);

    // Seed default courses if empty
    const courseCountRes = await client.query("SELECT count(*) as count FROM courses");
    const courseCount = Number(courseCountRes.rows[0]?.count || 0);
    if (courseCount === 0) {
      console.log("[Migration] Seeding default flagship courses in PostgreSQL...");
      for (const c of DEFAULT_COURSES) {
        await client.query(
          `INSERT INTO courses (id, title, slug, category, duration_weeks, price_kes, monthly_kes, summary, curriculum, level, delivery_mode, schedule, next_intake, is_featured, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [c.id, c.title, c.slug, c.category, c.duration_weeks, c.price_kes, c.monthly_kes, c.summary, c.curriculum, c.level, c.delivery_mode, c.schedule, c.next_intake, c.is_featured, c.created_at]
        );
      }
    }

    // Synchronize programs table from courses
    await client.query(`
      INSERT INTO programs (id, title, slug, category, duration_weeks, price_kes, monthly_kes, summary, curriculum, level, delivery_mode, schedule, next_intake, is_featured, created_at)
      SELECT id, title, slug, category, duration_weeks, price_kes, monthly_kes, summary, curriculum, level, delivery_mode, schedule, next_intake, is_featured, created_at
      FROM courses
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        duration_weeks = EXCLUDED.duration_weeks,
        price_kes = EXCLUDED.price_kes,
        monthly_kes = EXCLUDED.monthly_kes,
        summary = EXCLUDED.summary,
        curriculum = EXCLUDED.curriculum,
        level = EXCLUDED.level,
        delivery_mode = EXCLUDED.delivery_mode,
        schedule = EXCLUDED.schedule,
        next_intake = EXCLUDED.next_intake,
        is_featured = EXCLUDED.is_featured;
    `);

    // Synchronize course_modules and modules from courses curriculum JSON
    const coursesRows = await client.query("SELECT id, curriculum FROM courses");
    for (const crs of coursesRows.rows) {
      try {
        const modules = typeof crs.curriculum === "string" ? JSON.parse(crs.curriculum) : crs.curriculum;
        if (Array.isArray(modules)) {
          for (let i = 0; i < modules.length; i++) {
            const m = modules[i];
            const modId = `${crs.id}-mod-${i + 1}`;
            const modTitle = m.title || m.module || `Module ${i + 1}`;
            const modTopics = JSON.stringify(Array.isArray(m.topics) ? m.topics : []);
            await client.query(`
              INSERT INTO course_modules (id, course_id, module_number, title, topics, created_at)
              VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP::text)
              ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, topics = EXCLUDED.topics;
            `, [modId, crs.id, i + 1, modTitle, modTopics]);

            await client.query(`
              INSERT INTO modules (id, course_id, module_number, title, topics, created_at)
              VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP::text)
              ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, topics = EXCLUDED.topics;
            `, [modId, crs.id, i + 1, modTitle, modTopics]);
          }
        }
      } catch (err) {
        console.warn(`[Migration] Warning parsing curriculum for ${crs.id}:`, err);
      }
    }

    // Synchronize tuition_fees from courses
    const allCoursesForTuition = await client.query("SELECT id, title, price_kes, monthly_kes, duration_weeks FROM courses");
    for (const c of allCoursesForTuition.rows) {
      const feeId = `fee-${c.id}`;
      const upfront = Number(c.price_kes) || 0;
      const monthly = Number(c.monthly_kes) || Math.round(upfront / 5);
      await client.query(`
        INSERT INTO tuition_fees (id, course_id, course_title, upfront_kes, monthly_installment_kes, installment_months, currency, discount_percent, notes, created_at)
        VALUES ($1, $2, $3, $4, $5, 5, 'KES', 10, 'Full tuition and installment options', CURRENT_TIMESTAMP::text)
        ON CONFLICT (id) DO UPDATE SET
          course_title = EXCLUDED.course_title,
          upfront_kes = EXCLUDED.upfront_kes,
          monthly_installment_kes = EXCLUDED.monthly_installment_kes;
      `, [feeId, c.id, c.title, upfront, monthly]);
    }

    // Seed default admin and accounts if users table is empty
    const userCountRes = await client.query("SELECT count(*) as count FROM users");
    const userCount = Number(userCountRes.rows[0]?.count || 0);
    if (userCount === 0) {
      console.log("[Migration] Seeding default users in PostgreSQL...");
      for (const u of DEFAULT_USERS) {
        await client.query(
          `INSERT INTO users (id, name, email, password, role, avatar, enrolled_course_id, enrolled_course_title, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [u.id, u.name, u.email, u.password, u.role, u.avatar, u.enrolled_course_id, u.enrolled_course_title, u.created_at]
        );
      }
    }

    // Seed default site settings if empty
    const settingsCountRes = await client.query("SELECT count(*) as count FROM site_settings");
    const settingsCount = Number(settingsCountRes.rows[0]?.count || 0);
    if (settingsCount === 0) {
      console.log("[Migration] Seeding default site settings in PostgreSQL...");
      for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
        await client.query(
          `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
          [key, value]
        );
      }
    }

    // Seed default reviews if empty
    const reviewsCountRes = await client.query("SELECT count(*) as count FROM reviews");
    const reviewsCount = Number(reviewsCountRes.rows[0]?.count || 0);
    if (reviewsCount === 0) {
      console.log("[Migration] Seeding initial approved reviews in PostgreSQL...");
      for (const r of DEFAULT_REVIEWS) {
        await client.query(
          `INSERT INTO reviews (id, rating, full_name, role_program, organization, testimonial, avatar_url, status, is_featured, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [r.id, r.rating, r.full_name, r.role_program, r.organization, r.testimonial, r.avatar_url, r.status, r.is_featured, r.created_at]
        );
      }
    }

    // Seed default assignments if empty
    const asgCountRes = await client.query("SELECT count(*) as count FROM assignments");
    const asgCount = Number(asgCountRes.rows[0]?.count || 0);
    if (asgCount === 0) {
      console.log("[Migration] Seeding initial assignments in PostgreSQL...");
      for (const a of DEFAULT_ASSIGNMENTS) {
        await client.query(
          `INSERT INTO assignments (id, title, course_title, cohort, description, resource_url, sheets_url, due_date, max_marks, instructor_name, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.title, a.course_title, a.cohort, a.description, a.resource_url, a.sheets_url, a.due_date, a.max_marks, a.instructor_name, a.created_at]
        );
      }
    }

    // Seed default submissions if empty
    const subCountRes = await client.query("SELECT count(*) as count FROM submissions");
    const subCount = Number(subCountRes.rows[0]?.count || 0);
    if (subCount === 0) {
      console.log("[Migration] Seeding initial assignment submissions in PostgreSQL...");
      for (const s of DEFAULT_SUBMISSIONS) {
        await client.query(
          `INSERT INTO submissions (id, assignment_id, assignment_title, student_name, student_email, course_title, submission_url, notes, marks, feedback, status, submitted_at, marked_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [s.id, s.assignment_id, s.assignment_title, s.student_name, s.student_email, s.course_title, s.submission_url, s.notes, s.marks, s.feedback, s.status, s.submitted_at, s.marked_at]
        );
      }
    }

    // Seed default announcements if empty
    const annCountRes = await client.query("SELECT count(*) as count FROM announcements");
    const annCount = Number(annCountRes.rows[0]?.count || 0);
    if (annCount === 0) {
      console.log("[Migration] Seeding initial announcements in PostgreSQL...");
      for (const a of DEFAULT_ANNOUNCEMENTS) {
        await client.query(
          `INSERT INTO announcements (id, title, content, category, cohort, course_title, author_name, author_role, is_pinned, priority, action_url, action_label, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.title, a.content, a.category, a.cohort, a.course_title, a.author_name, a.author_role, a.is_pinned, a.priority, a.action_url, a.action_label, a.created_at]
        );
      }
    }

    // Seed default login attempts if empty
    const attCountRes = await client.query("SELECT count(*) as count FROM login_attempts");
    const attCount = Number(attCountRes.rows[0]?.count || 0);
    if (attCount === 0) {
      console.log("[Migration] Seeding initial login attempts in PostgreSQL...");
      for (const a of DEFAULT_LOGIN_ATTEMPTS) {
        await client.query(
          `INSERT INTO login_attempts (id, email, requested_role, status, assigned_role, full_name, attempt_count, last_attempt_at, reviewed_at, reviewed_by, notes, initial_password, setup_token, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.email, a.requested_role, a.status, a.assigned_role, a.full_name, a.attempt_count, a.last_attempt_at, a.reviewed_at, a.reviewed_by, a.notes, a.initial_password, a.setup_token, a.created_at]
        );
      }
    }

    // Seed default class lectures if empty
    const lecCountRes = await client.query("SELECT count(*) as count FROM class_lectures");
    const lecCount = Number(lecCountRes.rows[0]?.count || 0);
    if (lecCount === 0) {
      console.log("[Migration] Seeding initial class lectures in PostgreSQL...");
      for (const l of DEFAULT_LECTURES) {
        await client.query(
          `INSERT INTO class_lectures (id, instructor_email, instructor_name, course_id, course_title, cohort, title, description, day_of_week, start_time, end_time, recurrence, location_type, meeting_link, date, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (id) DO NOTHING`,
          [l.id, l.instructor_email, l.instructor_name, l.course_id, l.course_title, l.cohort, l.title, l.description, l.day_of_week, l.start_time, l.end_time, l.recurrence, l.location_type, l.meeting_link, l.date, l.created_at]
        );
      }
    }

    // 17. Table: student_module_progress
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_module_progress (
        id VARCHAR(255) PRIMARY KEY,
        student_email VARCHAR(255) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        course_id VARCHAR(255) NOT NULL,
        course_title VARCHAR(255) NOT NULL,
        module_id VARCHAR(255) NOT NULL,
        module_title VARCHAR(255) NOT NULL,
        module_number INTEGER DEFAULT 1,
        status VARCHAR(50) NOT NULL DEFAULT 'not_started',
        student_notes TEXT DEFAULT '',
        student_submission_url TEXT DEFAULT '',
        teacher_email VARCHAR(255),
        teacher_name VARCHAR(255),
        teacher_feedback TEXT DEFAULT '',
        requested_at VARCHAR(100),
        reviewed_at VARCHAR(100),
        completed_at VARCHAR(100),
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
      CREATE INDEX IF NOT EXISTS idx_smp_student ON student_module_progress(student_email, course_id);
      CREATE INDEX IF NOT EXISTS idx_smp_status ON student_module_progress(status);
    `);

    // Seed default student module progress if empty
    const progCountRes = await client.query("SELECT count(*) as count FROM student_module_progress");
    const progCount = Number(progCountRes.rows[0]?.count || 0);
    if (progCount === 0) {
      console.log("[Migration] Seeding initial student module progress in PostgreSQL...");
      for (const p of DEFAULT_STUDENT_PROGRESS) {
        await client.query(
          `INSERT INTO student_module_progress (id, student_email, student_name, course_id, course_title, module_id, module_title, module_number, status, student_notes, student_submission_url, teacher_email, teacher_name, teacher_feedback, requested_at, reviewed_at, completed_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.student_email, p.student_name, p.course_id, p.course_title, p.module_id, p.module_title, p.module_number, p.status, p.student_notes, p.student_submission_url, p.teacher_email, p.teacher_name, p.teacher_feedback, p.requested_at, p.reviewed_at, p.completed_at, p.created_at]
        );
      }
    }

    // 18. Table: student_fee_accounts
    await client.query(`
      CREATE TABLE IF NOT EXISTS student_fee_accounts (
        id VARCHAR(255) PRIMARY KEY,
        student_email VARCHAR(255) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        course_id VARCHAR(255) NOT NULL,
        course_title VARCHAR(255) NOT NULL,
        cohort VARCHAR(100) NOT NULL DEFAULT 'Current Cohort',
        total_fee_kes NUMERIC NOT NULL DEFAULT 85000,
        paid_fee_kes NUMERIC NOT NULL DEFAULT 0,
        balance_kes NUMERIC NOT NULL DEFAULT 85000,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        deadline_date VARCHAR(100) NOT NULL DEFAULT '',
        portal_access_granted INTEGER NOT NULL DEFAULT 1,
        installment_plan VARCHAR(255) DEFAULT '5-Month Flexible Installments',
        notes TEXT DEFAULT '',
        updated_at VARCHAR(100),
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
      CREATE INDEX IF NOT EXISTS idx_sfa_email ON student_fee_accounts(student_email);
      CREATE INDEX IF NOT EXISTS idx_sfa_status ON student_fee_accounts(payment_status);
    `);

    // Seed default student fee accounts if empty
    const feeCountRes = await client.query("SELECT count(*) as count FROM student_fee_accounts");
    const feeCount = Number(feeCountRes.rows[0]?.count || 0);
    if (feeCount === 0) {
      console.log("[Migration] Seeding initial student fee accounts in PostgreSQL...");
      for (const f of DEFAULT_STUDENT_FEES) {
        await client.query(
          `INSERT INTO student_fee_accounts (id, student_email, student_name, course_id, course_title, cohort, total_fee_kes, paid_fee_kes, balance_kes, payment_status, deadline_date, portal_access_granted, installment_plan, notes, updated_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (id) DO NOTHING`,
          [f.id, f.student_email, f.student_name, f.course_id, f.course_title, f.cohort, f.total_fee_kes, f.paid_fee_kes, f.balance_kes, f.payment_status, f.deadline_date, f.portal_access_granted, f.installment_plan, f.notes, f.updated_at, f.created_at]
        );
      }
    }

    await client.query("COMMIT");

    console.log("[Migration] Database migration completed successfully!");
    return {
      success: true,
      details: "All tables, columns, modules, tuition fees, and indexes successfully migrated."
    };
  } catch (err: any) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("[Migration] Migration transaction failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Direct command-line execution support
const isDirectRun = process.argv[1]?.endsWith("migrate.ts") || process.argv[1]?.endsWith("migrate.js");
if (isDirectRun) {
  runDatabaseMigrations()
    .then((res) => {
      console.log("[Migration Script CLI] Success:", res.details);
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Migration Script CLI] Error:", err);
      process.exit(1);
    });
}
