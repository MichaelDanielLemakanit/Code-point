import React, { useState, useRef } from 'react';
import { 
  FileEdit, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  RotateCcw, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  HelpCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Sliders, 
  Layers, 
  X,
  ChevronRight,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Palette,
  Check
} from 'lucide-react';
import { SiteSettings, CarouselSlide, FAQItem, ProgressionStage } from '../../types';
import { TechStackManager } from './TechStackManager';
import { ClassSchedulesManager } from './ClassSchedulesManager';
import { WhyStudyManager } from './WhyStudyManager';

interface ContentEditorProps {
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (settings: SiteSettings) => Promise<boolean>;
  onSettingsUpdated?: () => void;
  showToast: (msg: string) => void;
}

const DEFAULT_PROGRESSION_STAGES: ProgressionStage[] = [
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
    stage_name: "Production",
    title: "Full-Stack Systems",
    description: "Build real-world client and backend microservices with real databases, tests, and cloud deployments.",
    accent_color: "teal"
  },
  {
    id: "stage-03",
    step_number: "03",
    stage_name: "Capstone",
    title: "Team Project Demo",
    description: "Ship a comprehensive end-to-end product presented during Code Point Kenya’s Demo Day to hiring partners.",
    accent_color: "indigo"
  },
  {
    id: "stage-04",
    step_number: "04",
    stage_name: "Placement",
    title: "Career & Mentorship",
    description: "Resume optimization, GitHub audit, technical mock interviews, and direct introductions to hiring companies.",
    accent_color: "amber"
  }
];

