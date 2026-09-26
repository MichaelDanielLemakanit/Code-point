import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import pg from "pg";

const { Pool } = pg;

const currentDirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();

export interface AppDatabase {
  type: "postgres" | "sqlite" | "memory";
  providerName: string;
  activeConnectionUrl?: string;
  run(sql: string, params?: any[]): Promise<any>;
  exec(sql: string): Promise<any>;
  queryAll<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  rawPostgresPool?: pg.Pool | null;
  rawSqliteDb?: any;
}

export const DEFAULT_NEON_DATABASE_URL =
  process.env.DATABASE_URL || "";

/**
 * Returns prioritized candidate PostgreSQL connection strings.
 * Remote cloud databases are prioritized before local 127.0.0.1/localhost databases
 * so containers without local PostgreSQL daemons seamlessly connect to production.
 */
export function getCandidatePostgresUrls(customUrl?: string): string[] {
  const result: string[] = [];

  const add = (u: string | undefined | null) => {
    if (!u) return;
    const trimmed = u.trim();
    if (trimmed && !result.includes(trimmed)) {
      result.push(trimmed);
    }
  };

  if (customUrl) add(customUrl);

  const rawEnvUrls = [
    process.env.SUPABASE_DATABASE_URL,
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    DEFAULT_NEON_DATABASE_URL
  ];

  // Prioritize remote cloud databases over local 127.0.0.1/localhost databases
  const remote = rawEnvUrls.filter(
    (u): u is string => Boolean(u && !u.includes("localhost") && !u.includes("127.0.0.1"))
  );
  const local = rawEnvUrls.filter(
    (u): u is string => Boolean(u && (u.includes("localhost") || u.includes("127.0.0.1")))
  );

  for (const r of remote) add(r);
  for (const l of local) add(l);

  return result;
}

let dbInstance: AppDatabase | null = null;
let initPromise: Promise<AppDatabase> | null = null;

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DB_DIR = isServerless ? "/tmp" : process.cwd();
const DB_FILE = path.join(DB_DIR, "codepoint.sqlite");

/**
 * SQL dialect translation for PostgreSQL compatibility
 */
export function convertSqlForPostgres(sql: string): string {
  let paramIndex = 1;
  // Convert ? to $1, $2, etc.
  let converted = sql.replace(/\?/g, () => `$${paramIndex++}`);

  // SQLite 'INSERT OR REPLACE INTO site_settings (key, value) VALUES ($1, $2)'
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+site_settings/i.test(converted)) {
    converted = converted.replace(
      /INSERT\s+OR\s+REPLACE\s+INTO\s+site_settings/i,
      "INSERT INTO site_settings"
    ) + " ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value";
  }

  // SQLite 'INSERT OR REPLACE INTO users (...) VALUES (...)'
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+users/i.test(converted)) {
    converted = converted.replace(
      /INSERT\s+OR\s+REPLACE\s+INTO\s+users/i,
      "INSERT INTO users"
    ) + " ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, password = EXCLUDED.password, role = EXCLUDED.role, avatar = EXCLUDED.avatar";
  }

  // SQLite 'INSERT OR REPLACE INTO courses (...) VALUES (...)'
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+courses/i.test(converted)) {
    converted = converted.replace(
      /INSERT\s+OR\s+REPLACE\s+INTO\s+courses/i,
      "INSERT INTO courses"
    ) + " ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, slug = EXCLUDED.slug, category = EXCLUDED.category, duration_weeks = EXCLUDED.duration_weeks, price_kes = EXCLUDED.price_kes, monthly_kes = EXCLUDED.monthly_kes, summary = EXCLUDED.summary, curriculum = EXCLUDED.curriculum, level = EXCLUDED.level, delivery_mode = EXCLUDED.delivery_mode, schedule = EXCLUDED.schedule, next_intake = EXCLUDED.next_intake, is_featured = EXCLUDED.is_featured";
  }

  // SQLite 'INSERT OR REPLACE INTO programs (...) VALUES (...)'
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+programs/i.test(converted)) {
    converted = converted.replace(
      /INSERT\s+OR\s+REPLACE\s+INTO\s+programs/i,
      "INSERT INTO programs"
    ) + " ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, slug = EXCLUDED.slug, category = EXCLUDED.category, duration_weeks = EXCLUDED.duration_weeks, price_kes = EXCLUDED.price_kes, monthly_kes = EXCLUDED.monthly_kes, summary = EXCLUDED.summary, curriculum = EXCLUDED.curriculum, level = EXCLUDED.level, delivery_mode = EXCLUDED.delivery_mode, schedule = EXCLUDED.schedule, next_intake = EXCLUDED.next_intake, is_featured = EXCLUDED.is_featured";
  }

  // SQLite 'INSERT OR REPLACE INTO tuition_fees (...) VALUES (...)'
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+tuition_fees/i.test(converted)) {
    converted = converted.replace(
      /INSERT\s+OR\s+REPLACE\s+INTO\s+tuition_fees/i,
      "INSERT INTO tuition_fees"
    ) + " ON CONFLICT (id) DO UPDATE SET course_title = EXCLUDED.course_title, upfront_kes = EXCLUDED.upfront_kes, monthly_installment_kes = EXCLUDED.monthly_installment_kes";
  }

  // SQLite 'INSERT OR REPLACE INTO student_module_progress (...) VALUES (...)'
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+student_module_progress/i.test(converted)) {
    converted = converted.replace(
      /INSERT\s+OR\s+REPLACE\s+INTO\s+student_module_progress/i,
      "INSERT INTO student_module_progress"
    ) + " ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, student_notes = EXCLUDED.student_notes, student_submission_url = EXCLUDED.student_submission_url, teacher_email = EXCLUDED.teacher_email, teacher_name = EXCLUDED.teacher_name, teacher_feedback = EXCLUDED.teacher_feedback, requested_at = EXCLUDED.requested_at, reviewed_at = EXCLUDED.reviewed_at, completed_at = EXCLUDED.completed_at";
  }

  // SQLite 'INSERT OR REPLACE INTO student_fee_accounts (...) VALUES (...)'
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+student_fee_accounts/i.test(converted)) {
    converted = converted.replace(
      /INSERT\s+OR\s+REPLACE\s+INTO\s+student_fee_accounts/i,
      "INSERT INTO student_fee_accounts"
    ) + " ON CONFLICT (id) DO UPDATE SET student_email = EXCLUDED.student_email, student_name = EXCLUDED.student_name, student_phone = EXCLUDED.student_phone, course_id = EXCLUDED.course_id, course_title = EXCLUDED.course_title, cohort = EXCLUDED.cohort, total_fee_kes = EXCLUDED.total_fee_kes, paid_fee_kes = EXCLUDED.paid_fee_kes, balance_kes = EXCLUDED.balance_kes, payment_status = EXCLUDED.payment_status, deadline_date = EXCLUDED.deadline_date, portal_access_granted = EXCLUDED.portal_access_granted, installment_plan = EXCLUDED.installment_plan, notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at";
  }

  // SQLite 'INSERT OR REPLACE INTO tuition_ledger (...) VALUES (...)'
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+tuition_ledger/i.test(converted)) {
    converted = converted.replace(
      /INSERT\s+OR\s+REPLACE\s+INTO\s+tuition_ledger/i,
      "INSERT INTO tuition_ledger"
    ) + " ON CONFLICT (id) DO UPDATE SET student_email = EXCLUDED.student_email, student_name = EXCLUDED.student_name, student_phone = EXCLUDED.student_phone, course_id = EXCLUDED.course_id, course_title = EXCLUDED.course_title, cohort = EXCLUDED.cohort, total_fee_kes = EXCLUDED.total_fee_kes, paid_fee_kes = EXCLUDED.paid_fee_kes, balance_kes = EXCLUDED.balance_kes, payment_status = EXCLUDED.payment_status, deadline_date = EXCLUDED.deadline_date, portal_access_granted = EXCLUDED.portal_access_granted, installment_plan = EXCLUDED.installment_plan, notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at";
  }

  // SQLite 'INSERT OR REPLACE INTO access_control (...) VALUES (...)'
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+access_control/i.test(converted)) {
    converted = converted.replace(
      /INSERT\s+OR\s+REPLACE\s+INTO\s+access_control/i,
      "INSERT INTO access_control"
    ) + " ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, requested_role = EXCLUDED.requested_role, status = EXCLUDED.status, assigned_role = EXCLUDED.assigned_role, full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, course_id = EXCLUDED.course_id, course_title = EXCLUDED.course_title, cohort = EXCLUDED.cohort, attempt_count = EXCLUDED.attempt_count, last_attempt_at = EXCLUDED.last_attempt_at, reviewed_at = EXCLUDED.reviewed_at, reviewed_by = EXCLUDED.reviewed_by, notes = EXCLUDED.notes, initial_password = EXCLUDED.initial_password, setup_token = EXCLUDED.setup_token";
  }

  // SQLite 'INSERT OR REPLACE INTO testimonials (...) VALUES (...)'
  if (/INSERT\s+OR\s+REPLACE\s+INTO\s+testimonials/i.test(converted)) {
    converted = converted.replace(
      /INSERT\s+OR\s+REPLACE\s+INTO\s+testimonials/i,
      "INSERT INTO testimonials"
    ) + " ON CONFLICT (id) DO UPDATE SET rating = EXCLUDED.rating, full_name = EXCLUDED.full_name, role_program = EXCLUDED.role_program, organization = EXCLUDED.organization, testimonial = EXCLUDED.testimonial, avatar_url = EXCLUDED.avatar_url, video_url = EXCLUDED.video_url, thumbnail_url = EXCLUDED.thumbnail_url, status = EXCLUDED.status, is_featured = EXCLUDED.is_featured";
  }

  return converted;
}

/**
 * Default initial site configuration and branding
 */
export const DEFAULT_SITE_SETTINGS: Record<string, string> = {
  brand_name: "Code Point Kenya",
  tagline: "Launch Your Tech Career in Software, Data, & AI",
  hero_eyebrow: "Online-first training + Physical Campus Lab (Ngong Road, Nairobi)",
  hero_title: "Launch Your Tech Career in Software, Data, & AI with Code Point Kenya",
  hero_introduction: "Kenya’s premier career-accelerator coding school. Learn through intensive, project-driven cohorts taught by senior engineers from Nairobi’s top tech ecosystems. Flexible online evening sessions combined with 24/7 access to our physical innovation lab at Ngong Road, Teamshark, 5th Floor.",
  weekday_hours: "Monday – Friday: 8:00 AM – 8:00 PM",
  weekend_hours: "Saturday Coding Clinics: 9:00 AM – 4:00 PM (Sunday Closed)",
  short_hours_label: "Mon–Sat 8:00 AM–8:00 PM",
  opens_time: "08:00",
  closes_time: "20:00",
  coverage: "Physical campus at Ngong Road, Teamshark 5th Floor, Nairobi & Online cohorts across East Africa. Gigabit Wi-Fi, backup power, study desks.",
  primary_phone: "+254 756 295 128",
  secondary_phone: "+254 717 434 845",
  email: "info@codepointkenya.com",
  address: "Ngong Road, Teamshark, 5th Floor, Nairobi, Kenya",
  city: "Nairobi, Kenya",
  social_instagram: "Code Point Kenya",
  about_title: "Accelerating Africa's Next Generation of Tech Leaders",
  about_body: "Code Point Kenya was founded with a single mission: to bridge the gap between theoretical computing education and the real-world skills demanded by global engineering teams. Based out of our 5th-floor innovation lab on Ngong Road, Nairobi, we deliver intensive, hands-on training in software engineering, data science, and applied AI.",
  hero_cta_text: "Apply for Next Cohort",
  hero_badge_text: "Online-First + Ngong Road Campus Hub",
  hero_image_url: "",
  school_logo_url: "",
  next_intake_date: "October 15, 2026",
  registration_deadline: "October 10, 2026",
  intake_status: "Enrollment Open",
  announcement_banner_text: "Early Bird 10% Discount Available for the Upcoming Cohort — Limited Campus & Online Seats!",
  announcement_banner_enabled: "true",
  carousel_slides_json: JSON.stringify([
    {
      id: 0,
      image: "kenyanCodingLab",
      badge: "Online-First Training + Physical Campus Lab (Ngong Road, Nairobi)",
      headlinePrefix: "",
      headlineHighlight: "Launch Your Tech Career in Software, Data, & AI with Code Point Kenya",
      headlineSuffix: "",
      description: "Kenya’s premier career-accelerator coding school. Learn through intensive, project-driven cohorts taught by senior engineers from Nairobi’s top tech ecosystems. Flexible online evening sessions combined with 24/7 access to our physical innovation lab at Ngong Road, Teamshark, 5th Floor.",
      pillLabel: "Tech Accelerator",
      quickHighlight: "94% Grad Placement"
    },
    {
      id: 1,
      image: "nairobiDevClass",
      badge: "Physical Collaborative Lab: Teamshark 5th Floor, Ngong Road",
      headlinePrefix: "Hands-on Coding & ",
      headlineHighlight: "Mentorship at Ngong Road Lab",
      headlineSuffix: "",
      description: "Step into our high-speed collaborative coding space in Nairobi. Access gigabit internet, backup power, peer pair-programming stations, and interactive Saturday coding clinics with senior tech practitioners.",
      pillLabel: "Ngong Road Hub",
      quickHighlight: "Gigabit Campus Wi-Fi"
    },
    {
      id: 2,
      image: "engineerMentoring",
      badge: "Production Portfolio & Global Engineering Standards",
      headlinePrefix: "Build ",
      headlineHighlight: "Production-Grade Projects",
      headlineSuffix: " with Expert Engineers",
      description: "No toy tutorials or synthetic exercises. Graduate with 4 verified production projects deployed on cloud infrastructure—from scalable microservices and database engines to enterprise LLM integrations.",
      pillLabel: "Live Projects",
      quickHighlight: "4 Verified Capstones"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=80",
      badge: "Evening Live Cohorts (7:00 PM – 9:30 PM EAT)",
      headlinePrefix: "Flexible Online Learning ",
      headlineHighlight: "Built for Working Professionals",
      headlineSuffix: "",
      description: "Master modern software engineering without putting your daytime career or degree on hold. Interactive live code walkthroughs, 1-on-1 instructor office hours, and collaborative weekend clinics.",
      pillLabel: "Evening Cohorts",
      quickHighlight: "7:00 PM - 9:30 PM EAT"
    }
  ]),
  faqs_json: JSON.stringify([
    {
      q: "Where is Code Point Kenya located physically?",
      a: "Our physical headquarters, collaborative learning lab, and classrooms are situated on Ngong Road, Teamshark, 5th Floor in Nairobi. Enrolled fellows can use our high-speed internet, power backup, study pods, and attend Saturday clinics here."
    },
    {
      q: "How does the Online-First model work?",
      a: "Lectures occur live via Zoom on scheduled evenings (7:00 PM - 9:30 PM EAT), enabling working professionals and university students to learn without quitting their jobs. All sessions are recorded and paired with Discord chat and physical campus lab access."
    },
    {
      q: "Are there flexible installment plans for tuition in KES?",
      a: "Yes! While full upfront payment provides a discount, all core programs (Software Engineering KES 85K, Data Science KES 75K, AI KES 95K, Cybersecurity KES 80K) can be split into manageable 5-month installment plans from as low as KES 16,500/month."
    },
    {
      q: "Do I need a Computer Science background to apply?",
      a: "No. Our foundational modules are specifically structured to take beginners from scratch. All you need is a working laptop, consistency, and problem-solving dedication."
    },
    {
      q: "How can I contact admissions or get advice on which course fits me?",
      a: "You can chat with our admissions advisors on WhatsApp directly at 0756295128 (+254756295128), email us at info@codepointkenya.com, or drop by our Ngong Road offices Monday through Saturday."
    }
  ]),
  progression_stages_json: JSON.stringify([
    {
      id: "stage-01",
      step_number: "01",
      stage_name: "Immersion",
      title: "Foundations & Code",
      description: "Master language syntax, algorithms, data modeling, and modern Git workflows through daily coding reps.",
      accent_color: "emerald"
    },
    {
      id: "stage-02",
      step_number: "02",
      stage_name: "Architecture",
      title: "Full-Stack Development",
      description: "Build robust REST APIs, modern web user interfaces, and integrate relational databases.",
      accent_color: "cyan"
    },
    {
      id: "stage-03",
      step_number: "03",
      stage_name: "Production",
      title: "Cloud & Microservices",
      description: "Deploy scalable Docker containers, configure CI/CD pipelines, and secure cloud infrastructure.",
      accent_color: "indigo"
    },
    {
      id: "stage-04",
      step_number: "04",
      stage_name: "Hired",
      title: "Portfolio & Job Placement",
      description: "Polish real-world projects, conduct mock engineering interviews, and connect with top hiring partners.",
      accent_color: "amber"
    }
  ]),
  technologies_section_json: JSON.stringify({
    badge_text: "Modern Industry Tooling",
    title: "Technologies You Will Master",
    subtitle: "Practical stack tailored for full-stack software roles",
    items: [
      {
        id: "html-css",
        title: "HTML5 & CSS3",
        category: "Front-End Foundation",
        description: "Semantic web structures and modern responsive design layouts.",
        icon_name: "bi-filetype-html",
        tags: ["Flexbox", "Grid", "Semantic HTML", "CSS Variables"],
        display_order: 1,
        is_visible: true
      },
      {
        id: "bootstrap",
        title: "Bootstrap 5",
        category: "UI Framework",
        description: "Rapid front-end UI framework and responsive mobile components.",
        icon_name: "bi-bootstrap-fill",
        tags: ["Responsive Grids", "Components", "Utilities", "Mobile-First"],
        display_order: 2,
        is_visible: true
      },
      {
        id: "javascript",
        title: "JavaScript (ES6+)",
        category: "Core Language",
        description: "Client-side interactivity, DOM manipulation, and asynchronous JS.",
        icon_name: "bi-filetype-js",
        tags: ["Async/Await", "Fetch API", "DOM APIs", "ES Modules"],
        display_order: 3,
        is_visible: true
      },
      {
        id: "sql-postgres",
        title: "SQL & PostgreSQL",
        category: "Database Systems",
        description: "Relational database design, queries, joins, and data management.",
        icon_name: "bi-database-fill-gear",
        tags: ["Schema Design", "Complex Joins", "Indexing", "ACID Transactions"],
        display_order: 4,
        is_visible: true
      },
      {
        id: "python-flask",
        title: "Python & Flask",
        category: "Backend & APIs",
        description: "Backend API routes, server rendering, authentication, and SQL integrations.",
        icon_name: "bi-filetype-py",
        tags: ["REST APIs", "SQLAlchemy", "JWT Auth", "Jinja Templates"],
        display_order: 5,
        is_visible: true
      },
      {
        id: "git-vercel",
        title: "Git & Vercel",
        category: "DevOps & Deployment",
        description: "Version control workflows, cloud deployment, and live hosting.",
        icon_name: "bi-git",
        tags: ["Git Branching", "CI/CD Pipelines", "Cloud Hosting", "SSL/Domains"],
        display_order: 6,
        is_visible: true
      }
    ]
  }),
  class_schedules_section_json: JSON.stringify({
    badge_text: "Structured Timetable Tracks",
    title: "Flexible Class Schedules",
    subtitle: "Choose a timing track that fits into your daily work or school routine.",
    items: [
      {
        id: "evening-track",
        title: "Evening Track",
        schedule: "Monday – Thursday",
        time_badge: "2:00 PM – 4:00 PM EAT",
        accent_badge: "Weekday Momentum",
        recommended_for: "Working Professionals & Students",
        description: "Ideal for full-time employees and university students who want to study after hours.",
        icon_name: "Moon",
        highlights: [
          "Live online lecture streaming & code walkthroughs",
          "Daily mentor Q&A and active code review channels",
          "Full recordings stored in student portal",
          "Optional Ngong Road campus lab access"
        ],
        campus_note: "Ngong Rd Lab Included",
        online_note: "Live Online Sync",
        display_order: 1,
        is_visible: true
      },
      {
        id: "weekend-track",
        title: "Weekend Track",
        schedule: "Saturdays Only",
        time_badge: "9:00 AM – 4:00 PM EAT",
        accent_badge: "High-Impact Immersion",
        recommended_for: "Busy Weekday Professionals",
        description: "Intensive weekend coding lab designed for busy professionals during weekdays.",
        icon_name: "Sun",
        highlights: [
          "Full-day Saturday immersive coding labs & sprint reviews",
          "1-on-1 architecture clinics at our Ngong Road campus",
          "Weekly asynchronous assignments with midweek feedback",
          "Collaborative peer hackathons & team project building"
        ],
        campus_note: "Ngong Rd Lab Included",
        online_note: "Live Online Sync",
        display_order: 2,
        is_visible: true
      }
    ]
  }),
  why_study_section_json: JSON.stringify({
    badge_text: "The CodePoint Kenya Advantage",
    title: "Why Study at CodePoint Kenya",
    subtitle: "Built specifically for working professionals, university students, and career changers.",
    items: [
      {
        id: "mentorship",
        title: "1-on-1 Mentorship & Code Reviews",
        badge: "Direct Guidance",
        description: "Get direct support from experienced software engineers to debug your code and review portfolio assignments.",
        icon_name: "Users",
        benefits: [
          "Line-by-line pull request audits from tech leads",
          "Personalized office hours for architectural debugging",
          "Career readiness coaching & technical interview prep"
        ],
        outcome_text: "Guaranteed Outcome",
        display_order: 1,
        is_visible: true
      },
      {
        id: "projects",
        title: "Practical Portfolio Projects",
        badge: "Production-Grade",
        description: "Graduate with real-world applications (E-commerce storefronts, REST APIs, database systems) deployed live on the web.",
        icon_name: "Rocket",
        benefits: [
          "Production deployments with cloud hosting & custom domains",
          "Robust SQL schema design with security best practices",
          "Public GitHub repositories showcasing clean code commits"
        ],
        outcome_text: "Guaranteed Outcome",
        display_order: 2,
        is_visible: true
      },
      {
        id: "certificate",
        title: "Verified Completion Certificate",
        badge: "Industry Credential",
        description: "Receive an official, verifiable certificate of completion to showcase your software development skills to employers.",
        icon_name: "Award",
        benefits: [
          "Cryptographically verifiable serial number & QR code",
          "One-click LinkedIn credential and resume attachment",
          "Endorsed by hiring managers across Kenyan tech startups"
        ],
        outcome_text: "Guaranteed Outcome",
        display_order: 3,
        is_visible: true
      }
    ]
  })
};

