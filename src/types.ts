export interface CourseModule {
  module: string;
  topics: string[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  duration_weeks: number;
  price_kes: number;
  monthly_kes: number;
  summary: string;
  curriculum: CourseModule[];
  curriculum_modules?: CourseModule[];
  level: string;
  delivery_mode: string;
  schedule: string;
  next_intake: string;
  is_featured: number;
  created_at: string;
}

export type ApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'interview_scheduled'
  | 'accepted'
  | 'enrolled'
  | 'rejected';

export interface Application {
  id: string;
  tracking_code: string;
  full_name: string;
  email: string;
  phone: string;
  course_id: string;
  course_title: string;
  intake: string;
  experience_level: string;
  motivation: string;
  status: ApplicationStatus;
  notes?: string;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone: string;
  subject?: string;
  course_title?: string;
  message: string;
  status: 'pending' | 'reviewing' | 'replied' | 'archived';
  notes?: string;
  created_at: string;
}

export type UserRole = 'admin' | 'student' | 'instructor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  enrolled_course_id?: string | null;
  enrolled_course_title?: string | null;
  must_update_password?: boolean;
  initial_password?: string | null;
}

export interface TrackingResult {
  application: Application;
  meta: {
    currentStep: number;
    label: string;
    description: string;
  };
}

export interface AdminStats {
  totalApplications: number;
  acceptedCount: number;
  pendingCount: number;
  enrolledStudents: number;
  activeCoursesCount: number;
  conversionRate: number;
  courseBreakdown: Record<string, number>;
}

export interface CarouselSlide {
  id: number | string;
  image: string;
  badge: string;
  headlinePrefix?: string;
  headlineHighlight: string;
  headlineSuffix?: string;
  description: string;
  pillLabel: string;
  quickHighlight: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ProgressionStage {
  id: string;
  step_number: string;
  stage_name: string;
  title: string;
  description: string;
  accent_color?: string;
}

export interface Review {
  id: string;
  rating: number; // 1 to 5
  full_name: string;
  role_program: string;
  organization: string;
  testimonial: string;
  avatar_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured?: number;
  created_at: string;
}

export type AccessStatus = 'pending' | 'approved' | 'rejected';

export interface LoginAttempt {
  id: string;
  email: string;
  requested_role: UserRole;
  status: AccessStatus;
  assigned_role?: UserRole | null;
  full_name?: string | null;
  attempt_count: number;
  last_attempt_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  notes?: string | null;
  initial_password?: string | null;
  setup_token?: string | null;
  created_at: string;
}

export interface SiteSettings {
  brand_name: string;
  tagline: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_introduction: string;
  hero_cta_text?: string;
  hero_badge_text?: string;
  hero_image_url?: string;
  school_logo_url?: string;
  weekday_hours: string;
  weekend_hours: string;
  short_hours_label: string;
  opens_time: string;
  closes_time: string;
  coverage: string;
  primary_phone: string;
  secondary_phone: string;
  email: string;
  address: string;
  city: string;
  social_instagram: string;
  about_title: string;
  about_body: string;
  carousel_slides_json?: string;
  faqs_json?: string;
  progression_stages_json?: string;
  technologies_section_json?: string;
  class_schedules_section_json?: string;
  why_study_section_json?: string;
  theme_palette?: string;
  theme_mode?: string;
  primary_cta_color?: string;
  secondary_cta_color?: string;
  accent_style?: string;
  next_intake_date?: string;
  registration_deadline?: string;
  intake_status?: 'Enrollment Open' | 'Limited Seats' | 'Registration Closed' | string;
  announcement_banner_text?: string;
  announcement_banner_enabled?: string | boolean;
  [key: string]: any;
}

export interface IntakeConfig {
  next_intake_date: string;
  registration_deadline: string;
  intake_status: 'Enrollment Open' | 'Limited Seats' | 'Registration Closed' | string;
  announcement_banner_text?: string;
  announcement_banner_enabled?: boolean | string;
}

export interface TechCardItem {
  id: string;
  title: string;
  category: string;
  description: string;
  icon_name: string;
  tags: string[];
  display_order?: number;
  is_visible?: boolean;
}

export interface TechnologiesSectionData {
  badge_text: string;
  title: string;
  subtitle: string;
  items: TechCardItem[];
}

export interface ScheduleTrackItem {
  id: string;
  title: string;
  schedule: string;
  time_badge: string;
  accent_badge: string;
  recommended_for: string;
  description: string;
  icon_name: string;
  highlights: string[];
  campus_note?: string;
  online_note?: string;
  display_order?: number;
  is_visible?: boolean;
}

export interface ClassSchedulesSectionData {
  badge_text: string;
  title: string;
  subtitle: string;
  items: ScheduleTrackItem[];
}

export interface WhyStudyFeatureItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon_name: string;
  benefits: string[];
  outcome_text?: string;
  display_order?: number;
  is_visible?: boolean;
}