// Reusable Image Upload & URL input with preview
const ImageUploadField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  helperText?: string;
}> = ({ label, value, onChange, helperText }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (JPG, PNG, WEBP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload from your device"
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-xs focus:outline-none focus:border-stone-900 focus:bg-white transition-colors"
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 border border-stone-300 transition-colors cursor-pointer shrink-0"
        >
          <Upload className="w-3.5 h-3.5 text-stone-600" />
          <span>Upload Image</span>
        </button>
      </div>
      {helperText && <p className="text-[11px] text-stone-400">{helperText}</p>}
      
      {value && (
        <div className="relative inline-block mt-2 rounded-xl border border-stone-200 overflow-hidden bg-stone-100 max-h-36 max-w-xs shadow-xs">
          <img
            src={value}
            alt="Upload Preview"
            className="h-28 w-auto object-cover rounded"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-stone-900/80 hover:bg-stone-900 text-white text-[10px] cursor-pointer"
            title="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export const ContentEditor: React.FC<ContentEditorProps> = ({
  siteSettings,
  onUpdateSiteSettings,
  onSettingsUpdated,
  showToast
}) => {
  const [subTab, setSubTab] = useState<'brand_hero' | 'carousel' | 'tech_stack' | 'schedules' | 'why_study' | 'faqs' | 'progression' | 'hours_lab' | 'contact_about'>('brand_hero');
  const [formData, setFormData] = useState<SiteSettings>(siteSettings || {} as SiteSettings);
  const [isSaving, setIsSaving] = useState(false);

  // Career Progression Stages (Path from Learner to Hired Engineer) State
  const [stages, setStages] = useState<ProgressionStage[]>(() => {
    if (siteSettings?.progression_stages_json) {
      try {
        const parsed = JSON.parse(siteSettings.progression_stages_json);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_PROGRESSION_STAGES;
  });

  const [editingStage, setEditingStage] = useState<ProgressionStage | null>(null);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);

  // Carousel Slides State
  const [slides, setSlides] = useState<CarouselSlide[]>(() => {
    if (siteSettings?.carousel_slides_json) {
      try {
        const parsed = JSON.parse(siteSettings.carousel_slides_json);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 0,
        image: 'kenyanCodingLab',
        badge: 'Online-First Training + Physical Campus Lab (Ngong Road, Nairobi)',
        headlinePrefix: '',
        headlineHighlight: 'Launch Your Tech Career in Software, Data, & AI with Code Point Kenya',
        headlineSuffix: '',
        description: 'Kenya’s premier career-accelerator coding school. Learn through intensive, project-driven cohorts taught by senior engineers from Nairobi’s top tech ecosystems.',
        pillLabel: 'Tech Accelerator',
        quickHighlight: '94% Grad Placement'
      },
      {
        id: 1,
        image: 'nairobiDevClass',
        badge: 'Physical Collaborative Lab: Teamshark 5th Floor, Ngong Road',
        headlinePrefix: 'Hands-on Coding & ',
        headlineHighlight: 'Mentorship at Ngong Road Lab',
        headlineSuffix: '',
        description: 'Step into our high-speed collaborative coding space in Nairobi. Access gigabit internet, backup power, peer pair-programming stations, and interactive Saturday coding clinics with senior tech practitioners.',
        pillLabel: 'Ngong Road Hub',
        quickHighlight: 'Gigabit Campus Wi-Fi'
      },
      {
        id: 2,
        image: 'engineerMentoring',
        badge: 'Production Portfolio & Global Engineering Standards',
        headlinePrefix: 'Build ',
        headlineHighlight: 'Production-Grade Projects',
        headlineSuffix: ' with Expert Engineers',
        description: 'No toy tutorials or synthetic exercises. Graduate with 4 verified production projects deployed on cloud infrastructure—from scalable microservices and database engines to enterprise LLM integrations.',
        pillLabel: 'Live Projects',
        quickHighlight: '4 Verified Capstones'
      }
    ];
  });

  // Slide Modal State
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);

  // FAQ State
  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    if (siteSettings?.faqs_json) {
      try {
        const parsed = JSON.parse(siteSettings.faqs_json);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      {
        q: 'Where is Code Point Kenya located physically?',
        a: 'Our physical headquarters, collaborative learning lab, and classrooms are situated on Ngong Road, Teamshark, 5th Floor in Nairobi. Enrolled fellows can use our high-speed internet, power backup, study pods, and attend Saturday clinics here.'
      },
      {
        q: 'How does the Online-First model work?',
        a: 'Lectures occur live via Zoom on scheduled evenings (7:00 PM - 9:30 PM EAT), enabling working professionals and university students to learn without quitting their jobs. All sessions are recorded and paired with Discord chat and physical campus lab access.'
      },
      {
        q: 'Are there flexible installment plans for tuition in KES?',
        a: 'Yes! While full upfront payment provides a discount, all core programs (Software Engineering KES 85K, Data Science KES 75K, AI KES 95K, Cybersecurity KES 80K) can be split into manageable 5-month installment plans from as low as KES 16,500/month.'
      },
      {
        q: 'Do I need a Computer Science background to apply?',
        a: 'No. Our foundational modules are specifically structured to take beginners from scratch. All you need is a working laptop, consistency, and problem-solving dedication.'
      },
      {
        q: 'How can I contact admissions or get advice on which course fits me?',
        a: 'You can chat with our admissions advisors on WhatsApp directly at 0756295128 (https://wa.me/254756295128), email us at info@codepointkenya.com, or drop by our Ngong Road offices Monday through Saturday.'
      }
    ];
  });

  // FAQ Modal State
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [faqModalData, setFaqModalData] = useState<FAQItem>({ q: '', a: '' });
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Carousel Slide Actions
  const handleOpenAddSlide = () => {
    setEditingSlide({
      id: Date.now(),
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=80',
      badge: 'Interactive Cohort Workshop',
      headlinePrefix: 'Master Modern ',
      headlineHighlight: 'Software & AI Engineering',
      headlineSuffix: '',
      description: 'Hands-on practical training with senior Nairobi engineers.',
      pillLabel: 'Live Sessions',
      quickHighlight: 'Online + Ngong Rd'
    });
    setIsSlideModalOpen(true);
  };

  const handleOpenEditSlide = (slide: CarouselSlide) => {
    setEditingSlide({ ...slide });
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    setSlides(prev => {
      const exists = prev.some(s => s.id === editingSlide.id);
      if (exists) {
        return prev.map(s => s.id === editingSlide.id ? editingSlide : s);
      } else {
        return [...prev, editingSlide];
      }
    });

    setIsSlideModalOpen(false);
    showToast('Slide updated! Save site content to persist changes.');
  };

  const handleDeleteSlide = (id: number) => {
    if (slides.length <= 1) {
      alert('You must have at least one carousel slide.');
      return;
    }
    setSlides(prev => prev.filter(s => s.id !== id));
    showToast('Slide removed.');
  };

  // FAQ Actions
  const handleOpenAddFaq = () => {
    setEditingFaqIndex(null);
    setFaqModalData({ q: '', a: '' });
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (index: number) => {
    setEditingFaqIndex(index);
    setFaqModalData({ ...faqs[index] });
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqModalData.q.trim() || !faqModalData.a.trim()) {
      alert('Please provide both question and answer');
      return;
    }

    if (editingFaqIndex !== null) {
      setFaqs(prev => prev.map((f, i) => i === editingFaqIndex ? faqModalData : f));
    } else {
      setFaqs(prev => [...prev, faqModalData]);
    }

    setIsFaqModalOpen(false);
    showToast('FAQ updated! Save site content to persist.');
  };

  const handleDeleteFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
    showToast('FAQ item deleted.');
  };

  // Career Progression Stage Handlers
  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stages.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newStages = [...stages];
    const temp = newStages[index];
    newStages[index] = newStages[targetIndex];
    newStages[targetIndex] = temp;

    // Normalize step numbers (e.g., "01", "02", "03", "04")
    const updated = newStages.map((st, i) => ({
      ...st,
      step_number: (i + 1).toString().padStart(2, '0')
    }));
    setStages(updated);
    showToast('Stage reordered! Remember to save site content to persist.');
  };

  const handleOpenAddStage = () => {
    const nextNum = (stages.length + 1).toString().padStart(2, '0');
    setEditingStage({
      id: `stage-${Date.now()}`,
      step_number: nextNum,
      stage_name: `Phase ${stages.length + 1}`,
      title: 'New Progression Milestone',
      description: 'Describe what skills, stack competencies, and career outcomes fellows conquer in this phase.',
      accent_color: 'emerald'
    });
    setIsStageModalOpen(true);
  };

  const handleOpenEditStage = (stage: ProgressionStage) => {
    setEditingStage({ ...stage });
    setIsStageModalOpen(true);
  };

  const handleSaveStageModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStage) return;

    if (!editingStage.stage_name.trim() || !editingStage.title.trim()) {
      alert('Please fill in both Stage Name and Title.');
      return;
    }

    setStages(prev => {
      const exists = prev.some(s => s.id === editingStage.id);
      if (exists) {
        return prev.map(s => s.id === editingStage.id ? editingStage : s);
      } else {
        return [...prev, editingStage];
      }
    });

    setIsStageModalOpen(false);
    showToast('Progression stage updated! Click "Save All Site Content" to publish live.');
  };

  const handleDeleteStage = (id: string) => {
    if (stages.length <= 1) {
      alert('You must have at least one progression stage in the pathway.');
      return;
    }
    if (confirm('Are you sure you want to remove this career milestone stage?')) {
      const remaining = stages.filter(s => s.id !== id).map((st, i) => ({
        ...st,
        step_number: (i + 1).toString().padStart(2, '0')
      }));
      setStages(remaining);
      showToast('Stage removed. Remember to save all content.');
    }
  };

  const handleResetDefaultStages = () => {
    if (confirm('Reset career progression back to the standard 4-stage pathway (01. Immersion, 02. Production, 03. Capstone, 04. Placement)?')) {
      setStages(DEFAULT_PROGRESSION_STAGES);
      showToast('Reset to standard 4-stage pathway. Click "Save All Site Content" to publish.');
    }
  };

  // Save All Content
  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: SiteSettings = {
        ...formData,
        carousel_slides_json: JSON.stringify(slides),
        faqs_json: JSON.stringify(faqs),
        progression_stages_json: JSON.stringify(stages)
      };

      let success = false;
      if (typeof onUpdateSiteSettings === 'function') {
        success = await onUpdateSiteSettings(payload);
      } else {
        const res = await fetch('/api/site-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        success = res.ok;
      }

      if (typeof onSettingsUpdated === 'function') {
        onSettingsUpdated();
      }

      if (success) {
        showToast('Site content saved! Public homepage updated instantly.');
      } else {
        alert('Failed to save site content');
      }
    } catch (e) {
      console.error('Failed to save content:', e);
      alert('Network error saving site content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <FileEdit className="w-7 h-7 text-amber-500" />
            <span>Front-Page Content CMS</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Update live homepage text, brand headers, hero carousel slides, FAQ items, and contact details
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-stone-900/20 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-amber-400" />
          )}
          <span>Save All Site Content</span>
        </button>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        {[
          { id: 'brand_hero', label: 'Brand & Hero Header' },
          { id: 'carousel', label: `Carousel Slides (${slides.length})` },
          { id: 'tech_stack', label: 'Technologies Stack' },
          { id: 'schedules', label: 'Class Schedules' },
          { id: 'why_study', label: 'Why Study Features' },
          { id: 'progression', label: `Career Pathway (${stages.length} Stages)` },
          { id: 'faqs', label: `FAQs & Admissions (${faqs.length})` },
          { id: 'hours_lab', label: 'Campus Lab & Hours' },
          { id: 'contact_about', label: 'Contact & About' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              subTab === t.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'tech_stack' && (
        <TechStackManager
          siteSettings={siteSettings}
          onUpdateSiteSettings={onUpdateSiteSettings}
          onSettingsUpdated={onSettingsUpdated}
          showToast={showToast}
        />
      )}

      {subTab === 'schedules' && (
        <ClassSchedulesManager
          siteSettings={siteSettings}
          onUpdateSiteSettings={onUpdateSiteSettings}
          onSettingsUpdated={onSettingsUpdated}
          showToast={showToast}
        />
      )}

      {subTab === 'why_study' && (
        <WhyStudyManager
          siteSettings={siteSettings}
          onUpdateSiteSettings={onUpdateSiteSettings}
          onSettingsUpdated={onSettingsUpdated}
          showToast={showToast}
        />
      )}

      {['brand_hero', 'carousel', 'progression', 'faqs', 'hours_lab', 'contact_about'].includes(subTab) && (
      <form onSubmit={handleSaveAll} className="space-y-6">

        {/* 1. BRAND & HERO SUBTAB */}
        {subTab === 'brand_hero' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-base font-bold text-stone-900">Brand Identity & Hero Section</h3>
              <p className="text-xs text-stone-500">Edit school branding, top hero banner title, and call to actions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  School / Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brand_name || ''}
                  onChange={(e) => handleInputChange('brand_name', e.target.value)}
                  placeholder="Code Point Kenya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-bold focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={formData.tagline || ''}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="Nairobi Tech Institute"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* School Logo Image */}
              <div className="sm:col-span-2">
                <ImageUploadField
                  label="School Logo (URL or Device Upload)"
                  value={formData.school_logo_url || ''}
                  onChange={(val) => handleInputChange('school_logo_url', val)}
                  helperText="Displayed in the website navigation bar and student portal header"
                />
              </div>

              {/* Campus Lab Photo */}
              <div className="sm:col-span-2">
                <ImageUploadField
                  label="Campus Lab Photo (URL or Device Upload)"
                  value={formData.campus_photo_url || ''}
                  onChange={(val) => handleInputChange('campus_photo_url', val)}
                  helperText="Displayed across the campus facilities and learning model sections"
                />
              </div>

              {/* Hero Eyebrow */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Hero Eyebrow Badge
                </label>
                <input
                  type="text"
                  value={formData.hero_eyebrow || ''}
                  onChange={(e) => handleInputChange('hero_eyebrow', e.target.value)}
                  placeholder="Online-First Training + Physical Campus Lab (Ngong Road, Nairobi)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Hero Title */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Main Hero Title Headline
                </label>
                <textarea
                  rows={2}
                  value={formData.hero_title || ''}
                  onChange={(e) => handleInputChange('hero_title', e.target.value)}
                  placeholder="Launch Your Tech Career in Software, Data, & AI with Code Point Kenya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-bold focus:outline-none focus:border-stone-900 leading-relaxed"
                />
              </div>

              {/* Hero Introduction */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Hero Introduction Body
                </label>
                <textarea
                  rows={3}
                  value={formData.hero_introduction || ''}
                  onChange={(e) => handleInputChange('hero_introduction', e.target.value)}
                  placeholder="Kenya’s premier career-accelerator coding school. Learn through intensive cohorts..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 leading-relaxed"
                />
              </div>

              {/* Primary CTA Button Text */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Primary CTA Button Label
                </label>
                <input
                  type="text"
                  value={formData.hero_cta_text || ''}
                  onChange={(e) => handleInputChange('hero_cta_text', e.target.value)}
                  placeholder="Apply Now for Next Cohort"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-bold focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Hero Badge Label */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Hero Badge / Tag
                </label>
                <input
                  type="text"
                  value={formData.hero_badge || ''}
                  onChange={(e) => handleInputChange('hero_badge', e.target.value)}
                  placeholder="Next Intake Open"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

            </div>
          </div>
        )}

        {/* 2. CAROUSEL SLIDES SUBTAB */}
        {subTab === 'carousel' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Hero Carousel Slides</h3>
                <p className="text-xs text-stone-500">Manage high-impact photography, headlines, and cohort badges</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddSlide}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
            </div>

            <div className="space-y-4">
              {slides.map((s, idx) => (
                <div
                  key={s.id ?? idx}
                  className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-20 h-16 rounded-lg bg-stone-200 border border-stone-300 overflow-hidden shrink-0">
                      <img
                        src={s.image}
                        alt="Slide preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Slide #{idx + 1} • {s.pillLabel || 'Cohort'}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {s.quickHighlight}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900">
                        {s.headlinePrefix}{s.headlineHighlight}{s.headlineSuffix}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-1">
                        {s.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSlide(s)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(s.id)}
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CAREER PROGRESSION PATHWAY (PATH FROM LEARNER TO HIRED ENGINEER) */}
        {subTab === 'progression' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-stone-900">
                    Path from Learner to Hired Engineer (Career Progression Cards)
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Manage the 4-stage milestones shown in the public learning model section. Reorder stages, customize stage names, titles, descriptions, and accent colors.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleResetDefaultStages}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset to default 4 stages"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
                  <span>Reset Default 4-Stages</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddStage}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Progression Stage</span>
                </button>
              </div>
            </div>

            {/* Stages List */}
            <div className="space-y-3">
              {stages.map((stage, idx) => (
                <div
                  key={stage.id}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50/80 hover:bg-stone-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Reorder Up / Down Controls */}
                    <div className="flex flex-col gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveStage(idx, 'up')}
                        className="p-1 rounded hover:bg-stone-200 text-stone-600 disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === stages.length - 1}
                        onClick={() => handleMoveStage(idx, 'down')}
                        className="p-1 rounded hover:bg-stone-200 text-stone-600 disabled:opacity-25 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stage Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-stone-900 text-emerald-400 border border-stone-700">
                          {stage.step_number}. {stage.stage_name}
                        </span>
                        <span className="text-xs font-bold text-stone-900">
                          {stage.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-stone-200 text-stone-700">
                          Color: {stage.accent_color || 'emerald'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleOpenEditStage(stage)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                      <span>Edit Stage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStage(stage.id)}
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                      title="Delete Stage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Website Preview Box */}
            <div className="pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-600" />
                  Live Preview: Career Progression Cards as Rendered on Public Homepage
                </span>
                <span className="text-[11px] font-mono text-emerald-600 font-semibold">
                  {stages.length} Milestones Configured
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100">
                <div className="text-center mb-6">
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase">The Engineered Pathway</span>
                  <h4 className="text-lg font-bold text-white mt-1">Your Path from Learner to Hired Engineer</h4>
                  <p className="text-xs text-slate-400 mt-0.5">A transparent progression engineered for rapid career transition</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stages.map((st, i) => (
                    <div key={st.id || i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="text-emerald-400 font-mono text-xs font-bold mb-1">
                          {st.step_number}. {st.stage_name}
                        </div>
                        <h5 className="text-sm font-bold text-white">{st.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">{st.description}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                        Phase {i + 1} of {stages.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 4. FAQS SUBTAB */}
        {subTab === 'faqs' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Frequently Asked Questions (FAQs)</h3>
                <p className="text-xs text-stone-500">Admissions questions and answers displayed in the tuition breakdown section</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddFaq}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{faq.q}</span>
                    </h4>
                    <p className="text-xs text-stone-600 pl-5 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditFaq(idx)}
                      className="p-1.5 rounded-lg border border-stone-300 hover:bg-stone-200 text-stone-600"
                      title="Edit FAQ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(idx)}
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CAMPUS LAB & HOURS SUBTAB */}
        {subTab === 'hours_lab' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-base font-bold text-stone-900">Campus Lab & Operating Hours</h3>
              <p className="text-xs text-stone-500">Configure physical campus availability at Teamshark 5th Floor, Ngong Road</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Weekday Hours */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Weekday Hours Description
                </label>
                <input
                  type="text"
                  value={formData.weekday_hours || ''}
                  onChange={(e) => handleInputChange('weekday_hours', e.target.value)}
                  placeholder="Monday – Friday: 8:00 AM – 8:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Weekend Hours */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Weekend / Saturday Clinics
                </label>
                <input
                  type="text"
                  value={formData.weekend_hours || ''}
                  onChange={(e) => handleInputChange('weekend_hours', e.target.value)}
                  placeholder="Saturday Coding Clinics: 9:00 AM – 4:00 PM (Sunday Closed)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Short Hours Label */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Short Hours Badge Label
                </label>
                <input
                  type="text"
                  value={formData.short_hours_label || ''}
                  onChange={(e) => handleInputChange('short_hours_label', e.target.value)}
                  placeholder="Mon–Sat 8:00 AM–8:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Opens / Closes Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Opens Time (24h)
                  </label>
                  <input
                    type="time"
                    value={formData.opens_time || '08:00'}
                    onChange={(e) => handleInputChange('opens_time', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Closes Time (24h)
                  </label>
                  <input
                    type="time"
                    value={formData.closes_time || '20:00'}
                    onChange={(e) => handleInputChange('closes_time', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              {/* Campus Coverage & Equipment */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Facility Equipment & Coverage Statement
                </label>
                <textarea
                  rows={3}
                  value={formData.coverage || ''}
                  onChange={(e) => handleInputChange('coverage', e.target.value)}
                  placeholder="Physical campus at Ngong Road, Teamshark 5th Floor, Nairobi & Online cohorts across East Africa. Gigabit Wi-Fi, backup power..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 leading-relaxed"
                />
              </div>

            </div>
          </div>
        )}

        {/* 5. CONTACT & ABOUT SUBTAB */}
        {subTab === 'contact_about' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-base font-bold text-stone-900">Contact Details & About Mission</h3>
              <p className="text-xs text-stone-500">Official admissions channels, WhatsApp link, and institute story</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Primary Phone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Primary WhatsApp / Phone Number
                </label>
                <input
                  type="text"
                  value={formData.primary_phone || ''}
                  onChange={(e) => handleInputChange('primary_phone', e.target.value)}
                  placeholder="+254 756 295 128"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Secondary Phone */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Secondary Campus Phone
                </label>
                <input
                  type="text"
                  value={formData.secondary_phone || ''}
                  onChange={(e) => handleInputChange('secondary_phone', e.target.value)}
                  placeholder="+254 717 434 845"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Official Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Admissions Email Address
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="info@codepointkenya.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Social / Instagram */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Instagram / Social Handle
                </label>
                <input
                  type="text"
                  value={formData.social_instagram || ''}
                  onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                  placeholder="Code Point Kenya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* Physical Address */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Physical Campus Lab Address
                </label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Ngong Road, Teamshark, 5th Floor, Nairobi, Kenya"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* About Section Title */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  About Mission Title
                </label>
                <input
                  type="text"
                  value={formData.about_title || ''}
                  onChange={(e) => handleInputChange('about_title', e.target.value)}
                  placeholder="Accelerating Africa's Next Generation of Tech Leaders"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-bold focus:outline-none focus:border-stone-900"
                />
              </div>

              {/* About Section Body */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  About Mission Body Text
                </label>
                <textarea
                  rows={4}
                  value={formData.about_body || ''}
                  onChange={(e) => handleInputChange('about_body', e.target.value)}
                  placeholder="Code Point Kenya was founded with a single mission..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 leading-relaxed"
                />
              </div>

            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 flex items-center justify-between shadow-xs">
          <span className="text-xs text-stone-500">
            Ensure changes are reviewed before publishing live
          </span>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-stone-900/20 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-amber-400" />
            )}
            <span>Save All Content</span>
          </button>
        </div>

      </form>
      )}

      {/* Slide Modal */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h4 className="text-sm font-bold text-stone-900">
                Edit Carousel Slide
              </h4>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <ImageUploadField
                label="Slide Background Image"
                value={editingSlide.image}
                onChange={(val) => setEditingSlide(prev => prev ? { ...prev, image: val } : null)}
                helperText="Upload custom cohort picture or paste high-res photography URL"
              />

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Slide Badge
                </label>
                <input
                  type="text"
                  value={editingSlide.badge}
                  onChange={(e) => setEditingSlide(prev => prev ? { ...prev, badge: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Headline Prefix
                  </label>
                  <input
                    type="text"
                    value={editingSlide.headlinePrefix}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, headlinePrefix: e.target.value } : null)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Headline Highlight *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSlide.headlineHighlight}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, headlineHighlight: e.target.value } : null)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingSlide.description}
                  onChange={(e) => setEditingSlide(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Pill Label
                  </label>
                  <input
                    type="text"
                    value={editingSlide.pillLabel}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, pillLabel: e.target.value } : null)}
                    placeholder="Tech Accelerator"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Quick Highlight
                  </label>
                  <input
                    type="text"
                    value={editingSlide.quickHighlight}
                    onChange={(e) => setEditingSlide(prev => prev ? { ...prev, quickHighlight: e.target.value } : null)}
                    placeholder="94% Grad Placement"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
                >
                  Save Slide
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h4 className="text-sm font-bold text-stone-900">
                {editingFaqIndex !== null ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </h4>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={faqModalData.q}
                  onChange={(e) => setFaqModalData(prev => ({ ...prev, q: e.target.value }))}
                  placeholder="e.g. Do I need prior coding experience to join?"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  required
                  value={faqModalData.a}
                  onChange={(e) => setFaqModalData(prev => ({ ...prev, a: e.target.value }))}
                  placeholder="Provide a clear, detailed answer for prospective students..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
                >
                  Save FAQ Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progression Stage Modal */}
      {isStageModalOpen && editingStage && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Edit Progression Milestone</span>
                </h4>
                <p className="text-xs text-stone-500">Configure phase details and public card styling</p>
              </div>
              <button
                type="button"
                onClick={() => setIsStageModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStageModal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Step Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStage.step_number}
                    onChange={(e) => setEditingStage(prev => prev ? { ...prev, step_number: e.target.value } : null)}
                    placeholder="e.g. 01"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Stage Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStage.stage_name}
                    onChange={(e) => setEditingStage(prev => prev ? { ...prev, stage_name: e.target.value } : null)}
                    placeholder="e.g. Immersion"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Milestone Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingStage.title}
                  onChange={(e) => setEditingStage(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="e.g. Foundations & Code"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Stage Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingStage.description}
                  onChange={(e) => setEditingStage(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Detail the skills, tools, and milestone outcomes fellows master in this phase..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-stone-900 leading-relaxed"
                />
              </div>

              {/* Accent Color Picker */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Card Accent Theme Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
                    { id: 'teal', label: 'Teal', bg: 'bg-teal-500' },
                    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
                    { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
                    { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
                    { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
                    { id: 'violet', label: 'Violet', bg: 'bg-violet-500' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditingStage(prev => prev ? { ...prev, accent_color: c.id } : null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        editingStage.accent_color === c.id
                          ? 'ring-2 ring-stone-900 ring-offset-1 bg-stone-900 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStageModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Apply Stage Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