export const DEFAULT_COURSES = [
  {
    id: "course-software-engineering",
    title: "Full-Stack Software Engineering",
    slug: "full-stack-software-engineering",
    category: "Software Development",
    duration_weeks: 16,
    price_kes: 85000,
    monthly_kes: 17000,
    summary: "Master modern end-to-end full-stack software development. Build responsive web frontends with React & Tailwind CSS, robust backend microservices with Node.js, Express & Python Flask, scalable PostgreSQL database schemas, and deploy containerized Docker applications with CI/CD on cloud infrastructure.",
    curriculum: JSON.stringify([
      { module: "Module 1: Modern Frontend & React UI Architecture", topics: ["HTML5 & Responsive CSS3", "Modern JavaScript (ES6+)", "React 19 & Hooks", "Tailwind CSS", "State Management & Vite"] },
      { module: "Module 2: Backend REST APIs & Relational Databases", topics: ["Node.js & Express Architecture", "Python & Flask APIs", "PostgreSQL & Database Normalization", "Authentication & JWT", "M-Pesa Daraja Payment API"] },
      { module: "Module 3: Microservices & Cloud Infrastructure", topics: ["Docker Containerization", "CI/CD with GitHub Actions", "Cloud Hosting on Vercel & AWS", "System Design Fundamentals"] },
      { module: "Module 4: Production Capstone & Job Placement", topics: ["Production-Grade Team Capstone", "Git Workflows & Code Reviews", "Mock Technical Interviews", "Portfolio & CV Optimization"] }
    ]),
    level: "Beginner to Advanced",
    delivery_mode: "Online-First + Ngong Rd Campus Lab Access",
    schedule: "Mon-Thu 7:00 PM - 9:30 PM EAT & Saturday Coding Clinics (9 AM - 4 PM)",
    next_intake: "October 15, 2026",
    is_featured: 1,
    created_at: new Date().toISOString()
  },
  {
    id: "course-data-science-ai",
    title: "Data Science & Applied AI",
    slug: "data-science-applied-ai",
    category: "Artificial Intelligence",
    duration_weeks: 16,
    price_kes: 95000,
    monthly_kes: 19000,
    summary: "Transform raw data into predictive intelligence and production AI systems. Master Python for data analysis, SQL databases, machine learning algorithms, deep learning, retrieval-augmented generation (RAG), and fine-tuning enterprise LLMs using the Gemini API.",
    curriculum: JSON.stringify([
      { module: "Module 1: Python for Data Science & Relational SQL", topics: ["Python Data Structures", "NumPy & Pandas Analysis", "Data Cleaning & Transformation", "PostgreSQL & Complex Queries"] },
      { module: "Module 2: Statistical Modeling & Machine Learning", topics: ["Exploratory Data Analysis", "Scikit-Learn Algorithms", "Regression & Classification", "Model Evaluation & Cross-Validation"] },
      { module: "Module 3: Applied AI, LLMs & RAG Architectures", topics: ["Gemini API Integration", "LangChain & Vector Embeddings", "RAG Pipelines with Pinecone", "Prompt Engineering & Evaluation"] },
      { module: "Module 4: Production AI Deployment & Capstone", topics: ["FastAPI Model Serving", "Dockerizing AI Apps", "Cloud AI Deployment", "Enterprise AI Capstone"] }
    ]),
    level: "Beginner to Advanced",
    delivery_mode: "Online-First + Ngong Rd Campus Lab Access",
    schedule: "Mon-Thu 7:00 PM - 9:30 PM EAT & Saturday Coding Clinics (9 AM - 4 PM)",
    next_intake: "October 15, 2026",
    is_featured: 1,
    created_at: new Date().toISOString()
  },
  {
    id: "course-cybersecurity-microservices",
    title: "Cyber Security & Microservices",
    slug: "cyber-security-microservices",
    category: "Security & Infrastructure",
    duration_weeks: 16,
    price_kes: 80000,
    monthly_kes: 16000,
    summary: "Master offensive and defensive cybersecurity alongside resilient cloud microservice architectures. Learn penetration testing, ethical hacking, network defense, Linux server hardening, container security (Docker/Kubernetes), and secure microservice API gateways.",
    curriculum: JSON.stringify([
      { module: "Module 1: Network Security, Linux Internals & Cryptography", topics: ["TCP/IP & OSI Networking", "Wireshark Packet Analysis", "Linux Hardening & Shell Scripting", "Symmetric/Asymmetric Encryption"] },
      { module: "Module 2: Offensive Security & Penetration Testing", topics: ["OWASP Top 10 Web Vulnerabilities", "Burp Suite & Nmap Recon", "Vulnerability Scanning", "Privilege Escalation"] },
      { module: "Module 3: Microservices Defense & Cloud Infrastructure", topics: ["Docker & Container Security", "API Gateways & Rate Limiting", "OAuth2 & Zero Trust Architecture", "Cloud Security Best Practices"] },
      { module: "Module 4: Incident Response & Threat Hunting", topics: ["SIEM Log Analysis", "Incident Response Playbooks", "Mock Penetration Test Report", "Industry Certification Preparation"] }
    ]),
    level: "Beginner to Intermediate",
    delivery_mode: "Online-First + Ngong Rd Campus Lab Access",
    schedule: "Mon-Thu 7:00 PM - 9:30 PM EAT & Saturday Coding Clinics (9 AM - 4 PM)",
    next_intake: "October 15, 2026",
    is_featured: 1,
    created_at: new Date().toISOString()
  }
];

export const DEFAULT_USERS = [
  {
    id: "usr-admin-primary",
    name: "Code Point Admin",
    email: "info@codepointkenya.com",
    password: "admin123456ke",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    enrolled_course_id: null,
    enrolled_course_title: null,
    created_at: new Date().toISOString()
  },
  {
    id: "usr-admin-01",
    name: "Dr. Kelvin Mutua",
    email: "admin@codepointkenya.com",
    password: "admin123",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    enrolled_course_id: null,
    enrolled_course_title: null,
    created_at: new Date().toISOString()
  },
  {
    id: "usr-instructor-01",
    name: "Brenda Wambui",
    email: "instructor@codepointkenya.com",
    password: "lead123",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    enrolled_course_id: null,
    enrolled_course_title: null,
    created_at: new Date().toISOString()
  },
  {
    id: "usr-instructor-02",
    name: "Kevin Omondi",
    email: "kevin.omondi@codepointkenya.com",
    password: "instructor123",
    role: "instructor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    enrolled_course_id: null,
    enrolled_course_title: null,
    created_at: new Date().toISOString()
  },
  {
    id: "usr-student-01",
    name: "Brian Kipchumba",
    email: "student@codepointkenya.com",
    password: "student123",
    role: "student",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    enrolled_course_id: null,
    enrolled_course_title: null,
    created_at: new Date().toISOString()
  }
];

export const DEFAULT_REVIEWS = [
  {
    id: "rev-001",
    rating: 5,
    reviewerName: "Kevin Otieno",
    reviewer_name: "Kevin Otieno",
    full_name: "Kevin Otieno",
    role: "Software Engineering Cohort 3 Alum",
    role_program: "Software Engineering Cohort 3 Alum",
    organization: "Junior Backend Developer, Safaricom PLC",
    comment: "Code Point Kenya transformed my transition into tech. The evening online cohorts allowed me to keep my daytime job while building 4 production systems with real cloud deployments. The Ngong Road lab Saturday hackathons connected me directly with hiring leads.",
    testimonial: "Code Point Kenya transformed my transition into tech. The evening online cohorts allowed me to keep my daytime job while building 4 production systems with real cloud deployments. The Ngong Road lab Saturday hackathons connected me directly with hiring leads.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isApproved: true,
    is_approved: 1,
    status: "approved",
    isFeatured: true,
    is_featured: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: "rev-002",
    rating: 5,
    reviewerName: "Amina Abdi",
    reviewer_name: "Amina Abdi",
    full_name: "Amina Abdi",
    role: "Applied AI & LLMs Fellow",
    role_program: "Applied AI & LLMs Fellow",
    organization: "AI Solutions Specialist, Twiga Foods",
    comment: "The curriculum doesn't waste time on surface-level toy apps. We built real retrieval-augmented generation pipelines, fine-tuned models, and deployed containerized microservices. The mentorship from senior Kenyan engineers is truly world-class.",
    testimonial: "The curriculum doesn't waste time on surface-level toy apps. We built real retrieval-augmented generation pipelines, fine-tuned models, and deployed containerized microservices. The mentorship from senior Kenyan engineers is truly world-class.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    isApproved: true,
    is_approved: 1,
    status: "approved",
    isFeatured: true,
    is_featured: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: "rev-003",
    rating: 5,
    reviewerName: "Brian Kiprop",
    reviewer_name: "Brian Kiprop",
    full_name: "Brian Kiprop",
    role: "Data Science & Predictive Analytics",
    role_program: "Data Science & Predictive Analytics",
    organization: "Analytics Associate, Equity Bank Tech",
    comment: "I came in with zero Python background. In 16 weeks, I went from beginner syntax to predictive customer churn modeling and automated ETL data pipelines. The installment tuition plan made it completely stress-free.",
    testimonial: "I came in with zero Python background. In 16 weeks, I went from beginner syntax to predictive customer churn modeling and automated ETL data pipelines. The installment tuition plan made it completely stress-free.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    isApproved: true,
    is_approved: 1,
    status: "approved",
    isFeatured: true,
    is_featured: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
  },
  {
    id: "rev-004",
    rating: 5,
    reviewerName: "Grace Mwangi",
    reviewer_name: "Grace Mwangi",
    full_name: "Grace Mwangi",
    role: "Cybersecurity & Defense Track",
    role_program: "Cybersecurity & Defense Track",
    organization: "Security Analyst, Cellulant",
    comment: "The physical lab at Ngong Road (Teamshark, 5th Floor) was my second home during weekends. Blazing fast gigabit fiber and zero power interruptions meant I could focus 100% on cloud security labs and mock incident drills.",
    testimonial: "The physical lab at Ngong Road (Teamshark, 5th Floor) was my second home during weekends. Blazing fast gigabit fiber and zero power interruptions meant I could focus 100% on cloud security labs and mock incident drills.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isApproved: true,
    is_approved: 1,
    status: "approved",
    isFeatured: true,
    is_featured: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
  }
];

export const DEFAULT_VIDEO_TESTIMONIALS = [
  {
    id: "vid-001",
    student_name: "Daniel Michael",
    photo_url: "/src/assets/images/alumni_daniel_dev_1790212245688.jpg",
    thumbnail_url: "/src/assets/images/alumni_daniel_dev_1790212245688.jpg",
    course_program: "Full-Stack Software Engineering",
    cohort: "Cohort 14",
    career_role: "Junior Frontend Developer",
    company: "Safaricom PLC",
    video_url: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
    duration: "3:12",
    quote_highlight: "The hands-on projects at Ngong Road campus helped me land my tech job in 4 months. Going from zero TypeScript knowledge to deploying microservices was surreal.",
    is_featured: 1,
    status: "approved",
    views_count: 1420,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString()
  },
  {
    id: "vid-002",
    student_name: "Cynthia Njeri",
    photo_url: "/src/assets/images/alumni_cynthia_data_1790212257311.jpg",
    thumbnail_url: "/src/assets/images/alumni_cynthia_data_1790212257311.jpg",
    course_program: "Data Science & Machine Learning",
    cohort: "Cohort 12",
    career_role: "BI & Data Analyst",
    company: "Equity Bank Kenya",
    video_url: "https://www.youtube.com/watch?v=r-uOLxNrNk8",
    duration: "2:45",
    quote_highlight: "From zero Python background to building predictive credit models. The instructors pushed us through real East African banking datasets.",
    is_featured: 1,
    status: "approved",
    views_count: 980,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString()
  },
  {
    id: "vid-003",
    student_name: "Kevin Otieno",
    photo_url: "/src/assets/images/alumni_kevin_cloud_1790212267835.jpg",
    thumbnail_url: "/src/assets/images/alumni_kevin_cloud_1790212267835.jpg",
    course_program: "Applied AI & Cloud Engineering",
    cohort: "Cohort 15",
    career_role: "Cloud DevOps Associate",
    company: "Cellulant",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "4:05",
    quote_highlight: "The Saturday coding clinics and pair-programming at Teamshark 5th Floor completely changed my learning curve with senior mentors.",
    is_featured: 1,
    status: "approved",
    views_count: 1250,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString()
  },
  {
    id: "vid-004",
    student_name: "Faith Mwangi",
    photo_url: "/src/assets/images/alumni_faith_sec_1790212286930.jpg",
    thumbnail_url: "/src/assets/images/alumni_faith_sec_1790212286930.jpg",
    course_program: "Cyber Security & Cloud Defense",
    cohort: "Cohort 13",
    career_role: "Security Operations Analyst",
    company: "KCB Group",
    video_url: "https://www.youtube.com/watch?v=EngW7tLk6R8",
    duration: "3:30",
    quote_highlight: "Real penetration testing labs instead of multiple-choice quizzes made all the difference during technical whiteboard interviews.",
    is_featured: 1,
    status: "approved",
    views_count: 870,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString()
  }
];

