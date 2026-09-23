import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { Hero } from './components/Hero';
import { CareerPathQuiz } from './components/CareerPathQuiz';
import { ProgramsCatalog } from './components/ProgramsCatalog';
import { LearningModel } from './components/LearningModel';
import { ReviewsSection } from './components/ReviewsSection';
import { AdmissionsFees } from './components/AdmissionsFees';
import { TechnologiesSection } from './components/TechnologiesSection';
import { ClassSchedulesSection } from './components/ClassSchedulesSection';
import { WhyStudySection } from './components/WhyStudySection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { ApplyModal } from './components/ApplyModal';
import { ApplicationTrackerModal } from './components/ApplicationTrackerModal';
import { PortalModal } from './components/portal/PortalModal';
import { AdminPanel } from './components/portal/AdminPanel';
import { Course, User, Application, SiteSettings } from './types';
import { applyGlobalTheme } from './utils/theme';

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedPortalUser = localStorage.getItem('cpk_portal_user');
      if (savedPortalUser) {
        const parsed = JSON.parse(savedPortalUser);
        if (parsed && parsed.role) return parsed;
      }
      const savedAdminUser = localStorage.getItem('cpk_admin_user');
      if (savedAdminUser) {
        const parsed = JSON.parse(savedAdminUser);
        if (parsed && parsed.role === 'admin') return parsed;
      }
    } catch (e) {}
    return null;
  });

  const handleUserLogout = () => {
    try {
      localStorage.removeItem('cpk_portal_user');
      localStorage.removeItem('cpk_portal_token');
      localStorage.removeItem('cpk_admin_user');
    } catch (e) {}
    setCurrentUser(null);
  };

  // Modals state
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyCourseId, setApplyCourseId] = useState<string | undefined>(undefined);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackerCode, setTrackerCode] = useState<string>('');
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isAdminCMSOpen, setIsAdminCMSOpen] = useState(false);

  // Fetch courses from SQLite backend
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error('Failed to fetch courses from backend API:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Fetch dynamic CMS site settings
  const fetchSiteSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      if (res.ok) {
        const data = await res.json();
        setSiteSettings(data);
      }
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSiteSettings();
  }, []);

  // Dynamically synchronize theme colors and root CSS variables
  useEffect(() => {
    const primary = siteSettings?.primary_cta_color || '#10B981';
    const secondary = siteSettings?.secondary_cta_color || '#06B6D4';
    applyGlobalTheme(primary, secondary);
  }, [siteSettings]);

  // Listen for real-time theme updates dispatched across components
  useEffect(() => {
    const handleThemeUpdated = () => {
      fetchSiteSettings();
    };
    window.addEventListener('cpk_theme_updated', handleThemeUpdated);
    return () => {
      window.removeEventListener('cpk_theme_updated', handleThemeUpdated);
    };
  }, []);

  const handleOpenApply = (courseId?: string) => {
    setApplyCourseId(courseId);
    setIsApplyOpen(true);
  };

  const handleOpenTracker = (code?: string) => {
    if (code) setTrackerCode(code);
    setIsTrackerOpen(true);
  };

  const handleApplicationCreated = (app: Application) => {
    setTrackerCode(app.tracking_code);
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top-Bar Announcement Banner for Upcoming Intake & Next Cohort */}
      <AnnouncementBanner
        siteSettings={siteSettings}
        onApplyNow={() => handleOpenApply()}
      />

      {/* Main Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenApply={() => handleOpenApply()}
        onOpenTracker={() => handleOpenTracker()}
        onOpenPortal={() => setIsPortalOpen(true)}
        onOpenAdminCMS={() => setIsAdminCMSOpen(true)}
        onNavigateSection={handleNavigateSection}
        onLogout={() => setCurrentUser(null)}
        siteSettings={siteSettings}
      />

      {/* Main Public Website Content */}
      <main>
        {/* 1. Hero Section */}
        <Hero
          onExplorePrograms={() => handleNavigateSection('programs')}
          onApplyNow={() => handleOpenApply()}
          onOpenTracker={() => handleOpenTracker()}
          onTakeQuiz={() => handleNavigateSection('career-quiz')}
          siteSettings={siteSettings}
        />

        {/* 1.5 Interactive Career Path Quiz Section */}
        <CareerPathQuiz
          courses={courses}
          onApplyCourse={(courseId) => handleOpenApply(courseId)}
          onExplorePrograms={() => handleNavigateSection('programs')}
          siteSettings={siteSettings}
        />

        {/* 2. Programs & Courses Catalog with KES Pricing */}
        <ProgramsCatalog
          courses={courses}
          loading={loadingCourses}
          onApplyCourse={(courseId) => handleOpenApply(courseId)}
        />

        {/* 3. Technologies You Will Master */}
        <TechnologiesSection />

        {/* 4. Flexible Class Schedules (Evening Track & Weekend Track) */}
        <ClassSchedulesSection
          onApply={() => handleOpenApply()}
          siteSettings={siteSettings}
        />

        {/* 5. Online-First + Ngong Road Physical Campus Model */}
        <LearningModel />

        {/* 6. Why Study at CodePoint Kenya */}
        <WhyStudySection />

        {/* 7. Approved Alumni Reviews Marquee & Public Feedback Rating Form */}
        <ReviewsSection />

        {/* 5. Admissions, Tuition Plans & FAQs */}
        <AdmissionsFees
          onApplyNow={(courseId) => handleOpenApply(courseId)}
          courses={courses}
          siteSettings={siteSettings}
        />

        {/* 5. Contact & Ngong Road Campus Location Section */}
        <ContactSection siteSettings={siteSettings} />
      </main>

      {/* Footer */}
      <Footer
        onOpenApply={() => handleOpenApply()}
        onOpenTracker={() => handleOpenTracker()}
        onOpenPortal={() => setIsPortalOpen(true)}
        onOpenAdminCMS={() => setIsAdminCMSOpen(true)}
        onNavigateSection={handleNavigateSection}
        siteSettings={siteSettings}
      />

      {/* Fixed Floating WhatsApp Help Widget (+254756295128) */}
      <WhatsAppWidget siteSettings={siteSettings} />

      {/* Course Enrollment / Apply Now Modal */}
      <ApplyModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        courses={courses}
        initialCourseId={applyCourseId}
        onApplicationCreated={handleApplicationCreated}
      />

      {/* Application Status Tracker Modal */}
      <ApplicationTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        initialCode={trackerCode}
      />

      {/* Secure Role-Based Management Portal Modal (Student & Faculty Instructor) */}
      <PortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => setCurrentUser(user)}
        onLogout={handleUserLogout}
        onOpenAdminCMS={() => {
          setIsPortalOpen(false);
          setIsAdminCMSOpen(true);
        }}
        courses={courses}
        onRefreshCourses={fetchCourses}
        siteSettings={siteSettings}
        onUpdateSiteSettings={async (newSettings) => {
          try {
            const res = await fetch('/api/site-settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newSettings)
            });
            if (res.ok) {
              await fetchSiteSettings();
              return true;
            }
            return false;
          } catch (e) {
            console.error('Error updating site settings:', e);
            return false;
          }
        }}
      />

      {/* Secure Dedicated Admin CMS Panel */}
      <AdminPanel
        isOpen={isAdminCMSOpen}
        onClose={() => setIsAdminCMSOpen(false)}
        siteSettings={siteSettings}
        onUpdateSiteSettings={async (newSettings) => {
          try {
            const res = await fetch('/api/site-settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newSettings)
            });
            if (res.ok) {
              await fetchSiteSettings();
              return true;
            }
            return false;
          } catch (e) {
            console.error('Error updating site settings:', e);
            return false;
          }
        }}
        onSettingsUpdated={fetchSiteSettings}
        courses={courses}
        onRefreshCourses={fetchCourses}
        currentUser={currentUser}
        onAdminLoginSuccess={(adminUser) => setCurrentUser(adminUser)}
        onAdminLogout={() => setCurrentUser(null)}
      />

    </div>
  );
}