export interface WhyStudySectionData {
  badge_text: string;
  title: string;
  subtitle: string;
  items: WhyStudyFeatureItem[];
}

export type SubmissionStatus = 'Marked' | 'Pending' | 'Incomplete';

export interface Assignment {
  id: string;
  title: string;
  course_title: string;
  cohort: string;
  description: string;
  resource_url?: string;
  sheets_url?: string;
  due_date: string;
  max_marks: number;
  instructor_name?: string;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  assignment_title: string;
  student_name: string;
  student_email: string;
  course_title: string;
  submission_url: string;
  notes?: string;
  marks?: number | null;
  feedback?: string;
  status: SubmissionStatus;
  submitted_at: string;
  marked_at?: string;
}

export interface Certificate {
  id: string;
  verification_id: string;
  student_name: string;
  student_email: string;
  course_title: string;
  cohort: string;
  completion_date: string;
  final_grade: string;
  approved_by: string;
  approved_at: string;
  qr_code_payload?: string;
}

export type AnnouncementCategory = 'Class Update' | 'Lab Notice' | 'Urgent' | 'Guest Lecture' | 'Career' | 'General';
export type AnnouncementPriority = 'Normal' | 'High' | 'Urgent';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  cohort: string;
  course_title: string;
  author_name: string;
  author_role: string;
  is_pinned: number | boolean;
  priority: AnnouncementPriority;
  action_url?: string;
  action_label?: string;
  created_at: string;
}

export interface ClassLecture {
  id: string;
  instructor_email: string;
  instructor_name: string;
  course_id: string;
  course_title: string;
  cohort: string;
  title: string;
  description?: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | string;
  start_time: string;
  end_time: string;
  recurrence: 'Weekly' | 'Bi-weekly' | 'Once-off' | string;
  location_type: string;
  meeting_link?: string;
  date?: string;
  created_at: string;
}

export type ModuleProgressStatus =
  | 'not_started'
  | 'in_progress'
  | 'pending_approval'
  | 'approved'
  | 'completed'
  | 'revision_requested';

export interface StudentModuleProgress {
  id: string;
  student_email: string;
  student_name: string;
  course_id: string;
  course_title: string;
  module_id: string;
  module_title: string;
  module_number: number;
  status: ModuleProgressStatus;
  student_notes?: string;
  student_submission_url?: string;
  teacher_email?: string;
  teacher_name?: string;
  teacher_feedback?: string;
  requested_at?: string;
  reviewed_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface CourseProgressSummary {
  courseId: string;
  courseTitle: string;
  totalModules: number;
  completedModules: number;
  approvedModules: number;
  pendingModules: number;
  percentage: number;
  modules: {
    moduleId: string;
    moduleNumber: number;
    title: string;
    topics: string[];
    status: ModuleProgressStatus;
    canMarkComplete: boolean;
    isComplete: boolean;
    progressRecord?: StudentModuleProgress;
  }[];
}

export type FeePaymentStatus = 'cleared' | 'pending' | 'overdue';

export interface StudentFeeAccount {
  id: string;
  student_email: string;
  student_name: string;
  student_phone?: string;
  course_id: string;
  course_title: string;
  cohort: string;
  total_fee_kes: number;
  paid_fee_kes: number;
  balance_kes: number;
  payment_status: FeePaymentStatus;
  deadline_date: string;
  portal_access_granted: number | boolean;
  installment_plan?: string;
  notes?: string;
  last_alert_sent_at?: string;
  last_alert_type?: string;
  updated_at?: string;
  created_at: string;
}

export type FeeNotificationChannel = 'email' | 'sms' | 'both';
export type FeeNotificationType = 'deadline_approaching' | 'status_overdue' | 'custom_reminder';
export type FeeNotificationStatus = 'delivered' | 'sent' | 'queued' | 'failed';

export interface FeeNotification {
  id: string;
  student_fee_id?: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  course_title?: string;
  channel: FeeNotificationChannel;
  alert_type: FeeNotificationType;
  recipient: string;
  subject: string;
  message_body: string;
  status: FeeNotificationStatus;
  balance_kes: number;
  deadline_date: string;
  triggered_by: 'automated_rule' | 'status_change' | 'admin_manual';
  created_at: string;
}

export interface FeeNotificationSettings {
  auto_deadline_alerts_enabled: boolean;
  deadline_days_threshold: number;
  auto_overdue_alerts_enabled: boolean;
  preferred_channel: FeeNotificationChannel;
  sms_sender_id: string;
  email_sender_name: string;
  paybill_number: string;
  whatsapp_finance_phone: string;
}