export const DEFAULT_CERTIFICATES = [
  {
    id: "cert-2026-001",
    studentName: "Daniel Kiptoo",
    studentEmail: "daniel.kiptoo@example.com",
    courseName: "Full-Stack Software Engineering",
    grade: "Grade Distinction - Cohort 14",
    institutionName: "CODE POINT KENYA",
    subHeading: "INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI",
    addressText: "Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya",
    signatory1Name: "Brenda Wambui",
    signatory1Title: "CURRICULUM DIRECTOR - Faculty of Engineering",
    signatory2Name: "Code Point Kenya Academic Board & Admin",
    signatory2Title: "ISSUED DATE",
    issueDate: "2026-04-15",
    certIdNumber: "CPK-CERT-2026-501525",
    certidnumber: "CPK-CERT-2026-501525",
    status: "Active",
    recipientType: "Student",
    recipient_type: "Student",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    verification_id: "CPK-CERT-2026-501525",
    student_name: "Daniel Kiptoo",
    student_email: "daniel.kiptoo@example.com",
    course_title: "Full-Stack Software Engineering",
    cohort: "Cohort 14",
    completion_date: "April 15, 2026",
    final_grade: "Distinction",
    approved_by: "Code Point Kenya Academic Board & Admin",
    approved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    qr_code_payload: "https://codepointkenya.com/verify?id=CPK-CERT-2026-501525"
  },
  {
    id: "cert-2026-002",
    studentName: "Cynthia Wanjiku",
    studentEmail: "cynthia.wanjiku@example.com",
    courseName: "Data Science & Applied AI",
    grade: "Grade Distinction - Cohort 14",
    institutionName: "CODE POINT KENYA",
    subHeading: "INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI",
    addressText: "Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya",
    signatory1Name: "Brenda Wambui",
    signatory1Title: "CURRICULUM DIRECTOR - Faculty of Engineering",
    signatory2Name: "Code Point Kenya Academic Board & Admin",
    signatory2Title: "ISSUED DATE",
    issueDate: "2026-04-20",
    certIdNumber: "CPK-CERT-2026-782194",
    certidnumber: "CPK-CERT-2026-782194",
    status: "Active",
    recipientType: "Student",
    recipient_type: "Student",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    verification_id: "CPK-CERT-2026-782194",
    student_name: "Cynthia Wanjiku",
    student_email: "cynthia.wanjiku@example.com",
    course_title: "Data Science & Applied AI",
    cohort: "Cohort 14",
    completion_date: "April 20, 2026",
    final_grade: "Distinction",
    approved_by: "Code Point Kenya Academic Board & Admin",
    approved_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    qr_code_payload: "https://codepointkenya.com/verify?id=CPK-CERT-2026-782194"
  }
];

export const DEFAULT_ASSIGNMENTS = [
  {
    id: "asg-001",
    title: "Production REST API & PostgreSQL Microservice",
    course_title: "Software Engineering Immersive",
    cohort: "Cohort 14",
    description: "Build an idempotent payments and order checkout REST API using Express and PostgreSQL. Ensure comprehensive error handling, migrations, and dockerized integration test suites.",
    resource_url: "https://github.com/codepointkenya/software-engineering-curriculum",
    sheets_url: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
    due_date: "2026-05-30",
    max_marks: 100,
    instructor_name: "Brenda Wambui",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: "asg-002",
    title: "Interactive Fintech Analytics Dashboard",
    course_title: "Software Engineering Immersive",
    cohort: "Cohort 14",
    description: "Develop a real-time reactive dashboard using React, Tailwind CSS, and Recharts visualizing M-Pesa transaction velocity and dispute volumes.",
    resource_url: "https://github.com/codepointkenya/react-fintech-analytics",
    sheets_url: "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
    due_date: "2026-06-15",
    max_marks: 100,
    instructor_name: "Brenda Wambui",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

export const DEFAULT_SUBMISSIONS = [
  {
    id: "sub-001",
    assignment_id: "asg-001",
    assignment_title: "Production REST API & PostgreSQL Microservice",
    student_name: "Brian Kipchumba",
    student_email: "student@codepointkenya.com",
    course_title: "Software Engineering Immersive",
    submission_url: "https://github.com/briankip/mpesa-checkout-api",
    notes: "Implemented Docker compose, PostgreSQL pooling, and automated testing.",
    marks: 94,
    feedback: "Exceptional architecture and clean async error handling. Ready for production deployment.",
    status: "Marked",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    marked_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: "sub-002",
    assignment_id: "asg-002",
    assignment_title: "Interactive Fintech Analytics Dashboard",
    student_name: "Brian Kipchumba",
    student_email: "student@codepointkenya.com",
    course_title: "Software Engineering Immersive",
    submission_url: "https://github.com/briankip/fintech-kpi-dashboard",
    notes: "Integrated Recharts with responsive viewport breakpoints and KPI cards.",
    marks: null,
    feedback: "",
    status: "Pending",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    marked_at: null
  },
  {
    id: "sub-003",
    assignment_id: "asg-001",
    assignment_title: "Production REST API & PostgreSQL Microservice",
    student_name: "Cynthia Njeri",
    student_email: "cynthia.njeri@example.com",
    course_title: "Software Engineering Immersive",
    submission_url: "https://github.com/cynthian/express-pg-orders",
    notes: "Completed all endpoints with Postman collection attached.",
    marks: 92,
    feedback: "Well-structured relational queries and indexing.",
    status: "Marked",
    submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    marked_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  }
];

export const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "ann-001",
    title: "Saturday Physical Lab Clinic & Architecture Code Reviews",
    content: "All Cohort 14 fellows are invited to the physical innovation hub at Ngong Road, Teamshark 5th Floor this Saturday from 9:00 AM to 4:00 PM EAT. Senior staff engineers from Nairobi tech ecosystems will be hosting live pair-programming and architecture code reviews.",
    category: "Lab Notice",
    cohort: "Cohort 14",
    course_title: "All Programs",
    author_name: "Brenda Wambui",
    author_role: "Lead Faculty - Software Engineering",
    is_pinned: 1,
    priority: "High",
    action_url: "https://wa.me/254756295128?text=Hello%20Campus%20Team,%20I%20will%20attend%20the%20Saturday%20Lab%20Clinic.",
    action_label: "RSVP via Lab Concierge",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
  },
  {
    id: "ann-002",
    title: "Module 3 Capstone Deliverable Rubric & Database Schema Requirements",
    content: "The Module 3 Full-Stack Capstone deliverables are due on May 5th, 2026. Please ensure your GitHub repositories contain clean README setup instructions, Dockerfile, and database migrations. All submissions must be submitted via your Student Portal for evaluation.",
    category: "Class Update",
    cohort: "Cohort 14",
    course_title: "Software Engineering Immersive",
    author_name: "Brenda Wambui",
    author_role: "Lead Instructor",
    is_pinned: 1,
    priority: "Normal",
    action_url: "https://github.com/codepointkenya/software-engineering-curriculum",
    action_label: "View Rubric & Starter Kit",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
  },
  {
    id: "ann-003",
    title: "Upcoming Industry Guest Lecture: Building Scalable Cloud Backends in Kenya",
    content: "Join us this Thursday at 7:30 PM EAT for an exclusive guest session with lead cloud architects discussing microservices at scale, Docker containerization, and fintech reliability in East Africa.",
    category: "Guest Lecture",
    cohort: "All Cohorts",
    course_title: "All Programs",
    author_name: "Dr. Kelvin Mutua",
    author_role: "Academic Director",
    is_pinned: 0,
    priority: "Normal",
    action_url: "https://meet.google.com/cpk-live-tech",
    action_label: "Add to Google Calendar",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  }
];

export const DEFAULT_LOGIN_ATTEMPTS = [
  {
    id: "att-001",
    email: "brenda.wambui@codepointkenya.com",
    requested_role: "instructor",
    status: "approved",
    assigned_role: "instructor",
    full_name: "Brenda Wambui",
    attempt_count: 1,
    last_attempt_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    reviewed_by: "Administrator",
    notes: "Lead Instructor for Full-Stack Python & Flask",
    initial_password: null,
    setup_token: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: "att-002",
    email: "kevin.kiprono@gmail.com",
    requested_role: "student",
    status: "approved",
    assigned_role: "student",
    full_name: "Kevin Kiprono",
    attempt_count: 2,
    last_attempt_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    reviewed_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    reviewed_by: "Administrator",
    notes: "Enrolled in Software Engineering Cohort 14",
    initial_password: null,
    setup_token: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: "att-003",
    email: "faith.mutua@outlook.com",
    requested_role: "student",
    status: "pending",
    assigned_role: null,
    full_name: "Faith Mutua",
    attempt_count: 1,
    last_attempt_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    notes: "Applied via Admissions Portal, pending fee clearance confirmation",
    initial_password: null,
    setup_token: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  }
];

export const DEFAULT_LECTURES = [
  {
    id: "lec-001",
    instructor_email: "instructor@codepointkenya.com",
    instructor_name: "Brenda Wambui",
    course_id: "software-engineering",
    course_title: "Software Engineering Immersive",
    cohort: "Cohort 14",
    title: "Advanced JavaScript ES6+ & DOM State Machines",
    description: "Deep dive into async/await, closures, event loops and modular frontend architecture.",
    day_of_week: "Monday",
    start_time: "18:00",
    end_time: "20:00",
    recurrence: "Weekly",
    location_type: "Online Google Meet",
    meeting_link: "https://meet.google.com/cpk-se14-mon",
    date: "2026-05-04",
    created_at: new Date().toISOString()
  },
  {
    id: "lec-002",
    instructor_email: "instructor@codepointkenya.com",
    instructor_name: "Brenda Wambui",
    course_id: "software-engineering",
    course_title: "Software Engineering Immersive",
    cohort: "Cohort 14",
    title: "PostgreSQL Database Schema Design & SQL Joins",
    description: "Hands-on relational table architecture, foreign keys, and query optimization.",
    day_of_week: "Wednesday",
    start_time: "18:00",
    end_time: "20:00",
    recurrence: "Weekly",
    location_type: "Online Google Meet",
    meeting_link: "https://meet.google.com/cpk-se14-wed",
    date: "2026-05-06",
    created_at: new Date().toISOString()
  },
  {
    id: "lec-003",
    instructor_email: "instructor@codepointkenya.com",
    instructor_name: "Brenda Wambui",
    course_id: "software-engineering",
    course_title: "Software Engineering Immersive",
    cohort: "Cohort 14",
    title: "Weekend Physical Lab: Flask API & Production Debugging",
    description: "In-person campus code review, debugging sessions, and mentor pair-programming at Ngong Road.",
    day_of_week: "Saturday",
    start_time: "09:00",
    end_time: "13:00",
    recurrence: "Weekly",
    location_type: "Ngong Rd Campus Lab",
    meeting_link: "Teamshark Hub, 5th Floor, Lab A",
    date: "2026-05-09",
    created_at: new Date().toISOString()
  }
];

export const DEFAULT_STUDENT_PROGRESS = [
  {
    id: "prog-brian-se-m1",
    student_email: "student@codepointkenya.com",
    student_name: "Brian Kipchumba",
    course_id: "course-software-engineering",
    course_title: "Full-Stack Software Engineering",
    module_id: "module-1",
    module_title: "Module 1: Modern Frontend & React UI Architecture",
    module_number: 1,
    status: "completed",
    student_notes: "Finished building the interactive component library, tested all React hooks, and passed code review.",
    student_submission_url: "https://github.com/codepoint-students/react-design-system",
    teacher_email: "instructor@codepointkenya.com",
    teacher_name: "Brenda Wambui",
    teacher_feedback: "Excellent mastery of TypeScript generics, strict mode compiler options, and responsive UI components.",
    requested_at: "2026-04-10T14:30:00.000Z",
    reviewed_at: "2026-04-12T09:15:00.000Z",
    completed_at: "2026-04-12T10:00:00.000Z",
    created_at: "2026-04-01T08:00:00.000Z"
  },
  {
    id: "prog-brian-se-m2",
    student_email: "student@codepointkenya.com",
    student_name: "Brian Kipchumba",
    course_id: "course-software-engineering",
    course_title: "Full-Stack Software Engineering",
    module_id: "module-2",
    module_title: "Module 2: Backend REST APIs & Relational Databases",
    module_number: 2,
    status: "approved",
    student_notes: "Implemented Express and Flask REST endpoints, relational PostgreSQL migrations, and JWT authentication.",
    student_submission_url: "https://github.com/codepoint-students/express-postgres-ecommerce-api",
    teacher_email: "instructor@codepointkenya.com",
    teacher_name: "Brenda Wambui",
    teacher_feedback: "Well architected relational schema and clean controller endpoints. You are approved to mark this module as complete!",
    requested_at: "2026-04-20T11:00:00.000Z",
    reviewed_at: "2026-04-21T16:20:00.000Z",
    completed_at: null,
    created_at: "2026-04-12T10:30:00.000Z"
  },
  {
    id: "prog-brian-se-m3",
    student_email: "student@codepointkenya.com",
    student_name: "Brian Kipchumba",
    course_id: "course-software-engineering",
    course_title: "Full-Stack Software Engineering",
    module_id: "module-3",
    module_title: "Module 3: Microservices & Cloud Infrastructure",
    module_number: 3,
    status: "pending_approval",
    student_notes: "Containerized the services using Docker Compose, configured multi-stage builds and GitHub Actions CI workflow.",
    student_submission_url: "https://github.com/codepoint-students/microservices-cloud-deploy",
    teacher_email: "instructor@codepointkenya.com",
    teacher_name: "Brenda Wambui",
    teacher_feedback: null,
    requested_at: "2026-04-23T10:00:00.000Z",
    reviewed_at: null,
    completed_at: null,
    created_at: "2026-04-22T08:00:00.000Z"
  }
];

export const DEFAULT_STUDENT_FEES = [
  {
    id: "fee-usr-student-01",
    student_email: "student@codepointkenya.com",
    student_name: "Brian Kipchumba",
    student_phone: "+254 712 345 678",
    course_id: "course-software-engineering",
    course_title: "Full-Stack Software Engineering",
    cohort: "Cohort 14 (Evening & Hybrid)",
    total_fee_kes: 85000,
    paid_fee_kes: 37000,
    balance_kes: 48000,
    payment_status: "pending",
    deadline_date: "April 30, 2026",
    portal_access_granted: 1,
    installment_plan: "5-Month Flexible Installments",
    notes: "Installment 1 & 2 paid via M-Pesa. Next installment KES 16,000 due April 30.",
    last_alert_sent_at: "2026-04-20T09:00:00.000Z",
    last_alert_type: "deadline_approaching",
    updated_at: new Date().toISOString(),
    created_at: "2026-03-01T08:00:00.000Z"
  },
  {
    id: "fee-kevin-01",
    student_email: "kevin.kiprono@gmail.com",
    student_name: "Kevin Kiprono",
    student_phone: "+254 722 890 123",
    course_id: "course-software-engineering",
    course_title: "Full-Stack Software Engineering",
    cohort: "Cohort 14 (Evening & Hybrid)",
    total_fee_kes: 85000,
    paid_fee_kes: 85000,
    balance_kes: 0,
    payment_status: "cleared",
    deadline_date: "March 15, 2026",
    portal_access_granted: 1,
    installment_plan: "Full Upfront Payment (5% Discount Applied)",
    notes: "Tuition fully cleared prior to cohort kickoff. Unrestricted live access.",
    last_alert_sent_at: null,
    last_alert_type: null,
    updated_at: new Date().toISOString(),
    created_at: "2026-02-15T08:00:00.000Z"
  },
  {
    id: "fee-faith-01",
    student_email: "faith.mutua@outlook.com",
    student_name: "Faith Mutua",
    student_phone: "+254 733 456 789",
    course_id: "course-applied-ai",
    course_title: "Applied AI & Large Language Models",
    cohort: "Cohort 5 (Weekend Masterclass)",
    total_fee_kes: 95000,
    paid_fee_kes: 20000,
    balance_kes: 75000,
    payment_status: "overdue",
    deadline_date: "April 10, 2026",
    portal_access_granted: 0,
    installment_plan: "5-Month Flexible Installments",
    notes: "Initial deposit paid. Second installment was due April 10. Outstanding balance KES 75,000. Live class access locked.",
    last_alert_sent_at: "2026-04-11T08:30:00.000Z",
    last_alert_type: "status_overdue",
    updated_at: new Date().toISOString(),
    created_at: "2026-03-10T08:00:00.000Z"
  },
  {
    id: "fee-cynthia-01",
    student_email: "cynthia.njeri@example.com",
    student_name: "Cynthia Njeri",
    student_phone: "+254 798 654 321",
    course_id: "course-data-science",
    course_title: "Data Science & Machine Learning",
    cohort: "Cohort 12 (Evening Online)",
    total_fee_kes: 80000,
    paid_fee_kes: 45000,
    balance_kes: 35000,
    payment_status: "pending",
    deadline_date: "May 15, 2026",
    portal_access_granted: 1,
    installment_plan: "4-Month Installments",
    notes: "Installment payments on track. Next installment due May 15.",
    last_alert_sent_at: null,
    last_alert_type: null,
    updated_at: new Date().toISOString(),
    created_at: "2026-03-12T08:00:00.000Z"
  }
];

