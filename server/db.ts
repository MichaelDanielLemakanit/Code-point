import initSqlJs from "sql.js";
import fs from "fs";
import path from "path";
import pg from "pg";

const { Pool } = pg;

const currentDirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();

export interface AppDatabase {
  type: "postgres" | "sqlite" | "memory";
  providerName: string;
  run(sql: string, params?: any[]): Promise<any>;
  exec(sql: string): Promise<any>;
  queryAll<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  rawPostgresPool?: pg.Pool | null;
  rawSqliteDb?: any;
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
        icon_name: "Layout",
        tags: ["Flexbox", "Grid", "Semantic HTML", "CSS Variables"],
        display_order: 1,
        is_visible: true
      },
      {
        id: "bootstrap",
        title: "Bootstrap 5",
        category: "UI Framework",
        description: "Rapid front-end UI framework and responsive mobile components.",
        icon_name: "Layers",
        tags: ["Responsive Grids", "Components", "Utilities", "Mobile-First"],
        display_order: 2,
        is_visible: true
      },
      {
        id: "javascript",
        title: "JavaScript (ES6+)",
        category: "Core Language",
        description: "Client-side interactivity, DOM manipulation, and asynchronous JS.",
        icon_name: "Braces",
        tags: ["Async/Await", "Fetch API", "DOM APIs", "ES Modules"],
        display_order: 3,
        is_visible: true
      },
      {
        id: "sql-postgres",
        title: "SQL & PostgreSQL",
        category: "Database Systems",
        description: "Relational database design, queries, joins, and data management.",
        icon_name: "Database",
        tags: ["Schema Design", "Complex Joins", "Indexing", "ACID Transactions"],
        display_order: 4,
        is_visible: true
      },
      {
        id: "python-flask",
        title: "Python & Flask",
        category: "Backend & APIs",
        description: "Backend API routes, server rendering, authentication, and SQL integrations.",
        icon_name: "Server",
        tags: ["REST APIs", "SQLAlchemy", "JWT Auth", "Jinja Templates"],
        display_order: 5,
        is_visible: true
      },
      {
        id: "git-vercel",
        title: "Git & Vercel",
        category: "DevOps & Deployment",
        description: "Version control workflows, cloud deployment, and live hosting.",
        icon_name: "GitBranch",
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

const DEFAULT_USERS = [
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

const DEFAULT_REVIEWS = [
  {
    id: "rev-001",
    rating: 5,
    full_name: "Kevin Otieno",
    role_program: "Software Engineering Cohort 3 Alum",
    organization: "Junior Backend Developer, Safaricom PLC",
    testimonial: "Code Point Kenya transformed my transition into tech. The evening online cohorts allowed me to keep my daytime job while building 4 production systems with real cloud deployments. The Ngong Road lab Saturday hackathons connected me directly with hiring leads.",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "approved",
    is_featured: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: "rev-002",
    rating: 5,
    full_name: "Amina Abdi",
    role_program: "Applied AI & LLMs Fellow",
    organization: "AI Solutions Specialist, Twiga Foods",
    testimonial: "The curriculum doesn't waste time on surface-level toy apps. We built real retrieval-augmented generation pipelines, fine-tuned models, and deployed containerized microservices. The mentorship from senior Kenyan engineers is truly world-class.",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    status: "approved",
    is_featured: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: "rev-003",
    rating: 5,
    full_name: "Brian Kiprop",
    role_program: "Data Science & Predictive Analytics",
    organization: "Analytics Associate, Equity Bank Tech",
    testimonial: "I came in with zero Python background. In 16 weeks, I went from beginner syntax to predictive customer churn modeling and automated ETL data pipelines. The installment tuition plan made it completely stress-free.",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    status: "approved",
    is_featured: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
  },
  {
    id: "rev-004",
    rating: 5,
    full_name: "Grace Mwangi",
    role_program: "Cybersecurity & Defense Track",
    organization: "Security Analyst, Cellulant",
    testimonial: "The physical lab at Ngong Road (Teamshark, 5th Floor) was my second home during weekends. Blazing fast gigabit fiber and zero power interruptions meant I could focus 100% on cloud security labs and mock incident drills.",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "approved",
    is_featured: 1,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
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

/**
 * Initialize PostgreSQL Production Database
 */
async function initPostgres(connectionString: string): Promise<AppDatabase | null> {
  try {
    const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
    const pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000
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
        qr_code_payload TEXT
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
    `);

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

    const appDb: AppDatabase = {
      type: "postgres",
      providerName: "PostgreSQL (Production Cloud Database)",
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
  } catch (err) {
    console.error("[Database] Failed to connect to PostgreSQL:", err);
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
    certificates: [],
    announcements: [...DEFAULT_ANNOUNCEMENTS],
    login_attempts: [...DEFAULT_LOGIN_ATTEMPTS],
    class_lectures: [...DEFAULT_LECTURES]
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
        tables.reviews.push({
          id: params[0],
          rating: Number(params[1]),
          full_name: params[2],
          role_program: params[3],
          organization: params[4],
          testimonial: params[5],
          avatar_url: params[6],
          status: "pending",
          is_featured: 0,
          created_at: params[7]
        });
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
          qr_code_payload: params[10]
        });
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
    },
    async exec() {},
    async queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
      const lower = sql.toLowerCase();
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
        rating INTEGER NOT NULL,
        full_name TEXT NOT NULL,
        role_program TEXT NOT NULL,
        organization TEXT NOT NULL,
        testimonial TEXT NOT NULL,
        avatar_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        is_featured INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
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
    `);

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
    const postgresUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.SUPABASE_DATABASE_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING;

    if (postgresUrl && postgresUrl.trim()) {
      console.log("[Database] Production PostgreSQL environment variable detected. Attempting connection...");
      const pgDb = await initPostgres(postgresUrl.trim());
      if (pgDb) {
        dbInstance = pgDb;
        return pgDb;
      }
      console.warn("[Database] PostgreSQL connection failed. Falling back to local database engine...");
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
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DATABASE_URL;

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