export const DEFAULT_ACTIVITY_LOGS = [
  {
    id: "log-act-001",
    event_type: "enrollment_status_change",
    action: "Student Enrollment & Access Provisioned",
    entity_type: "application",
    entity_id: "app-101",
    actor_name: "Admissions Admin",
    actor_email: "info@codepointkenya.com",
    target_name: "Brian Kipchumba",
    target_email: "student@codepointkenya.com",
    details: "Application status changed from 'accepted' to 'enrolled'. Automatically provisioned Student Portal credentials and generated student fee ledger.",
    previous_value: "accepted",
    new_value: "enrolled",
    ip_address: "197.232.88.14",
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: "log-act-002",
    event_type: "credentials_dispatched",
    action: "Credentials Dispatched via Email",
    entity_type: "login_attempt",
    entity_id: "att-001",
    actor_name: "System Auto-Sync",
    actor_email: "info@codepointkenya.com",
    target_name: "Brian Kipchumba",
    target_email: "student@codepointkenya.com",
    details: "Dispatched Student Portal login details (email, temporary password, and portal URL) to student@codepointkenya.com.",
    previous_value: "generated",
    new_value: "dispatched",
    ip_address: "197.232.88.14",
    created_at: new Date(Date.now() - 1000 * 60 * 34).toISOString()
  },
  {
    id: "log-act-003",
    event_type: "password_reset",
    action: "Manual Temporary Password Reset",
    entity_type: "user",
    entity_id: "att-002",
    actor_name: "Administrator",
    actor_email: "info@codepointkenya.com",
    target_name: "Kevin Kiprono",
    target_email: "kevin.kiprono@gmail.com",
    details: "Administrator executed manual temporary password reset. New cryptographically secure password regenerated and synced with users authentication table.",
    previous_value: "******",
    new_value: "CPK-Std-****",
    ip_address: "105.163.2.112",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  },
  {
    id: "log-act-004",
    event_type: "user_access_approval",
    action: "Faculty Instructor Access Approved",
    entity_type: "login_attempt",
    entity_id: "att-003",
    actor_name: "Administrator",
    actor_email: "info@codepointkenya.com",
    target_name: "Brenda Wambui",
    target_email: "instructor@codepointkenya.com",
    details: "Approved instructor role clearance with full lecture scheduling and assignment grading privileges.",
    previous_value: "pending",
    new_value: "approved",
    ip_address: "105.163.2.112",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: "log-act-005",
    event_type: "enrollment_status_change",
    action: "Admissions Offer Accepted",
    entity_type: "application",
    entity_id: "app-102",
    actor_name: "Admissions Admin",
    actor_email: "info@codepointkenya.com",
    target_name: "Cynthia Moraa",
    target_email: "cynthia.moraa@gmail.com",
    details: "Application moved to 'accepted' status for Data Science & Applied AI (October 15 Cohort).",
    previous_value: "interview_scheduled",
    new_value: "accepted",
    ip_address: "197.232.88.14",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString()
  },
  {
    id: "log-act-006",
    event_type: "fee_status_update",
    action: "Tuition Installment Recorded",
    entity_type: "fee_account",
    entity_id: "fee-001",
    actor_name: "Finance Administrator",
    actor_email: "info@codepointkenya.com",
    target_name: "Brian Kipchumba",
    target_email: "student@codepointkenya.com",
    details: "Confirmed initial tuition deposit of KES 37,000 via M-Pesa. Outstanding balance updated to KES 48,000.",
    previous_value: "KES 0",
    new_value: "KES 37,000",
    ip_address: "197.232.88.14",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
  }
];

/**
 * Initialize PostgreSQL Production Database
 */
async function initPostgres(connectionString: string): Promise<AppDatabase | null> {
  let pool: pg.Pool | null = null;
  try {
    const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
    pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: isLocal ? 2500 : 8000
    });

    // Test connection
    const testRes = await pool.query("SELECT 1 AS ready");
    if (!testRes || testRes.rows.length === 0) {
      throw new Error("PostgreSQL ping query did not return expected result.");
    }

    console.log("[Database] Connected to PostgreSQL production database successfully.");

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
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
        created_at VARCHAR(100) NOT NULL
      );

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

      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(255) PRIMARY KEY,
        value TEXT NOT NULL
      );

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
        qr_code_payload TEXT,
        certidnumber VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Active',
        recipient_type VARCHAR(50) DEFAULT 'Student'
      );

      CREATE TABLE IF NOT EXISTS "Certificate" (
        id VARCHAR(255) PRIMARY KEY,
        "studentName" VARCHAR(255) NOT NULL,
        "studentEmail" VARCHAR(255) NOT NULL,
        "courseName" VARCHAR(255) NOT NULL,
        grade VARCHAR(100) NOT NULL,
        "institutionName" VARCHAR(255) DEFAULT 'CODE POINT KENYA',
        "subHeading" VARCHAR(255) DEFAULT 'INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI',
        "addressText" VARCHAR(255) DEFAULT 'Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya',
        "signatory1Name" VARCHAR(255) DEFAULT 'Brenda Wambui',
        "signatory1Title" VARCHAR(255) DEFAULT 'CURRICULUM DIRECTOR - Faculty of Engineering',
        "signatory2Name" VARCHAR(255) DEFAULT 'Code Point Kenya Academic Board & Admin',
        "signatory2Title" VARCHAR(255) DEFAULT 'ISSUED DATE',
        "issueDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        certidnumber VARCHAR(100) UNIQUE,
        "certIdNumber" VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Active',
        recipienttype VARCHAR(50) DEFAULT 'Student',
        "recipientType" VARCHAR(50) DEFAULT 'Student',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE IF NOT EXISTS course_modules (
        id VARCHAR(255) PRIMARY KEY,
        course_id VARCHAR(255) REFERENCES courses(id) ON DELETE CASCADE,
        module_number INTEGER DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        topics TEXT DEFAULT '[]',
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );

      CREATE TABLE IF NOT EXISTS modules (
        id VARCHAR(255) PRIMARY KEY,
        course_id VARCHAR(255),
        module_number INTEGER DEFAULT 1,
        title VARCHAR(255) NOT NULL,
        topics TEXT DEFAULT '[]',
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );

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

      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(255) PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(255),
        actor_name VARCHAR(255) NOT NULL DEFAULT 'Administrator',
        actor_email VARCHAR(255) DEFAULT 'info@codepointkenya.com',
        target_name VARCHAR(255),
        target_email VARCHAR(255),
        details TEXT NOT NULL,
        previous_value TEXT,
        new_value TEXT,
        ip_address VARCHAR(100),
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(event_type);

      CREATE TABLE IF NOT EXISTS video_testimonials (
        id VARCHAR(255) PRIMARY KEY,
        student_name VARCHAR(255) NOT NULL,
        photo_url TEXT,
        thumbnail_url TEXT,
        course_program VARCHAR(255) NOT NULL,
        cohort VARCHAR(100) NOT NULL DEFAULT 'Cohort 14',
        career_role VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        video_url TEXT NOT NULL,
        duration VARCHAR(50) DEFAULT '3:00',
        quote_highlight TEXT NOT NULL,
        is_featured INTEGER DEFAULT 1,
        status VARCHAR(50) NOT NULL DEFAULT 'approved',
        views_count INTEGER DEFAULT 0,
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
      CREATE INDEX IF NOT EXISTS idx_vid_testimonials_featured ON video_testimonials(is_featured);
      CREATE INDEX IF NOT EXISTS idx_vid_testimonials_status ON video_testimonials(status);

      CREATE TABLE IF NOT EXISTS tuition_ledger (
        id VARCHAR(255) PRIMARY KEY,
        student_email VARCHAR(255),
        student_name VARCHAR(255),
        student_phone VARCHAR(100) DEFAULT '',
        course_id VARCHAR(255),
        course_title VARCHAR(255),
        cohort VARCHAR(100) DEFAULT 'Current Cohort',
        total_fee_kes NUMERIC NOT NULL DEFAULT 85000,
        paid_fee_kes NUMERIC NOT NULL DEFAULT 0,
        balance_kes NUMERIC NOT NULL DEFAULT 85000,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        deadline_date VARCHAR(100) DEFAULT '',
        portal_access_granted INTEGER NOT NULL DEFAULT 1,
        installment_plan VARCHAR(255) DEFAULT '5-Month Flexible Installments',
        notes TEXT DEFAULT '',
        updated_at VARCHAR(100),
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
      CREATE INDEX IF NOT EXISTS idx_tl_pg_email ON tuition_ledger(student_email);
      CREATE INDEX IF NOT EXISTS idx_tl_pg_status ON tuition_ledger(payment_status);

      CREATE TABLE IF NOT EXISTS access_control (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        requested_role VARCHAR(50) NOT NULL DEFAULT 'student',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        assigned_role VARCHAR(50),
        full_name VARCHAR(255),
        phone VARCHAR(100),
        course_id VARCHAR(255),
        course_title VARCHAR(255),
        cohort VARCHAR(100),
        attempt_count INTEGER DEFAULT 1,
        last_attempt_at VARCHAR(100),
        reviewed_at VARCHAR(100),
        reviewed_by VARCHAR(255),
        notes TEXT,
        initial_password VARCHAR(255),
        setup_token VARCHAR(255),
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
      CREATE INDEX IF NOT EXISTS idx_ac_pg_email ON access_control(email);
      CREATE INDEX IF NOT EXISTS idx_ac_pg_status ON access_control(status);

      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR(255) PRIMARY KEY,
        rating INTEGER DEFAULT 5,
        full_name VARCHAR(255) NOT NULL,
        role_program VARCHAR(255) NOT NULL,
        organization VARCHAR(255) DEFAULT '',
        testimonial TEXT NOT NULL,
        avatar_url TEXT,
        video_url TEXT,
        thumbnail_url TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'approved',
        is_featured INTEGER DEFAULT 1,
        created_at VARCHAR(100) NOT NULL DEFAULT CURRENT_TIMESTAMP::text
      );
      CREATE INDEX IF NOT EXISTS idx_test_pg_status ON testimonials(status);
      CREATE INDEX IF NOT EXISTS idx_test_pg_featured ON testimonials(is_featured);
    `);

    // Ensure all required columns exist on courses if created earlier
    const alterColumns = [
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
      "ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at VARCHAR(100) DEFAULT CURRENT_TIMESTAMP::text",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS certidnumber VARCHAR(100)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"certIdNumber\" VARCHAR(100)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active'",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(50) DEFAULT 'Student'",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"recipientType\" VARCHAR(50) DEFAULT 'Student'",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS studentname VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"studentName\" VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS studentemail VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"studentEmail\" VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS coursename VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"courseName\" VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS grade VARCHAR(100)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS institutionname VARCHAR(255) DEFAULT 'CODE POINT KENYA'",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"institutionName\" VARCHAR(255) DEFAULT 'CODE POINT KENYA'",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS subheading VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"subHeading\" VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS addresstext VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"addressText\" VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS signatory1name VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"signatory1Name\" VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS signatory1title VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"signatory1Title\" VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS signatory2name VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"signatory2Name\" VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS signatory2title VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"signatory2Title\" VARCHAR(255)",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS issuedate TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"issueDate\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS updatedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE certificates ADD COLUMN IF NOT EXISTS \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE \"Certificate\" ADD COLUMN IF NOT EXISTS certidnumber VARCHAR(100)",
      "ALTER TABLE \"Certificate\" ADD COLUMN IF NOT EXISTS \"certIdNumber\" VARCHAR(100)",
      "ALTER TABLE \"Certificate\" ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active'",
      "ALTER TABLE \"Certificate\" ADD COLUMN IF NOT EXISTS recipienttype VARCHAR(50) DEFAULT 'Student'",
      "ALTER TABLE \"Certificate\" ADD COLUMN IF NOT EXISTS \"recipientType\" VARCHAR(50) DEFAULT 'Student'",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reviewer_name VARCHAR(255)",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS \"reviewerName\" VARCHAR(255)",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS role VARCHAR(255)",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment TEXT",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS avatar_url TEXT",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS \"avatarUrl\" TEXT",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS \"isApproved\" BOOLEAN DEFAULT false",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS \"isFeatured\" BOOLEAN DEFAULT true",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at VARCHAR(100)",
      "ALTER TABLE reviews ADD COLUMN IF NOT EXISTS \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ];
    for (const sql of alterColumns) {
      await pool.query(sql).catch((err: any) => console.warn("[Database] Alter column notice:", err?.message));
    }

    // Seed default courses if empty
    const courseCountRes = await pool.query("SELECT count(*) as count FROM courses");
    const courseCount = Number(courseCountRes.rows[0]?.count || 0);
    if (courseCount === 0) {
      console.log("[Database] Seeding default flagship courses in PostgreSQL...");
      for (const c of DEFAULT_COURSES) {
        await pool.query(
          `INSERT INTO courses (id, title, slug, category, duration_weeks, price_kes, monthly_kes, summary, curriculum, level, delivery_mode, schedule, next_intake, is_featured, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
           ON CONFLICT (id) DO NOTHING`,
          [c.id, c.title, c.slug, c.category, c.duration_weeks, c.price_kes, c.monthly_kes, c.summary, c.curriculum, c.level, c.delivery_mode, c.schedule, c.next_intake, c.is_featured, c.created_at]
        );
      }
    }

    // Seed default admin and accounts if users table is empty
    const userCountRes = await pool.query("SELECT count(*) as count FROM users");
    const userCount = Number(userCountRes.rows[0]?.count || 0);
    if (userCount === 0) {
      console.log("[Database] Seeding default users in PostgreSQL...");
      for (const u of DEFAULT_USERS) {
        await pool.query(
          `INSERT INTO users (id, name, email, password, role, avatar, enrolled_course_id, enrolled_course_title, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO NOTHING`,
          [u.id, u.name, u.email, u.password, u.role, u.avatar, u.enrolled_course_id, u.enrolled_course_title, u.created_at]
        );
      }
    }

    // Seed default site settings if empty
    const settingsCountRes = await pool.query("SELECT count(*) as count FROM site_settings");
    const settingsCount = Number(settingsCountRes.rows[0]?.count || 0);
    if (settingsCount === 0) {
      console.log("[Database] Seeding default site settings in PostgreSQL...");
      for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
        await pool.query(
          `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
          [key, value]
        );
      }
    }

    // Seed default reviews if empty
    const reviewsCountRes = await pool.query("SELECT count(*) as count FROM reviews");
    const reviewsCount = Number(reviewsCountRes.rows[0]?.count || 0);
    if (reviewsCount === 0) {
      console.log("[Database] Seeding initial approved reviews in PostgreSQL...");
      for (const r of DEFAULT_REVIEWS) {
        await pool.query(
          `INSERT INTO reviews (id, rating, full_name, role_program, organization, testimonial, avatar_url, status, is_featured, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [r.id, r.rating, r.full_name, r.role_program, r.organization, r.testimonial, r.avatar_url, r.status, r.is_featured, r.created_at]
        );
      }
    }

    // Seed default assignments if empty
    const asgCountRes = await pool.query("SELECT count(*) as count FROM assignments");
    const asgCount = Number(asgCountRes.rows[0]?.count || 0);
    if (asgCount === 0) {
      console.log("[Database] Seeding initial assignments in PostgreSQL...");
      for (const a of DEFAULT_ASSIGNMENTS) {
        await pool.query(
          `INSERT INTO assignments (id, title, course_title, cohort, description, resource_url, sheets_url, due_date, max_marks, instructor_name, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.title, a.course_title, a.cohort, a.description, a.resource_url, a.sheets_url, a.due_date, a.max_marks, a.instructor_name, a.created_at]
        );
      }
    }

    // Seed default submissions if empty
    const subCountRes = await pool.query("SELECT count(*) as count FROM submissions");
    const subCount = Number(subCountRes.rows[0]?.count || 0);
    if (subCount === 0) {
      console.log("[Database] Seeding initial assignment submissions in PostgreSQL...");
      for (const s of DEFAULT_SUBMISSIONS) {
        await pool.query(
          `INSERT INTO submissions (id, assignment_id, assignment_title, student_name, student_email, course_title, submission_url, notes, marks, feedback, status, submitted_at, marked_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [s.id, s.assignment_id, s.assignment_title, s.student_name, s.student_email, s.course_title, s.submission_url, s.notes, s.marks, s.feedback, s.status, s.submitted_at, s.marked_at]
        );
      }
    }

    // Seed default announcements if empty
    const annCountRes = await pool.query("SELECT count(*) as count FROM announcements");
    const annCount = Number(annCountRes.rows[0]?.count || 0);
    if (annCount === 0) {
      console.log("[Database] Seeding initial announcements in PostgreSQL...");
      for (const a of DEFAULT_ANNOUNCEMENTS) {
        await pool.query(
          `INSERT INTO announcements (id, title, content, category, cohort, course_title, author_name, author_role, is_pinned, priority, action_url, action_label, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [a.id, a.title, a.content, a.category, a.cohort, a.course_title, a.author_name, a.author_role, a.is_pinned, a.priority, a.action_url, a.action_label, a.created_at]
        );
      }
    }

    // Seed default login attempts if empty
    try {
      const attCountRes = await pool.query("SELECT count(*) as count FROM login_attempts");
      const attCount = Number(attCountRes.rows[0]?.count || 0);
      if (attCount === 0) {
        console.log("[Database] Seeding initial login attempts in PostgreSQL...");
        for (const a of DEFAULT_LOGIN_ATTEMPTS) {
          await pool.query(
            `INSERT INTO login_attempts (id, email, requested_role, status, assigned_role, full_name, attempt_count, last_attempt_at, reviewed_at, reviewed_by, notes, initial_password, setup_token, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             ON CONFLICT (id) DO NOTHING`,
            [a.id, a.email, a.requested_role, a.status, a.assigned_role, a.full_name, a.attempt_count, a.last_attempt_at, a.reviewed_at, a.reviewed_by, a.notes, a.initial_password, a.setup_token, a.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] PostgreSQL login_attempts seed warning:", e);
    }

    // Seed default class lectures if empty
    try {
      const lecCountRes = await pool.query("SELECT count(*) as count FROM class_lectures");
      const lecCount = Number(lecCountRes.rows[0]?.count || 0);
      if (lecCount === 0) {
        console.log("[Database] Seeding initial class lectures in PostgreSQL...");
        for (const l of DEFAULT_LECTURES) {
          await pool.query(
            `INSERT INTO class_lectures (id, instructor_email, instructor_name, course_id, course_title, cohort, title, description, day_of_week, start_time, end_time, recurrence, location_type, meeting_link, date, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             ON CONFLICT (id) DO NOTHING`,
            [l.id, l.instructor_email, l.instructor_name, l.course_id, l.course_title, l.cohort, l.title, l.description, l.day_of_week, l.start_time, l.end_time, l.recurrence, l.location_type, l.meeting_link, l.date, l.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] PostgreSQL class_lectures seed warning:", e);
    }

    // Seed default student module progress if empty
    try {
      const progCountRes = await pool.query("SELECT count(*) as count FROM student_module_progress");
      const progCount = Number(progCountRes.rows[0]?.count || 0);
      if (progCount === 0) {
        console.log("[Database] Seeding initial student module progress in PostgreSQL...");
        for (const p of DEFAULT_STUDENT_PROGRESS) {
          await pool.query(
            `INSERT INTO student_module_progress (id, student_email, student_name, course_id, course_title, module_id, module_title, module_number, status, student_notes, student_submission_url, teacher_email, teacher_name, teacher_feedback, requested_at, reviewed_at, completed_at, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
             ON CONFLICT (id) DO NOTHING`,
            [p.id, p.student_email, p.student_name, p.course_id, p.course_title, p.module_id, p.module_title, p.module_number, p.status, p.student_notes, p.student_submission_url, p.teacher_email, p.teacher_name, p.teacher_feedback, p.requested_at, p.reviewed_at, p.completed_at, p.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] PostgreSQL student_module_progress seed warning:", e);
    }

    // Seed student_fee_accounts if empty
    try {
      const feeCountRes = await pool.query("SELECT count(*) as count FROM student_fee_accounts");
      const feeCount = Number(feeCountRes.rows[0]?.count || 0);
      if (feeCount === 0) {
        console.log("[Database] Seeding initial student fee accounts in PostgreSQL...");
        for (const f of DEFAULT_STUDENT_FEES) {
          await pool.query(
            `INSERT INTO student_fee_accounts (id, student_email, student_name, course_id, course_title, cohort, total_fee_kes, paid_fee_kes, balance_kes, payment_status, deadline_date, portal_access_granted, installment_plan, notes, updated_at, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
             ON CONFLICT (id) DO NOTHING`,
            [f.id, f.student_email, f.student_name, f.course_id, f.course_title, f.cohort, f.total_fee_kes, f.paid_fee_kes, f.balance_kes, f.payment_status, f.deadline_date, f.portal_access_granted, f.installment_plan, f.notes, f.updated_at, f.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] PostgreSQL student_fee_accounts seed warning:", e);
    }

    // Seed activity_logs if empty
    try {
      const logCountRes = await pool.query("SELECT count(*) as count FROM activity_logs");
      const logCount = Number(logCountRes.rows[0]?.count || 0);
      if (logCount === 0) {
        console.log("[Database] Seeding initial activity logs in PostgreSQL...");
        for (const l of DEFAULT_ACTIVITY_LOGS) {
          await pool.query(
            `INSERT INTO activity_logs (id, event_type, action, entity_type, entity_id, actor_name, actor_email, target_name, target_email, details, previous_value, new_value, ip_address, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
             ON CONFLICT (id) DO NOTHING`,
            [l.id, l.event_type, l.action, l.entity_type, l.entity_id, l.actor_name, l.actor_email, l.target_name, l.target_email, l.details, l.previous_value, l.new_value, l.ip_address, l.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] PostgreSQL activity_logs seed warning:", e);
    }

    // Seed default video testimonials if empty
    try {
      const vidCountRes = await pool.query("SELECT count(*) as count FROM video_testimonials");
      const vidCount = Number(vidCountRes.rows[0]?.count || 0);
      if (vidCount === 0) {
        console.log("[Database] Seeding initial video testimonials in PostgreSQL...");
        for (const v of DEFAULT_VIDEO_TESTIMONIALS) {
          await pool.query(
            `INSERT INTO video_testimonials (id, student_name, photo_url, thumbnail_url, course_program, cohort, career_role, company, video_url, duration, quote_highlight, is_featured, status, views_count, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             ON CONFLICT (id) DO NOTHING`,
            [v.id, v.student_name, v.photo_url, v.thumbnail_url, v.course_program, v.cohort, v.career_role, v.company, v.video_url, v.duration, v.quote_highlight, v.is_featured, v.status, v.views_count, v.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] PostgreSQL video_testimonials seed warning:", e);
    }

    const isNeon = connectionString.includes("neon.tech");
    const isSupabase = connectionString.includes("supabase.co");
    const providerName = isNeon
      ? "Neon PostgreSQL (Cloud Serverless)"
      : isSupabase
      ? "Supabase PostgreSQL (Cloud Database)"
      : "PostgreSQL (Production Cloud Database)";

    const appDb: AppDatabase = {
      type: "postgres",
      providerName,
      activeConnectionUrl: connectionString,
      rawPostgresPool: pool,
      async run(sql: string, params: any[] = []) {
        const converted = convertSqlForPostgres(sql);
        return pool.query(converted, params);
      },
      async exec(sql: string) {
        return pool.query(sql);
      },
      async queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        const converted = convertSqlForPostgres(sql);
        const res = await pool.query(converted, params);
        return res.rows as T[];
      },
      async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
        const converted = convertSqlForPostgres(sql);
        const res = await pool.query(converted, params);
        return (res.rows[0] as T) || null;
      }
    };

    return appDb;
  } catch (err: any) {
    if (pool) {
      await pool.end().catch(() => {});
    }
    const masked = connectionString.includes("@") ? connectionString.split("@")[1] : connectionString;
    console.log(`[Database] PostgreSQL candidate (${masked}) not reachable: ${err?.code || err?.message}`);
    return null;
  }
}

/**
 * Fallback: In-Memory SQL & Mock Database for Resiliency
 */
function createInMemoryDb(): AppDatabase {
  console.log("[Database] Initializing high-resiliency in-memory data store.");

  const tables: Record<string, any[]> = {
    courses: [...DEFAULT_COURSES],
    applications: [],
    users: [...DEFAULT_USERS],
    site_settings: Object.entries(DEFAULT_SITE_SETTINGS).map(([key, value]) => ({ key, value })),
    messages: [],
    reviews: [...DEFAULT_REVIEWS],
    assignments: [...DEFAULT_ASSIGNMENTS],
    submissions: [...DEFAULT_SUBMISSIONS],
    certificates: [...DEFAULT_CERTIFICATES],
    announcements: [...DEFAULT_ANNOUNCEMENTS],
    login_attempts: [...DEFAULT_LOGIN_ATTEMPTS],
    class_lectures: [...DEFAULT_LECTURES],
    student_module_progress: [...DEFAULT_STUDENT_PROGRESS],
    student_fee_accounts: [...DEFAULT_STUDENT_FEES],
    activity_logs: [...DEFAULT_ACTIVITY_LOGS],
    video_testimonials: [...DEFAULT_VIDEO_TESTIMONIALS]
  };

  return {
    type: "memory",
    providerName: "In-Memory Store (Resilient Fallback)",
    async run(sql: string, params: any[] = []) {
      const lower = sql.toLowerCase();

      // INSERT INTO courses
      if (lower.includes("insert into courses")) {
        const row = {
          id: params[0],
          title: params[1],
          slug: params[2],
          category: params[3],
          duration_weeks: Number(params[4]),
          price_kes: Number(params[5]),
          monthly_kes: Number(params[6]),
          summary: params[7],
          curriculum: params[8],
          level: params[9],
          delivery_mode: params[10],
          schedule: params[11],
          next_intake: params[12],
          is_featured: Number(params[13]),
          created_at: params[14]
        };
        const idx = tables.courses.findIndex(c => c.id === row.id);
        if (idx >= 0) tables.courses[idx] = row;
        else tables.courses.push(row);
        return;
      }

      // UPDATE courses
      if (lower.includes("update courses set")) {
        const courseId = params[params.length - 1];
        const existing = tables.courses.find(c => c.id === courseId);
        if (existing) {
          existing.title = params[0];
          existing.slug = params[1];
          existing.category = params[2];
          existing.duration_weeks = Number(params[3]);
          existing.price_kes = Number(params[4]);
          existing.monthly_kes = Number(params[5]);
          existing.summary = params[6];
          existing.curriculum = params[7];
          existing.level = params[8];
          existing.delivery_mode = params[9];
          existing.schedule = params[10];
          existing.next_intake = params[11];
          existing.is_featured = Number(params[12]);
        }
        return;
      }

      // DELETE FROM courses
      if (lower.includes("delete from courses")) {
        const id = params[0];
        tables.courses = tables.courses.filter(c => c.id !== id);
        return;
      }

      // INSERT INTO applications
      if (lower.includes("insert into applications")) {
        tables.applications.push({
          id: params[0],
          tracking_code: params[1],
          full_name: params[2],
          email: params[3],
          phone: params[4],
          course_id: params[5],
          course_title: params[6],
          intake: params[7],
          experience_level: params[8],
          motivation: params[9],
          status: "pending",
          notes: "",
          created_at: params[10]
        });
        return;
      }

      // UPDATE applications
      if (lower.includes("update applications set")) {
        const id = params[params.length - 1];
        const existing = tables.applications.find(a => a.id === id);
        if (existing) {
          existing.status = params[0];
          existing.notes = params[1];
        }
        return;
      }

      // DELETE FROM applications
      if (lower.includes("delete from applications")) {
        const id = params[0];
        tables.applications = tables.applications.filter(a => a.id !== id);
        return;
      }

      // INSERT OR UPDATE site_settings
      if (lower.includes("site_settings")) {
        const key = params[0];
        const value = params[1];
        const idx = tables.site_settings.findIndex(s => s.key === key);
        if (idx >= 0) tables.site_settings[idx].value = value;
        else tables.site_settings.push({ key, value });
        return;
      }

      // INSERT reviews
      if (lower.includes("insert into reviews")) {
        const newReview: any = {
          id: params[0],
          rating: Number(params[1]) || 5,
          full_name: params[2],
          reviewer_name: params[2],
          reviewerName: params[2],
          role_program: params[3],
          role: params[3],
          organization: params[4] || "",
          testimonial: params[5],
          comment: params[5],
          avatar_url: params[6] || "",
          avatarUrl: params[6] || "",
          status: params[7] || "pending",
          is_approved: params[7] === "approved" || params[8] === 1 ? 1 : 0,
          isApproved: params[7] === "approved" || params[8] === 1,
          is_featured: params[9] !== undefined ? Number(params[9]) : 1,
          isFeatured: params[9] !== undefined ? Boolean(params[9]) : true,
          created_at: params[10] || new Date().toISOString(),
          createdAt: params[10] || new Date().toISOString()
        };
        const existingIdx = tables.reviews.findIndex(r => r.id === newReview.id);
        if (existingIdx >= 0) {
          tables.reviews[existingIdx] = { ...tables.reviews[existingIdx], ...newReview };
        } else {
          tables.reviews.unshift(newReview);
        }
        return;
      }

      // UPDATE reviews
      if (lower.includes("update reviews")) {
        const id = params[params.length - 1];
        const existing = tables.reviews.find(r => r.id === id);
        if (existing) {
          params.slice(0, -1).forEach(val => {
            if (typeof val === 'string') {
              if (['approved', 'pending', 'rejected'].includes(val)) {
                existing.status = val;
                existing.is_approved = val === 'approved' ? 1 : 0;
                existing.isApproved = val === 'approved';
              }
            } else if (typeof val === 'boolean') {
              existing.isApproved = val;
              existing.is_approved = val ? 1 : 0;
              existing.status = val ? 'approved' : 'pending';
            }
          });
        }
        return;
      }

      // DELETE FROM reviews
      if (lower.includes("delete from reviews")) {
        const id = params[0];
        tables.reviews = tables.reviews.filter(r => r.id !== id);
        return;
      }

      // INSERT messages
      if (lower.includes("insert into messages")) {
        tables.messages.push({
          id: params[0],
          name: params[1],
          email: params[2],
          phone: params[3],
          subject: params[4],
          course_title: params[5],
          message: params[6],
          status: "pending",
          notes: "",
          created_at: params[7]
        });
        return;
      }

      // DELETE FROM messages
      if (lower.includes("delete from messages")) {
        const id = params[0];
        tables.messages = tables.messages.filter(m => m.id !== id);
        return;
      }

      // INSERT INTO assignments
      if (lower.includes("insert into assignments")) {
        tables.assignments.push({
          id: params[0],
          title: params[1],
          course_title: params[2],
          cohort: params[3],
          description: params[4],
          resource_url: params[5],
          sheets_url: params[6],
          due_date: params[7],
          max_marks: Number(params[8] || 100),
          instructor_name: params[9],
          created_at: params[10]
        });
        return;
      }

      // UPDATE assignments
      if (lower.includes("update assignments set")) {
        const id = params[params.length - 1];
        const existing = tables.assignments.find(a => a.id === id);
        if (existing) {
          existing.title = params[0];
          existing.course_title = params[1];
          existing.cohort = params[2];
          existing.description = params[3];
          existing.resource_url = params[4];
          existing.sheets_url = params[5];
          existing.due_date = params[6];
          existing.max_marks = Number(params[7]);
          existing.instructor_name = params[8];
        }
        return;
      }

      // DELETE FROM assignments
      if (lower.includes("delete from assignments")) {
        const id = params[0];
        tables.assignments = tables.assignments.filter(a => a.id !== id);
        return;
      }

      // INSERT INTO submissions
      if (lower.includes("insert into submissions")) {
        tables.submissions.push({
          id: params[0],
          assignment_id: params[1],
          assignment_title: params[2],
          student_name: params[3],
          student_email: params[4],
          course_title: params[5],
          submission_url: params[6],
          notes: params[7],
          marks: params[8] !== null && params[8] !== undefined ? Number(params[8]) : null,
          feedback: params[9] || "",
          status: params[10] || "Pending",
          submitted_at: params[11],
          marked_at: params[12] || null
        });
        return;
      }

      // UPDATE submissions
      if (lower.includes("update submissions set")) {
        const id = params[params.length - 1];
        const existing = tables.submissions.find(s => s.id === id);
        if (existing) {
          existing.marks = params[0] !== null && params[0] !== undefined ? Number(params[0]) : null;
          existing.feedback = params[1] || "";
          existing.status = params[2] || "Pending";
          existing.marked_at = params[3] || new Date().toISOString();
        }
        return;
      }

      // DELETE FROM submissions
      if (lower.includes("delete from submissions")) {
        const id = params[0];
        tables.submissions = tables.submissions.filter(s => s.id !== id);
        return;
      }

      // INSERT INTO certificates
      if (lower.includes("insert into certificates")) {
        tables.certificates.push({
          id: params[0],
          verification_id: params[1],
          student_name: params[2],
          student_email: params[3],
          course_title: params[4],
          cohort: params[5],
          completion_date: params[6],
          final_grade: params[7] || "Distinction",
          approved_by: params[8] || "Academic Board",
          approved_at: params[9],
          qr_code_payload: params[10],
          studentName: params[11] || params[2],
          studentEmail: params[12] || params[3],
          courseName: params[13] || params[4],
          grade: params[14] || params[7] || "Distinction",
          institutionName: params[15] || "CODE POINT KENYA",
          subHeading: params[16] || "INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI",
          addressText: params[17] || "Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya",
          signatory1Name: params[18] || "Brenda Wambui",
          signatory1Title: params[19] || "CURRICULUM DIRECTOR - Faculty of Engineering",
          signatory2Name: params[20] || params[8] || "Code Point Kenya Academic Board & Admin",
          signatory2Title: params[21] || "ISSUED DATE",
          issueDate: params[22] || params[6] || new Date().toISOString(),
          certIdNumber: params[23] || params[1],
          createdAt: params[24] || params[9] || new Date().toISOString(),
          updatedAt: params[25] || new Date().toISOString()
        });
        return;
      }

      // UPDATE certificates
      if (lower.includes("update certificates set")) {
        const id = params[params.length - 1];
        const existing = tables.certificates.find(c => c.id === id || c.verification_id === id || c.certIdNumber === id);
        if (existing && params.length >= 10) {
          existing.verification_id = params[0];
          existing.student_name = params[1];
          existing.student_email = params[2];
          existing.course_title = params[3];
          existing.cohort = params[4];
          existing.completion_date = params[5];
          existing.final_grade = params[6];
          existing.approved_by = params[7];
          existing.qr_code_payload = params[8];
          existing.studentName = params[9] || params[1];
          existing.studentEmail = params[10] || params[2];
          existing.courseName = params[11] || params[3];
          existing.grade = params[12] || params[6];
          existing.institutionName = params[13] || existing.institutionName;
          existing.subHeading = params[14] || existing.subHeading;
          existing.addressText = params[15] || existing.addressText;
          existing.signatory1Name = params[16] || existing.signatory1Name;
          existing.signatory1Title = params[17] || existing.signatory1Title;
          existing.signatory2Name = params[18] || existing.signatory2Name;
          existing.signatory2Title = params[19] || existing.signatory2Title;
          existing.issueDate = params[20] || existing.issueDate;
          existing.certIdNumber = params[21] || params[0];
          existing.updatedAt = params[22] || new Date().toISOString();
        }
        return;
      }

      // DELETE FROM certificates
      if (lower.includes("delete from certificates")) {
        const id = params[0];
        tables.certificates = tables.certificates.filter(c => c.id !== id && c.verification_id !== id && c.certIdNumber !== id);
        return;
      }
      // INSERT INTO login_attempts
      if (lower.includes("insert into login_attempts")) {
        tables.login_attempts.push({
          id: params[0],
          email: params[1],
          requested_role: params[2],
          status: params[3],
          assigned_role: params[4],
          full_name: params[5],
          attempt_count: params[6] || 1,
          last_attempt_at: params[7],
          reviewed_at: params[8],
          reviewed_by: params[9],
          notes: params[10],
          initial_password: params[11],
          setup_token: params[12],
          created_at: params[13]
        });
        return;
      }

      // UPDATE login_attempts
      if (lower.includes("update login_attempts")) {
        const id = params[params.length - 1];
        const existing = tables.login_attempts.find(a => a.id === id);
        if (existing) {
          existing.status = params[0];
          existing.assigned_role = params[1];
          existing.notes = params[2];
          existing.reviewed_at = params[3];
          existing.reviewed_by = params[4];
        }
        return;
      }

      // DELETE FROM login_attempts
      if (lower.includes("delete from login_attempts")) {
        const id = params[0];
        tables.login_attempts = tables.login_attempts.filter(a => a.id !== id);
        return;
      }

      // INSERT INTO class_lectures
      if (lower.includes("insert into class_lectures")) {
        tables.class_lectures.push({
          id: params[0],
          instructor_email: params[1],
          instructor_name: params[2],
          course_id: params[3],
          course_title: params[4],
          cohort: params[5],
          title: params[6],
          description: params[7],
          day_of_week: params[8],
          start_time: params[9],
          end_time: params[10],
          recurrence: params[11],
          location_type: params[12],
          meeting_link: params[13],
          date: params[14],
          created_at: params[15]
        });
        return;
      }

      // DELETE FROM class_lectures
      if (lower.includes("delete from class_lectures")) {
        const id = params[0];
        tables.class_lectures = tables.class_lectures.filter(l => l.id !== id);
        return;
      }

      // INSERT / REPLACE student_module_progress
      if (lower.includes("insert into student_module_progress") || lower.includes("insert or replace into student_module_progress")) {
        const id = params[0];
        const existingIdx = tables.student_module_progress.findIndex(p => p.id === id);
        const row = {
          id: params[0],
          student_email: params[1],
          student_name: params[2],
          course_id: params[3],
          course_title: params[4],
          module_id: params[5],
          module_title: params[6],
          module_number: Number(params[7]) || 1,
          status: params[8] || 'not_started',
          student_notes: params[9] || "",
          student_submission_url: params[10] || "",
          teacher_email: params[11] || null,
          teacher_name: params[12] || null,
          teacher_feedback: params[13] || null,
          requested_at: params[14] || null,
          reviewed_at: params[15] || null,
          completed_at: params[16] || null,
          created_at: params[17] || new Date().toISOString()
        };
        if (existingIdx >= 0) {
          tables.student_module_progress[existingIdx] = { ...tables.student_module_progress[existingIdx], ...row };
        } else {
          tables.student_module_progress.push(row);
        }
        return;
      }

      // UPDATE student_module_progress
      if (lower.includes("update student_module_progress")) {
        const id = params[params.length - 1];
        const row = tables.student_module_progress.find(p => p.id === id);
        if (row) {
          if (lower.includes("status = ?") && lower.includes("completed_at = ?")) {
            row.status = params[0];
            row.completed_at = params[1];
          } else if (lower.includes("status = ?") && lower.includes("teacher_feedback = ?")) {
            row.status = params[0];
            row.teacher_email = params[1];
            row.teacher_name = params[2];
            row.teacher_feedback = params[3];
            row.reviewed_at = params[4];
          } else if (lower.includes("status = ?")) {
            row.status = params[0];
          }
        }
        return;
      }

      // INSERT / REPLACE student_fee_accounts
      if (lower.includes("insert into student_fee_accounts") || lower.includes("insert or replace into student_fee_accounts")) {
        const id = params[0];
        const existingIdx = tables.student_fee_accounts.findIndex(f => f.id === id);
        const row = {
          id: params[0],
          student_email: params[1],
          student_name: params[2],
          course_id: params[3],
          course_title: params[4],
          cohort: params[5] || 'Current Cohort',
          total_fee_kes: Number(params[6] || 85000),
          paid_fee_kes: Number(params[7] || 0),
          balance_kes: Number(params[8] !== undefined ? params[8] : Math.max(0, Number(params[6] || 85000) - Number(params[7] || 0))),
          payment_status: params[9] || 'pending',
          deadline_date: params[10] || '',
          portal_access_granted: params[11] !== undefined ? (Number(params[11]) || 0) : 1,
          installment_plan: params[12] || '5-Month Flexible Installments',
          notes: params[13] || '',
          updated_at: params[14] || new Date().toISOString(),
          created_at: params[15] || new Date().toISOString()
        };
        if (existingIdx >= 0) {
          tables.student_fee_accounts[existingIdx] = { ...tables.student_fee_accounts[existingIdx], ...row };
        } else {
          tables.student_fee_accounts.push(row);
        }
        return;
      }

      // UPDATE student_fee_accounts
      if (lower.includes("update student_fee_accounts")) {
        const id = params[params.length - 1];
        const row = tables.student_fee_accounts.find(f => f.id === id || String(f.student_email).toLowerCase() === String(id).toLowerCase());
        if (row) {
          if (lower.includes("portal_access_granted = ?")) {
            row.portal_access_granted = Number(params[0]);
            row.updated_at = new Date().toISOString();
          } else if (lower.includes("total_fee_kes = ?")) {
            row.total_fee_kes = Number(params[0]);
            row.paid_fee_kes = Number(params[1]);
            row.balance_kes = Number(params[2]);
            row.payment_status = params[3];
            row.deadline_date = params[4];
            row.portal_access_granted = Number(params[5]);
            row.installment_plan = params[6];
            row.notes = params[7];
            row.updated_at = params[8] || new Date().toISOString();
          }
        }
        return;
      }

      // DELETE FROM student_fee_accounts
      if (lower.includes("delete from student_fee_accounts")) {
        const id = params[0];
        tables.student_fee_accounts = tables.student_fee_accounts.filter(f => f.id !== id && String(f.student_email).toLowerCase() !== String(id).toLowerCase());
        return;
      }

      // INSERT INTO activity_logs
      if (lower.includes("insert into activity_logs")) {
        const row = {
          id: params[0],
          event_type: params[1],
          action: params[2],
          entity_type: params[3],
          entity_id: params[4] || null,
          actor_name: params[5] || 'Administrator',
          actor_email: params[6] || 'info@codepointkenya.com',
          target_name: params[7] || null,
          target_email: params[8] || null,
          details: params[9] || '',
          previous_value: params[10] || null,
          new_value: params[11] || null,
          ip_address: params[12] || null,
          created_at: params[13] || new Date().toISOString()
        };
        tables.activity_logs.unshift(row);
        return;
      }

      // DELETE FROM activity_logs
      if (lower.includes("delete from activity_logs")) {
        if (params.length > 0) {
          tables.activity_logs = tables.activity_logs.filter(l => l.id !== params[0]);
        } else {
          tables.activity_logs = [];
        }
        return;
      }

      // INSERT INTO video_testimonials
      if (lower.includes("insert into video_testimonials")) {
        const row = {
          id: params[0],
          student_name: params[1],
          photo_url: params[2] || null,
          thumbnail_url: params[3] || null,
          course_program: params[4],
          cohort: params[5] || '',
          career_role: params[6] || '',
          company: params[7] || '',
          video_url: params[8],
          duration: params[9] || '',
          quote_highlight: params[10] || '',
          is_featured: params[11] !== undefined ? (params[11] ? 1 : 0) : 1,
          status: params[12] || 'approved',
          views_count: Number(params[13] || 0),
          created_at: params[14] || new Date().toISOString()
        };
        const existingIdx = tables.video_testimonials.findIndex(v => v.id === row.id);
        if (existingIdx >= 0) {
          tables.video_testimonials[existingIdx] = row;
        } else {
          tables.video_testimonials.unshift(row);
        }
        return;
      }

      // UPDATE video_testimonials
      if (lower.includes("update video_testimonials")) {
        const targetId = params[params.length - 1];
        const v = tables.video_testimonials.find(t => t.id === targetId);
        if (v) {
          if (lower.includes("views_count = views_count + 1")) {
            v.views_count = (v.views_count || 0) + 1;
            return;
          }
          if (lower.includes("is_featured = ?") && params.length === 2) {
            v.is_featured = params[0] ? 1 : 0;
            return;
          }
          if (lower.includes("status = ?") && params.length === 2) {
            v.status = params[0];
            return;
          }
          if (params.length >= 12) {
            v.student_name = params[0];
            v.photo_url = params[1];
            v.thumbnail_url = params[2];
            v.course_program = params[3];
            v.cohort = params[4];
            v.career_role = params[5];
            v.company = params[6];
            v.video_url = params[7];
            v.duration = params[8];
            v.quote_highlight = params[9];
            v.is_featured = params[10] ? 1 : 0;
            v.status = params[11];
          }
        }
        return;
      }

      // DELETE FROM video_testimonials
      if (lower.includes("delete from video_testimonials")) {
        const id = params[0];
        tables.video_testimonials = tables.video_testimonials.filter(v => v.id !== id);
        return;
      }
    },
    async exec() {},
    async queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
      const lower = sql.toLowerCase();
      if (lower.includes("from video_testimonials")) {
        let list = [...tables.video_testimonials];
        if (lower.includes("status = 'approved'")) {
          list = list.filter(v => v.status === 'approved');
        } else if (lower.includes("status = ?")) {
          const s = params[0];
          list = list.filter(v => v.status === s);
        }
        if (lower.includes("is_featured = 1")) {
          list = list.filter(v => Number(v.is_featured) === 1);
        }
        if (lower.includes("order by is_featured desc")) {
          list.sort((a, b) => Number(b.is_featured || 0) - Number(a.is_featured || 0));
        }
        return list as unknown as T[];
      }
      if (lower.includes("from activity_logs")) {
        let list = [...tables.activity_logs];
        if (lower.includes("event_type = ?")) {
          const type = params[0];
          list = list.filter(l => l.event_type === type);
        }
        return list as unknown as T[];
      }
      if (lower.includes("from student_fee_accounts")) {
        let list = [...tables.student_fee_accounts];
        if (lower.includes("lower(student_email) = ?") || lower.includes("student_email = ?")) {
          const email = String(params[0] || "").toLowerCase();
          list = list.filter(f => String(f.student_email).toLowerCase() === email);
        }
        if (lower.includes("payment_status = ?")) {
          const status = params[0];
          list = list.filter(f => f.payment_status === status);
        }
        return list as unknown as T[];
      }
      if (lower.includes("from student_module_progress")) {
        let list = [...tables.student_module_progress];
        if (lower.includes("lower(student_email) = ?") || lower.includes("student_email = ?")) {
          const email = String(params[0] || "").toLowerCase();
          list = list.filter(p => String(p.student_email).toLowerCase() === email);
        }
        if (lower.includes("course_id = ?")) {
          const courseId = params.length > 1 ? params[1] : params[0];
          list = list.filter(p => p.course_id === courseId);
        }
        return list as unknown as T[];
      }
      if (lower.includes("from courses")) {
        return [...tables.courses] as unknown as T[];
      }
      if (lower.includes("from applications")) {
        return [...tables.applications] as unknown as T[];
      }
      if (lower.includes("from users")) {
        return [...tables.users] as unknown as T[];
      }
      if (lower.includes("from site_settings")) {
        return [...tables.site_settings] as unknown as T[];
      }
      if (lower.includes("from messages")) {
        return [...tables.messages] as unknown as T[];
      }
      if (lower.includes("from reviews")) {
        return [...tables.reviews] as unknown as T[];
      }
      if (lower.includes("from assignments")) {
        return [...tables.assignments] as unknown as T[];
      }
      if (lower.includes("from submissions")) {
        return [...tables.submissions] as unknown as T[];
      }
      if (lower.includes("from certificates")) {
        return [...tables.certificates] as unknown as T[];
      }
      if (lower.includes("from announcements")) {
        return [...tables.announcements] as unknown as T[];
      }
      if (lower.includes("from login_attempts")) {
        return [...tables.login_attempts] as unknown as T[];
      }
      if (lower.includes("from class_lectures")) {
        return [...tables.class_lectures] as unknown as T[];
      }
      return [] as T[];
    },
    async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
      const rows = await (this as any).queryAll(sql, params);
      const lower = sql.toLowerCase();
      if (params.length > 0) {
        if (lower.includes("where id =")) {
          const matched = rows.find((r: any) => r.id === params[0]);
          return (matched as T) || null;
        }
        if (lower.includes("where lower(email) =")) {
          const matched = rows.find((r: any) => String(r.email).toLowerCase() === String(params[0]).toLowerCase());
          return (matched as T) || null;
        }
        if (lower.includes("where lower(student_email) =") || lower.includes("where student_email =")) {
          const matched = rows.find((r: any) => String(r.student_email).toLowerCase() === String(params[0]).toLowerCase());
          return (matched as T) || null;
        }
        if (lower.includes("where slug =")) {
          const matched = rows.find((r: any) => r.slug === params[0]);
          return (matched as T) || null;
        }
      }
      return rows.length > 0 ? rows[0] : null;
    }
  };
}

/**
 * Initialize SQLite using sql.js
 */
async function initSqlite(): Promise<AppDatabase | null> {
  try {
    let SQL: any = null;
    const wasmPaths = [
      path.join(process.cwd(), "node_modules", "sql.js", "dist", "sql-wasm.wasm"),
      path.join(currentDirname, "sql-wasm.wasm"),
      path.join(process.cwd(), "sql-wasm.wasm")
    ];

    const foundWasm = wasmPaths.find(p => fs.existsSync(p));
    if (foundWasm) {
      const wasmBinary = fs.readFileSync(foundWasm);
      SQL = await initSqlJs({ wasmBinary });
    } else {
      SQL = await initSqlJs();
    }

    if (!SQL) return null;

    // In serverless environments, copy sqlite if found
    if (isServerless && !fs.existsSync(DB_FILE)) {
      const rootDbFile = path.join(process.cwd(), "codepoint.sqlite");
      if (fs.existsSync(rootDbFile)) {
        try {
          fs.copyFileSync(rootDbFile, DB_FILE);
        } catch (err) {
          console.warn("[Database] Could not copy bundled sqlite to /tmp:", err);
        }
      }
    }

    let sqliteInstance: any = null;
    if (fs.existsSync(DB_FILE)) {
      try {
        const fileBuffer = fs.readFileSync(DB_FILE);
        sqliteInstance = new SQL.Database(fileBuffer);
      } catch (e) {
        console.warn("[Database] Could not load existing sqlite file, initializing fresh:", e);
        sqliteInstance = new SQL.Database();
      }
    } else {
      sqliteInstance = new SQL.Database();
    }

    // Init schema
    sqliteInstance.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        duration_weeks INTEGER NOT NULL,
        price_kes INTEGER NOT NULL,
        monthly_kes INTEGER NOT NULL,
        summary TEXT NOT NULL,
        curriculum TEXT NOT NULL,
        level TEXT NOT NULL,
        delivery_mode TEXT NOT NULL,
        schedule TEXT NOT NULL,
        next_intake TEXT NOT NULL,
        is_featured INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS applications (
        id TEXT PRIMARY KEY,
        tracking_code TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        course_id TEXT NOT NULL,
        course_title TEXT NOT NULL,
        intake TEXT NOT NULL,
        experience_level TEXT NOT NULL,
        motivation TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT,
        enrolled_course_id TEXT,
        enrolled_course_title TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        subject TEXT,
        course_title TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        rating INTEGER NOT NULL DEFAULT 5,
        full_name TEXT NOT NULL,
        reviewer_name TEXT,
        reviewerName TEXT,
        role TEXT,
        role_program TEXT NOT NULL,
        organization TEXT NOT NULL,
        comment TEXT,
        testimonial TEXT NOT NULL,
        avatar_url TEXT,
        avatarUrl TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        is_approved INTEGER DEFAULT 0,
        isApproved INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 1,
        isFeatured INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        createdAt TEXT
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        course_title TEXT NOT NULL,
        cohort TEXT NOT NULL DEFAULT 'Cohort 14',
        description TEXT,
        resource_url TEXT,
        sheets_url TEXT,
        due_date TEXT NOT NULL,
        max_marks INTEGER DEFAULT 100,
        instructor_name TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        assignment_id TEXT NOT NULL,
        assignment_title TEXT NOT NULL,
        student_name TEXT NOT NULL,
        student_email TEXT NOT NULL,
        course_title TEXT NOT NULL,
        submission_url TEXT NOT NULL,
        notes TEXT,
        marks INTEGER,
        feedback TEXT,
        status TEXT NOT NULL DEFAULT 'Pending',
        submitted_at TEXT NOT NULL,
        marked_at TEXT
      );

      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY,
        verification_id TEXT UNIQUE NOT NULL,
        student_name TEXT NOT NULL,
        student_email TEXT NOT NULL,
        course_title TEXT NOT NULL,
        cohort TEXT NOT NULL,
        completion_date TEXT NOT NULL,
        final_grade TEXT NOT NULL DEFAULT 'Distinction',
        approved_by TEXT NOT NULL DEFAULT 'Academic Board',
        approved_at TEXT NOT NULL,
        qr_code_payload TEXT
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Class Update',
        cohort TEXT NOT NULL DEFAULT 'All Cohorts',
        course_title TEXT NOT NULL DEFAULT 'All Programs',
        author_name TEXT NOT NULL DEFAULT 'Faculty Lead',
        author_role TEXT NOT NULL DEFAULT 'Lead Instructor',
        is_pinned INTEGER DEFAULT 0,
        priority TEXT NOT NULL DEFAULT 'Normal',
        action_url TEXT,
        action_label TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS login_attempts (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        requested_role TEXT NOT NULL DEFAULT 'student',
        status TEXT NOT NULL DEFAULT 'pending',
        assigned_role TEXT,
        full_name TEXT,
        attempt_count INTEGER DEFAULT 1,
        last_attempt_at TEXT NOT NULL,
        reviewed_at TEXT,
        reviewed_by TEXT,
        notes TEXT,
        initial_password TEXT,
        setup_token TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS class_lectures (
        id TEXT PRIMARY KEY,
        instructor_email TEXT NOT NULL,
        instructor_name TEXT NOT NULL,
        course_id TEXT NOT NULL,
        course_title TEXT NOT NULL,
        cohort TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        recurrence TEXT NOT NULL DEFAULT 'Weekly',
        location_type TEXT NOT NULL DEFAULT 'Online Google Meet',
        meeting_link TEXT,
        date TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS student_module_progress (
        id TEXT PRIMARY KEY,
        student_email TEXT NOT NULL,
        student_name TEXT NOT NULL,
        course_id TEXT NOT NULL,
        course_title TEXT NOT NULL,
        module_id TEXT NOT NULL,
        module_title TEXT NOT NULL,
        module_number INTEGER DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'not_started',
        student_notes TEXT DEFAULT '',
        student_submission_url TEXT DEFAULT '',
        teacher_email TEXT,
        teacher_name TEXT,
        teacher_feedback TEXT DEFAULT '',
        requested_at TEXT,
        reviewed_at TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS student_fee_accounts (
        id TEXT PRIMARY KEY,
        student_email TEXT NOT NULL,
        student_name TEXT NOT NULL,
        student_phone TEXT DEFAULT '',
        course_id TEXT NOT NULL,
        course_title TEXT NOT NULL,
        cohort TEXT NOT NULL DEFAULT 'Current Cohort',
        total_fee_kes REAL NOT NULL DEFAULT 85000,
        paid_fee_kes REAL NOT NULL DEFAULT 0,
        balance_kes REAL NOT NULL DEFAULT 85000,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        deadline_date TEXT NOT NULL DEFAULT '',
        portal_access_granted INTEGER NOT NULL DEFAULT 1,
        installment_plan TEXT DEFAULT '5-Month Flexible Installments',
        notes TEXT DEFAULT '',
        last_alert_sent_at TEXT,
        last_alert_type TEXT,
        updated_at TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sfa_email ON student_fee_accounts(student_email);
      CREATE INDEX IF NOT EXISTS idx_sfa_status ON student_fee_accounts(payment_status);

      CREATE TABLE IF NOT EXISTS fee_notifications (
        id TEXT PRIMARY KEY,
        student_fee_id TEXT,
        student_name TEXT NOT NULL,
        student_email TEXT NOT NULL,
        student_phone TEXT NOT NULL DEFAULT '',
        course_title TEXT NOT NULL DEFAULT '',
        channel TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        message_body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'delivered',
        balance_kes REAL NOT NULL DEFAULT 0,
        deadline_date TEXT NOT NULL DEFAULT '',
        triggered_by TEXT NOT NULL DEFAULT 'automated_rule',
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_fn_email ON fee_notifications(student_email);
      CREATE INDEX IF NOT EXISTS idx_fn_type ON fee_notifications(alert_type);
      CREATE INDEX IF NOT EXISTS idx_fn_time ON fee_notifications(created_at);

      CREATE TABLE IF NOT EXISTS fee_notification_settings (
        id TEXT PRIMARY KEY,
        auto_deadline_alerts_enabled INTEGER DEFAULT 1,
        deadline_days_threshold INTEGER DEFAULT 5,
        auto_overdue_alerts_enabled INTEGER DEFAULT 1,
        preferred_channel TEXT DEFAULT 'both',
        sms_sender_id TEXT DEFAULT 'CODEPOINT',
        email_sender_name TEXT DEFAULT 'Code Point Kenya Finance',
        paybill_number TEXT DEFAULT '522522',
        whatsapp_finance_phone TEXT DEFAULT '+254 756 295 128',
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        actor_name TEXT NOT NULL DEFAULT 'Administrator',
        actor_email TEXT DEFAULT 'info@codepointkenya.com',
        target_name TEXT,
        target_email TEXT,
        details TEXT NOT NULL,
        previous_value TEXT,
        new_value TEXT,
        ip_address TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sqlite_activity_created ON activity_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_sqlite_activity_type ON activity_logs(event_type);

      CREATE TABLE IF NOT EXISTS video_testimonials (
        id TEXT PRIMARY KEY,
        student_name TEXT NOT NULL,
        photo_url TEXT,
        thumbnail_url TEXT,
        course_program TEXT NOT NULL,
        cohort TEXT DEFAULT '',
        career_role TEXT DEFAULT '',
        company TEXT DEFAULT '',
        video_url TEXT NOT NULL,
        duration TEXT DEFAULT '',
        quote_highlight TEXT NOT NULL,
        is_featured INTEGER DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'approved',
        views_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sqlite_video_featured ON video_testimonials(is_featured);
      CREATE INDEX IF NOT EXISTS idx_sqlite_video_status ON video_testimonials(status);

      CREATE TABLE IF NOT EXISTS tuition_ledger (
        id TEXT PRIMARY KEY,
        student_email TEXT,
        student_name TEXT,
        student_phone TEXT DEFAULT '',
        course_id TEXT,
        course_title TEXT,
        cohort TEXT DEFAULT 'Current Cohort',
        total_fee_kes REAL NOT NULL DEFAULT 85000,
        paid_fee_kes REAL NOT NULL DEFAULT 0,
        balance_kes REAL NOT NULL DEFAULT 85000,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        deadline_date TEXT DEFAULT '',
        portal_access_granted INTEGER NOT NULL DEFAULT 1,
        installment_plan TEXT DEFAULT '5-Month Flexible Installments',
        notes TEXT DEFAULT '',
        updated_at TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sqlite_tl_email ON tuition_ledger(student_email);
      CREATE INDEX IF NOT EXISTS idx_sqlite_tl_status ON tuition_ledger(payment_status);

      CREATE TABLE IF NOT EXISTS access_control (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        requested_role TEXT NOT NULL DEFAULT 'student',
        status TEXT NOT NULL DEFAULT 'pending',
        assigned_role TEXT,
        full_name TEXT,
        phone TEXT,
        course_id TEXT,
        course_title TEXT,
        cohort TEXT,
        attempt_count INTEGER DEFAULT 1,
        last_attempt_at TEXT,
        reviewed_at TEXT,
        reviewed_by TEXT,
        notes TEXT,
        initial_password TEXT,
        setup_token TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sqlite_ac_email ON access_control(email);
      CREATE INDEX IF NOT EXISTS idx_sqlite_ac_status ON access_control(status);

      CREATE TABLE IF NOT EXISTS testimonials (
        id TEXT PRIMARY KEY,
        rating INTEGER DEFAULT 5,
        full_name TEXT NOT NULL,
        role_program TEXT NOT NULL,
        organization TEXT DEFAULT '',
        testimonial TEXT NOT NULL,
        avatar_url TEXT,
        video_url TEXT,
        thumbnail_url TEXT,
        status TEXT NOT NULL DEFAULT 'approved',
        is_featured INTEGER DEFAULT 1,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sqlite_test_status ON testimonials(status);
      CREATE INDEX IF NOT EXISTS idx_sqlite_test_featured ON testimonials(is_featured);
    `);

    // Ensure columns in student_fee_accounts if table already existed
    try {
      sqliteInstance.run("ALTER TABLE student_fee_accounts ADD COLUMN student_phone TEXT DEFAULT ''");
    } catch (_) {}
    try {
      sqliteInstance.run("ALTER TABLE student_fee_accounts ADD COLUMN last_alert_sent_at TEXT");
    } catch (_) {}
    try {
      sqliteInstance.run("ALTER TABLE student_fee_accounts ADD COLUMN last_alert_type TEXT");
    } catch (_) {}

    // Ensure columns in certificates if table already existed
    const certAlterStatements = [
      "ALTER TABLE certificates ADD COLUMN studentName TEXT",
      "ALTER TABLE certificates ADD COLUMN studentEmail TEXT",
      "ALTER TABLE certificates ADD COLUMN courseName TEXT",
      "ALTER TABLE certificates ADD COLUMN grade TEXT",
      "ALTER TABLE certificates ADD COLUMN institutionName TEXT DEFAULT 'CODE POINT KENYA'",
      "ALTER TABLE certificates ADD COLUMN subHeading TEXT DEFAULT 'INSTITUTE OF SOFTWARE ENGINEERING & APPLIED AI'",
      "ALTER TABLE certificates ADD COLUMN addressText TEXT DEFAULT 'Ngong Road, Twin Towers 5th Floor, Nairobi, Kenya'",
      "ALTER TABLE certificates ADD COLUMN signatory1Name TEXT DEFAULT 'Brenda Wambui'",
      "ALTER TABLE certificates ADD COLUMN signatory1Title TEXT DEFAULT 'CURRICULUM DIRECTOR - Faculty of Engineering'",
      "ALTER TABLE certificates ADD COLUMN signatory2Name TEXT DEFAULT 'Code Point Kenya Academic Board & Admin'",
      "ALTER TABLE certificates ADD COLUMN signatory2Title TEXT DEFAULT 'ISSUED DATE'",
      "ALTER TABLE certificates ADD COLUMN issueDate TEXT",
      "ALTER TABLE certificates ADD COLUMN certIdNumber TEXT",
      "ALTER TABLE certificates ADD COLUMN certidnumber TEXT",
      "ALTER TABLE certificates ADD COLUMN status TEXT DEFAULT 'Active'",
      "ALTER TABLE certificates ADD COLUMN recipientType TEXT DEFAULT 'Student'",
      "ALTER TABLE certificates ADD COLUMN recipient_type TEXT DEFAULT 'Student'",
      "ALTER TABLE certificates ADD COLUMN createdAt TEXT",
      "ALTER TABLE certificates ADD COLUMN updatedAt TEXT"
    ];
    for (const cSql of certAlterStatements) {
      try { sqliteInstance.run(cSql); } catch (_) {}
    }

    const reviewAlterStatements = [
      "ALTER TABLE reviews ADD COLUMN reviewer_name TEXT",
      "ALTER TABLE reviews ADD COLUMN reviewerName TEXT",
      "ALTER TABLE reviews ADD COLUMN role TEXT",
      "ALTER TABLE reviews ADD COLUMN comment TEXT",
      "ALTER TABLE reviews ADD COLUMN avatarUrl TEXT",
      "ALTER TABLE reviews ADD COLUMN is_approved INTEGER DEFAULT 0",
      "ALTER TABLE reviews ADD COLUMN isApproved INTEGER DEFAULT 0",
      "ALTER TABLE reviews ADD COLUMN is_featured INTEGER DEFAULT 1",
      "ALTER TABLE reviews ADD COLUMN isFeatured INTEGER DEFAULT 1",
      "ALTER TABLE reviews ADD COLUMN createdAt TEXT"
    ];
    for (const rSql of reviewAlterStatements) {
      try { sqliteInstance.run(rSql); } catch (_) {}
    }

    // Seed courses if empty
    const stmtCourses = sqliteInstance.prepare("SELECT COUNT(*) as count FROM courses");
    let hasCourses = false;
    if (stmtCourses.step()) {
      const row = stmtCourses.getAsObject();
      hasCourses = Number(row.count) > 0;
    }
    stmtCourses.free();

    if (!hasCourses) {
      for (const c of DEFAULT_COURSES) {
        sqliteInstance.run(
          `INSERT INTO courses (id, title, slug, category, duration_weeks, price_kes, monthly_kes, summary, curriculum, level, delivery_mode, schedule, next_intake, is_featured, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [c.id, c.title, c.slug, c.category, c.duration_weeks, c.price_kes, c.monthly_kes, c.summary, c.curriculum, c.level, c.delivery_mode, c.schedule, c.next_intake, c.is_featured, c.created_at]
        );
      }
    }

    // Seed users if empty
    const stmt = sqliteInstance.prepare("SELECT COUNT(*) as count FROM users");
    let hasUsers = false;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      hasUsers = Number(row.count) > 0;
    }
    stmt.free();

    if (!hasUsers) {
      for (const u of DEFAULT_USERS) {
        sqliteInstance.run(
          `INSERT INTO users (id, name, email, password, role, avatar, enrolled_course_id, enrolled_course_title, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.name, u.email, u.password, u.role, u.avatar, u.enrolled_course_id, u.enrolled_course_title, u.created_at]
        );
      }
    }

    // Seed settings if empty
    const stmtSettings = sqliteInstance.prepare("SELECT COUNT(*) as count FROM site_settings");
    let hasSettings = false;
    if (stmtSettings.step()) {
      const row = stmtSettings.getAsObject();
      hasSettings = Number(row.count) > 0;
    }
    stmtSettings.free();

    if (!hasSettings) {
      for (const [key, value] of Object.entries(DEFAULT_SITE_SETTINGS)) {
        sqliteInstance.run("INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)", [key, value]);
      }
    }

    // Seed assignments if empty
    try {
      const stmtAsg = sqliteInstance.prepare("SELECT COUNT(*) as count FROM assignments");
      let hasAsg = false;
      if (stmtAsg.step()) {
        const row = stmtAsg.getAsObject();
        hasAsg = Number(row.count) > 0;
      }
      stmtAsg.free();

      if (!hasAsg) {
        for (const a of DEFAULT_ASSIGNMENTS) {
          sqliteInstance.run(
            `INSERT INTO assignments (id, title, course_title, cohort, description, resource_url, sheets_url, due_date, max_marks, instructor_name, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [a.id, a.title, a.course_title, a.cohort, a.description, a.resource_url, a.sheets_url, a.due_date, a.max_marks, a.instructor_name, a.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite assignments seed warning:", e);
    }

    // Seed submissions if empty
    try {
      const stmtSub = sqliteInstance.prepare("SELECT COUNT(*) as count FROM submissions");
      let hasSub = false;
      if (stmtSub.step()) {
        const row = stmtSub.getAsObject();
        hasSub = Number(row.count) > 0;
      }
      stmtSub.free();

      if (!hasSub) {
        for (const s of DEFAULT_SUBMISSIONS) {
          sqliteInstance.run(
            `INSERT INTO submissions (id, assignment_id, assignment_title, student_name, student_email, course_title, submission_url, notes, marks, feedback, status, submitted_at, marked_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [s.id, s.assignment_id, s.assignment_title, s.student_name, s.student_email, s.course_title, s.submission_url, s.notes, s.marks, s.feedback, s.status, s.submitted_at, s.marked_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite submissions seed warning:", e);
    }

    // Seed announcements if empty
    try {
      const stmtAnn = sqliteInstance.prepare("SELECT COUNT(*) as count FROM announcements");
      let hasAnn = false;
      if (stmtAnn.step()) {
        const row = stmtAnn.getAsObject();
        hasAnn = Number(row.count) > 0;
      }
      stmtAnn.free();

      if (!hasAnn) {
        for (const a of DEFAULT_ANNOUNCEMENTS) {
          sqliteInstance.run(
            `INSERT INTO announcements (id, title, content, category, cohort, course_title, author_name, author_role, is_pinned, priority, action_url, action_label, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [a.id, a.title, a.content, a.category, a.cohort, a.course_title, a.author_name, a.author_role, a.is_pinned, a.priority, a.action_url, a.action_label, a.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite announcements seed warning:", e);
    }

    // Seed login_attempts if empty
    try {
      const stmtAtt = sqliteInstance.prepare("SELECT COUNT(*) as count FROM login_attempts");
      let hasAtt = false;
      if (stmtAtt.step()) {
        const row = stmtAtt.getAsObject();
        hasAtt = Number(row.count) > 0;
      }
      stmtAtt.free();

      if (!hasAtt) {
        for (const a of DEFAULT_LOGIN_ATTEMPTS) {
          sqliteInstance.run(
            `INSERT INTO login_attempts (id, email, requested_role, status, assigned_role, full_name, attempt_count, last_attempt_at, reviewed_at, reviewed_by, notes, initial_password, setup_token, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [a.id, a.email, a.requested_role, a.status, a.assigned_role, a.full_name, a.attempt_count, a.last_attempt_at, a.reviewed_at, a.reviewed_by, a.notes, a.initial_password, a.setup_token, a.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite login_attempts seed warning:", e);
    }

    // Seed class_lectures if empty
    try {
      const stmtLec = sqliteInstance.prepare("SELECT COUNT(*) as count FROM class_lectures");
      let hasLec = false;
      if (stmtLec.step()) {
        const row = stmtLec.getAsObject();
        hasLec = Number(row.count) > 0;
      }
      stmtLec.free();

      if (!hasLec) {
        for (const l of DEFAULT_LECTURES) {
          sqliteInstance.run(
            `INSERT INTO class_lectures (id, instructor_email, instructor_name, course_id, course_title, cohort, title, description, day_of_week, start_time, end_time, recurrence, location_type, meeting_link, date, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [l.id, l.instructor_email, l.instructor_name, l.course_id, l.course_title, l.cohort, l.title, l.description, l.day_of_week, l.start_time, l.end_time, l.recurrence, l.location_type, l.meeting_link, l.date, l.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite class_lectures seed warning:", e);
    }

    // Seed student_module_progress if empty
    try {
      const stmtProg = sqliteInstance.prepare("SELECT COUNT(*) as count FROM student_module_progress");
      let hasProg = false;
      if (stmtProg.step()) {
        const row = stmtProg.getAsObject();
        hasProg = Number(row.count) > 0;
      }
      stmtProg.free();

      if (!hasProg) {
        for (const p of DEFAULT_STUDENT_PROGRESS) {
          sqliteInstance.run(
            `INSERT INTO student_module_progress (id, student_email, student_name, course_id, course_title, module_id, module_title, module_number, status, student_notes, student_submission_url, teacher_email, teacher_name, teacher_feedback, requested_at, reviewed_at, completed_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [p.id, p.student_email, p.student_name, p.course_id, p.course_title, p.module_id, p.module_title, p.module_number, p.status, p.student_notes, p.student_submission_url, p.teacher_email, p.teacher_name, p.teacher_feedback, p.requested_at, p.reviewed_at, p.completed_at, p.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite student_module_progress seed warning:", e);
    }

    // Seed student_fee_accounts if empty
    try {
      const stmtFees = sqliteInstance.prepare("SELECT COUNT(*) as count FROM student_fee_accounts");
      let hasFees = false;
      if (stmtFees.step()) {
        const row = stmtFees.getAsObject();
        hasFees = Number(row.count) > 0;
      }
      stmtFees.free();

      if (!hasFees) {
        for (const f of DEFAULT_STUDENT_FEES) {
          sqliteInstance.run(
            `INSERT INTO student_fee_accounts (id, student_email, student_name, student_phone, course_id, course_title, cohort, total_fee_kes, paid_fee_kes, balance_kes, payment_status, deadline_date, portal_access_granted, installment_plan, notes, last_alert_sent_at, last_alert_type, updated_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [f.id, f.student_email, f.student_name, f.student_phone || '', f.course_id, f.course_title, f.cohort, f.total_fee_kes, f.paid_fee_kes, f.balance_kes, f.payment_status, f.deadline_date, f.portal_access_granted, f.installment_plan, f.notes, f.last_alert_sent_at || null, f.last_alert_type || null, f.updated_at, f.created_at]
          );
        }
      }

      // Seed fee_notification_settings
      const stmtSettings = sqliteInstance.prepare("SELECT COUNT(*) as count FROM fee_notification_settings");
      let hasSettings = false;
      if (stmtSettings.step()) {
        const row = stmtSettings.getAsObject();
        hasSettings = Number(row.count) > 0;
      }
      stmtSettings.free();

      if (!hasSettings) {
        sqliteInstance.run(
          `INSERT INTO fee_notification_settings (id, auto_deadline_alerts_enabled, deadline_days_threshold, auto_overdue_alerts_enabled, preferred_channel, sms_sender_id, email_sender_name, paybill_number, whatsapp_finance_phone, updated_at)
           VALUES ('default', 1, 5, 1, 'both', 'CODEPOINT', 'Code Point Kenya Finance', '522522', '+254 756 295 128', ?)`,
          [new Date().toISOString()]
        );
      }

      // Seed initial sample fee_notifications if empty
      const stmtNotifs = sqliteInstance.prepare("SELECT COUNT(*) as count FROM fee_notifications");
      let hasNotifs = false;
      if (stmtNotifs.step()) {
        const row = stmtNotifs.getAsObject();
        hasNotifs = Number(row.count) > 0;
      }
      stmtNotifs.free();

      if (!hasNotifs) {
        sqliteInstance.run(
          `INSERT INTO fee_notifications (id, student_fee_id, student_name, student_email, student_phone, course_title, channel, alert_type, recipient, subject, message_body, status, balance_kes, deadline_date, triggered_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'notif-init-01',
            'fee-faith-01',
            'Faith Mutua',
            'faith.mutua@outlook.com',
            '+254 733 456 789',
            'Applied AI & Large Language Models',
            'both',
            'status_overdue',
            'faith.mutua@outlook.com / +254 733 456 789',
            'URGENT: Tuition Balance Overdue & Live Access Restricted',
            'CODEPOINT KENYA ALERT: Dear Faith Mutua, your tuition balance of KES 75,000 is OVERDUE. Live lectures and campus lab access have been restricted. Clear balance via Paybill 522522, Acc: CPK-FAITH or contact +254 756 295 128 to restore access.',
            'delivered',
            75000,
            'April 10, 2026',
            'status_change',
            '2026-04-11T08:30:00.000Z'
          ]
        );

        sqliteInstance.run(
          `INSERT INTO fee_notifications (id, student_fee_id, student_name, student_email, student_phone, course_title, channel, alert_type, recipient, subject, message_body, status, balance_kes, deadline_date, triggered_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'notif-init-02',
            'fee-usr-student-01',
            'Brian Kipchumba',
            'student@codepointkenya.com',
            '+254 712 345 678',
            'Full-Stack Software Engineering',
            'both',
            'deadline_approaching',
            'student@codepointkenya.com / +254 712 345 678',
            'Upcoming Tuition Installment Reminder: KES 48,000 Due April 30',
            'CODEPOINT KENYA: Dear Brian Kipchumba, your tuition installment of KES 48,000 for Full-Stack Software Engineering is due on April 30, 2026. Pay via M-Pesa Paybill: 522522, Acc: CPK-BRIAN. Queries: +254 756 295 128.',
            'delivered',
            48000,
            'April 30, 2026',
            'automated_rule',
            '2026-04-20T09:00:00.000Z'
          ]
        );
      }
    } catch (e) {
      console.warn("[Database] SQLite student_fee_accounts seed warning:", e);
    }

    // Seed activity_logs if empty
    try {
      const stmtLogs = sqliteInstance.prepare("SELECT COUNT(*) as count FROM activity_logs");
      let hasLogs = false;
      if (stmtLogs.step()) {
        const row = stmtLogs.getAsObject();
        hasLogs = Number(row.count) > 0;
      }
      stmtLogs.free();

      if (!hasLogs) {
        for (const l of DEFAULT_ACTIVITY_LOGS) {
          sqliteInstance.run(
            `INSERT INTO activity_logs (id, event_type, action, entity_type, entity_id, actor_name, actor_email, target_name, target_email, details, previous_value, new_value, ip_address, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [l.id, l.event_type, l.action, l.entity_type, l.entity_id, l.actor_name, l.actor_email, l.target_name, l.target_email, l.details, l.previous_value, l.new_value, l.ip_address, l.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite activity_logs seed warning:", e);
    }

    // Seed video_testimonials if empty
    try {
      const stmtVids = sqliteInstance.prepare("SELECT COUNT(*) as count FROM video_testimonials");
      let hasVids = false;
      if (stmtVids.step()) {
        const row = stmtVids.getAsObject();
        hasVids = Number(row.count) > 0;
      }
      stmtVids.free();

      if (!hasVids) {
        for (const v of DEFAULT_VIDEO_TESTIMONIALS) {
          sqliteInstance.run(
            `INSERT INTO video_testimonials (id, student_name, photo_url, thumbnail_url, course_program, cohort, career_role, company, video_url, duration, quote_highlight, is_featured, status, views_count, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [v.id, v.student_name, v.photo_url, v.thumbnail_url, v.course_program, v.cohort, v.career_role, v.company, v.video_url, v.duration, v.quote_highlight, v.is_featured, v.status, v.views_count, v.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite video_testimonials seed warning:", e);
    }

    // Seed tuition_ledger if empty
    try {
      const stmtTl = sqliteInstance.prepare("SELECT COUNT(*) as count FROM tuition_ledger");
      let hasTl = false;
      if (stmtTl.step()) {
        const row = stmtTl.getAsObject();
        hasTl = Number(row.count) > 0;
      }
      stmtTl.free();

      if (!hasTl) {
        for (const f of DEFAULT_STUDENT_FEES) {
          sqliteInstance.run(
            `INSERT INTO tuition_ledger (id, student_email, student_name, student_phone, course_id, course_title, cohort, total_fee_kes, paid_fee_kes, balance_kes, payment_status, deadline_date, portal_access_granted, installment_plan, notes, updated_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [f.id, f.student_email, f.student_name, (f as any).student_phone || '', f.course_id, f.course_title, f.cohort, f.total_fee_kes, f.paid_fee_kes, f.balance_kes, f.payment_status, f.deadline_date, f.portal_access_granted, f.installment_plan, f.notes, f.updated_at, f.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite tuition_ledger seed warning:", e);
    }

    // Seed access_control if empty
    try {
      const stmtAc = sqliteInstance.prepare("SELECT COUNT(*) as count FROM access_control");
      let hasAc = false;
      if (stmtAc.step()) {
        const row = stmtAc.getAsObject();
        hasAc = Number(row.count) > 0;
      }
      stmtAc.free();

      if (!hasAc) {
        for (const a of DEFAULT_LOGIN_ATTEMPTS) {
          sqliteInstance.run(
            `INSERT INTO access_control (id, email, requested_role, status, assigned_role, full_name, phone, course_id, course_title, cohort, attempt_count, last_attempt_at, reviewed_at, reviewed_by, notes, initial_password, setup_token, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [a.id, a.email, a.requested_role, a.status, a.assigned_role, a.full_name, (a as any).phone || '', (a as any).course_id || '', (a as any).course_title || '', (a as any).cohort || '', a.attempt_count, a.last_attempt_at, a.reviewed_at, a.reviewed_by, a.notes, a.initial_password, a.setup_token, a.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite access_control seed warning:", e);
    }

    // Seed testimonials if empty
    try {
      const stmtTest = sqliteInstance.prepare("SELECT COUNT(*) as count FROM testimonials");
      let hasTest = false;
      if (stmtTest.step()) {
        const row = stmtTest.getAsObject();
        hasTest = Number(row.count) > 0;
      }
      stmtTest.free();

      if (!hasTest) {
        for (const r of DEFAULT_REVIEWS) {
          sqliteInstance.run(
            `INSERT INTO testimonials (id, rating, full_name, role_program, organization, testimonial, avatar_url, video_url, thumbnail_url, status, is_featured, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [r.id, r.rating, r.full_name, r.role_program, r.organization, r.testimonial, r.avatar_url, null, null, r.status, r.is_featured, r.created_at]
          );
        }
        for (const v of DEFAULT_VIDEO_TESTIMONIALS) {
          sqliteInstance.run(
            `INSERT INTO testimonials (id, rating, full_name, role_program, organization, testimonial, avatar_url, video_url, thumbnail_url, status, is_featured, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [`t-${v.id}`, 5, v.student_name, v.career_role, v.company, v.quote_highlight, v.photo_url, v.video_url, v.thumbnail_url, v.status, v.is_featured, v.created_at]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite testimonials seed warning:", e);
    }

    // Seed certificates if empty
    try {
      const stmtCert = sqliteInstance.prepare("SELECT COUNT(*) as count FROM certificates");
      let hasCert = false;
      if (stmtCert.step()) {
        const row = stmtCert.getAsObject();
        hasCert = Number(row.count) > 0;
      }
      stmtCert.free();

      if (!hasCert) {
        for (const c of DEFAULT_CERTIFICATES) {
          sqliteInstance.run(
            `INSERT INTO certificates (
              id, verification_id, student_name, student_email, course_title, cohort, completion_date, final_grade, approved_by, approved_at, qr_code_payload,
              studentName, studentEmail, courseName, grade, institutionName, subHeading, addressText, signatory1Name, signatory1Title, signatory2Name, signatory2Title, issueDate, certIdNumber, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              c.id, c.verification_id, c.student_name, c.student_email, c.course_title, c.cohort, c.completion_date, c.final_grade, c.approved_by, c.approved_at, c.qr_code_payload,
              c.studentName, c.studentEmail, c.courseName, c.grade, c.institutionName, c.subHeading, c.addressText, c.signatory1Name, c.signatory1Title, c.signatory2Name, c.signatory2Title, c.issueDate, c.certIdNumber, c.createdAt, c.updatedAt
            ]
          );
        }
      }
    } catch (e) {
      console.warn("[Database] SQLite certificates seed warning:", e);
    }

    // Save initial state
    try {
      const data = sqliteInstance.export();
      fs.writeFileSync(DB_FILE, Buffer.from(data));
    } catch (saveErr) {
      console.warn("[Database] Could not write SQLite to disk:", saveErr);
    }

    const appDb: AppDatabase = {
      type: "sqlite",
      providerName: "SQLite (Local/Serverless)",
      rawSqliteDb: sqliteInstance,
      async run(sql: string, params: any[] = []) {
        sqliteInstance.run(sql, params);
      },
      async exec(sql: string) {
        sqliteInstance.exec(sql);
      },
      async queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        const stmt = sqliteInstance.prepare(sql, params);
        const results: T[] = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject() as T);
        }
        stmt.free();
        return results;
      },
      async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
        const stmt = sqliteInstance.prepare(sql, params);
        let result: T | null = null;
        if (stmt.step()) {
          result = stmt.getAsObject() as T;
        }
        stmt.free();
        return result;
      }
    };

    return appDb;
  } catch (err) {
    console.warn("[Database] SQLite initialization encountered an error:", err);
    return null;
  }
}

/**
 * Main Database Initializer
 */
export async function getDatabase(): Promise<AppDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // 1. Check for PostgreSQL Connection Strings
    const candidates = getCandidatePostgresUrls();

    if (candidates.length > 0) {
      console.log(`[Database] Found ${candidates.length} PostgreSQL candidate(s). Connecting to primary cloud database...`);
      for (const candidate of candidates) {
        const pgDb = await initPostgres(candidate);
        if (pgDb) {
          dbInstance = pgDb;
          return pgDb;
        }
      }
      console.warn("[Database] No reachable PostgreSQL instances found among candidates. Falling back to local database engine...");
    }

    // 2. Try SQLite
    const sqliteDb = await initSqlite();
    if (sqliteDb) {
      dbInstance = sqliteDb;
      return sqliteDb;
    }

    // 3. Fallback: Pure in-memory resilient store
    const memDb = createInMemoryDb();
    dbInstance = memDb;
    return memDb;
  })();

  return initPromise;
}

/**
 * Universal Query Helper: queryAll
 */
export async function queryAll<T = any>(db: any, sql: string, params: any[] = []): Promise<T[]> {
  if (!db) {
    db = await getDatabase();
  }
  if (typeof db.queryAll === "function") {
    return db.queryAll(sql, params);
  }
  if (db.prepare) {
    const stmt = db.prepare(sql, params);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as T);
    }
    stmt.free();
    return results;
  }
  return [];
}

/**
 * Universal Query Helper: queryOne
 */
export async function queryOne<T = any>(db: any, sql: string, params: any[] = []): Promise<T | null> {
  const rows = await queryAll<T>(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Save Database (Flushes SQLite to disk; No-op for PostgreSQL)
 */
export async function saveDatabase(db: any): Promise<void> {
  if (!db) return;
  if (db.type === "postgres") {
    // PostgreSQL is immediately durable
    return;
  }
  if (db.rawSqliteDb && typeof db.rawSqliteDb.export === "function") {
    try {
      const data = db.rawSqliteDb.export();
      fs.writeFileSync(DB_FILE, Buffer.from(data));
    } catch (err) {
      console.warn("[Database] Could not write SQLite database to disk:", err);
    }
  }
}

/**
 * Get all site settings as key-value map
 */
export async function getSiteSettings(db: any): Promise<Record<string, string>> {
  const rows = await queryAll<{ key: string; value: string }>(db, "SELECT key, value FROM site_settings");
  const settings = { ...DEFAULT_SITE_SETTINGS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

/**
 * Save multiple site settings and return updated map
 */
export async function saveSiteSettings(db: any, newSettings: Record<string, string>): Promise<Record<string, string>> {
  if (!db) db = await getDatabase();

  for (const [key, value] of Object.entries(newSettings)) {
    if (value !== undefined && value !== null) {
      await db.run(
        "INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)",
        [key, String(value)]
      );
    }
  }

  await saveDatabase(db);
  return getSiteSettings(db);
}

/**
 * Diagnostic helper: Database Health & Status
 */
export async function getDatabaseStatus(): Promise<{
  connected: boolean;
  type: string;
  provider: string;
  isServerless: boolean;
  hasPostgresEnv: boolean;
  maskedUrl?: string;
  tables: Record<string, number>;
}> {
  const db = await getDatabase();
  const rawUrl =
    db.activeConnectionUrl ||
    process.env.SUPABASE_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL;

  let maskedUrl = undefined;
  if (rawUrl) {
    try {
      const u = new URL(rawUrl);
      maskedUrl = `${u.protocol}//${u.username ? "***:***@" : ""}${u.host}${u.pathname}`;
    } catch {
      maskedUrl = "Configured (Masked)";
    }
  }

  let courseCount = 0;
  let appCount = 0;
  let userCount = 0;
  let reviewCount = 0;
  let messageCount = 0;
  let asgCount = 0;
  let subCount = 0;
  let certCount = 0;

  try {
    const c = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM courses");
    courseCount = Number(c?.count || 0);

    const a = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM applications");
    appCount = Number(a?.count || 0);

    const u = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM users");
    userCount = Number(u?.count || 0);

    const r = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM reviews");
    reviewCount = Number(r?.count || 0);

    const m = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM messages");
    messageCount = Number(m?.count || 0);

    const asg = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM assignments");
    asgCount = Number(asg?.count || 0);

    const sub = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM submissions");
    subCount = Number(sub?.count || 0);

    const cert = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM certificates");
    certCount = Number(cert?.count || 0);

    let annCount = 0;
    try {
      const ann = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM announcements");
      annCount = Number(ann?.count || 0);
    } catch {}

    let tuitionLedgerCount = 0;
    try {
      const tl = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM tuition_ledger");
      tuitionLedgerCount = Number(tl?.count || 0);
    } catch {}

    let accessControlCount = 0;
    try {
      const ac = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM access_control");
      accessControlCount = Number(ac?.count || 0);
    } catch {}

    let testimonialsCount = 0;
    try {
      const ts = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM testimonials");
      testimonialsCount = Number(ts?.count || 0);
    } catch {}

    let studentFeesCount = 0;
    try {
      const sf = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM student_fee_accounts");
      studentFeesCount = Number(sf?.count || 0);
    } catch {}

    let videoTestimonialsCount = 0;
    try {
      const vt = await queryOne<{ count: string | number }>(db, "SELECT count(*) as count FROM video_testimonials");
      videoTestimonialsCount = Number(vt?.count || 0);
    } catch {}

    return {
      connected: true,
      type: db.type,
      provider: db.providerName,
      isServerless,
      hasPostgresEnv: Boolean(rawUrl),
      maskedUrl,
      tables: {
        courses: courseCount,
        tuition_ledger: tuitionLedgerCount,
        access_control: accessControlCount,
        testimonials: testimonialsCount,
        student_fee_accounts: studentFeesCount,
        video_testimonials: videoTestimonialsCount,
        applications: appCount,
        users: userCount,
        reviews: reviewCount,
        messages: messageCount,
        assignments: asgCount || 0,
        submissions: subCount || 0,
        certificates: certCount || 0,
        announcements: annCount || 0
      }
    };
  } catch (err) {
    console.warn("[Database Status] Query counts warning:", err);
  }

  return {
    connected: true,
    type: db.type,
    provider: db.providerName,
    isServerless,
    hasPostgresEnv: Boolean(rawUrl),
    maskedUrl,
    tables: {
      courses: courseCount,
      applications: appCount,
      users: userCount,
      reviews: reviewCount,
      messages: messageCount,
      assignments: asgCount || 0,
      submissions: subCount || 0,
      certificates: certCount || 0,
      announcements: 0
    }
  };
}
