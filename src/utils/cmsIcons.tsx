import React from 'react';
import { 
  Layout, 
  Layers, 
  Braces, 
  Database, 
  Server, 
  GitBranch, 
  Terminal, 
  Code2, 
  Cpu, 
  Globe, 
  Moon, 
  Sun, 
  Calendar, 
  Clock, 
  Laptop, 
  MapPin, 
  Users, 
  Rocket, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  BookOpen, 
  Briefcase, 
  Key, 
  FileCode, 
  Compass, 
  Flame, 
  GraduationCap, 
  Target
} from 'lucide-react';

export const AVAILABLE_CMS_ICONS: { name: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  // Authentic Technology & Brand Icons
  { 
    name: 'bi-filetype-html', 
    label: 'HTML5 & CSS3 (bi-filetype-html)', 
    icon: ({ className }) => <i className={`bi bi-filetype-html ${className || 'w-6 h-6'}`} style={{ fontSize: '1.25rem', lineHeight: 1 }} /> 
  },
  { 
    name: 'bi-code-slash', 
    label: 'HTML/Web Code (bi-code-slash)', 
    icon: ({ className }) => <i className={`bi bi-code-slash ${className || 'w-6 h-6'}`} style={{ fontSize: '1.25rem', lineHeight: 1 }} /> 
  },
  { 
    name: 'bi-bootstrap-fill', 
    label: 'Bootstrap 5 (bi-bootstrap-fill)', 
    icon: ({ className }) => <i className={`bi bi-bootstrap-fill ${className || 'w-6 h-6'}`} style={{ fontSize: '1.25rem', lineHeight: 1 }} /> 
  },
  { 
    name: 'bi-filetype-js', 
    label: 'JavaScript (bi-filetype-js)', 
    icon: ({ className }) => <i className={`bi bi-filetype-js ${className || 'w-6 h-6'}`} style={{ fontSize: '1.25rem', lineHeight: 1 }} /> 
  },
  { 
    name: 'bi-database-fill-gear', 
    label: 'SQL & PostgreSQL (bi-database-fill-gear)', 
    icon: ({ className }) => <i className={`bi bi-database-fill-gear ${className || 'w-6 h-6'}`} style={{ fontSize: '1.25rem', lineHeight: 1 }} /> 
  },
  { 
    name: 'bi-database-check', 
    label: 'Database Systems (bi-database-check)', 
    icon: ({ className }) => <i className={`bi bi-database-check ${className || 'w-6 h-6'}`} style={{ fontSize: '1.25rem', lineHeight: 1 }} /> 
  },
  { 
    name: 'bi-filetype-py', 
    label: 'Python & Flask (bi-filetype-py)', 
    icon: ({ className }) => <i className={`bi bi-filetype-py ${className || 'w-6 h-6'}`} style={{ fontSize: '1.25rem', lineHeight: 1 }} /> 
  },
  { 
    name: 'bi-terminal-box', 
    label: 'Python CLI (bi-terminal-box)', 
    icon: ({ className }) => <i className={`bi bi-terminal-box ${className || 'w-6 h-6'}`} style={{ fontSize: '1.25rem', lineHeight: 1 }} /> 
  },
  { 
    name: 'bi-git', 
    label: 'Git Version Control (bi-git)', 
    icon: ({ className }) => <i className={`bi bi-git ${className || 'w-6 h-6'}`} style={{ fontSize: '1.25rem', lineHeight: 1 }} /> 
  },
  { 
    name: 'bi-cloud-arrow-up-fill', 
    label: 'Vercel / Cloud Deployment (bi-cloud-arrow-up-fill)', 
    icon: ({ className }) => <i className={`bi bi-cloud-arrow-up-fill ${className || 'w-6 h-6'}`} style={{ fontSize: '1.25rem', lineHeight: 1 }} /> 
  },
  // Lucide UI Icons
  { name: 'Layout', label: 'Layout (HTML/CSS)', icon: Layout },
  { name: 'Layers', label: 'Layers (UI Framework)', icon: Layers },
  { name: 'Braces', label: 'Braces (JavaScript)', icon: Braces },
  { name: 'Database', label: 'Database (SQL/Postgres)', icon: Database },
  { name: 'Server', label: 'Server (Python/Backend)', icon: Server },
  { name: 'GitBranch', label: 'Git Branch (DevOps)', icon: GitBranch },
  { name: 'Terminal', label: 'Terminal / CLI', icon: Terminal },
  { name: 'Code2', label: 'Code Block', icon: Code2 },
  { name: 'FileCode', label: 'File Code', icon: FileCode },
  { name: 'Cpu', label: 'CPU / Systems', icon: Cpu },
  { name: 'Globe', label: 'Globe / Web', icon: Globe },
  { name: 'Moon', label: 'Moon (Evening Track)', icon: Moon },
  { name: 'Sun', label: 'Sun (Weekend Track)', icon: Sun },
  { name: 'Calendar', label: 'Calendar / Schedule', icon: Calendar },
  { name: 'Clock', label: 'Clock / Timetable', icon: Clock },
  { name: 'Laptop', label: 'Laptop / Virtual Lab', icon: Laptop },
  { name: 'MapPin', label: 'Map Pin / Campus Hub', icon: MapPin },
  { name: 'Users', label: 'Users / Mentorship', icon: Users },
  { name: 'Rocket', label: 'Rocket / Real Projects', icon: Rocket },
  { name: 'Award', label: 'Award / Certificate', icon: Award },
  { name: 'ShieldCheck', label: 'Shield / Verification', icon: ShieldCheck },
  { name: 'Sparkles', label: 'Sparkles / Advantage', icon: Sparkles },
  { name: 'Zap', label: 'Zap / Fast Pace', icon: Zap },
  { name: 'BookOpen', label: 'Book / Curriculum', icon: BookOpen },
  { name: 'Briefcase', label: 'Briefcase / Career', icon: Briefcase },
  { name: 'GraduationCap', label: 'Graduation Cap', icon: GraduationCap },
  { name: 'Target', label: 'Target / Goals', icon: Target },
  { name: 'Compass', label: 'Compass / Guidance', icon: Compass },
  { name: 'Flame', label: 'Flame / Hot Skills', icon: Flame }
];

export function renderCmsIcon(iconName: string, className: string = 'w-6 h-6 text-emerald-400') {
  if (!iconName) return <Code2 className={className} />;

  // Support direct Bootstrap Icons syntax (e.g. 'bi-filetype-html' or 'bi bi-filetype-html')
  if (iconName.startsWith('bi-') || iconName.startsWith('bi ')) {
    const cleanClass = iconName.startsWith('bi ') ? iconName : `bi ${iconName}`;
    return <i className={`${cleanClass} ${className} flex items-center justify-center`} style={{ fontSize: '1.25rem', lineHeight: 1 }} />;
  }

  // Support brand names directly
  const lower = iconName.toLowerCase();
  if (lower === 'html5' || lower === 'html') {
    return <i className={`bi bi-filetype-html ${className} flex items-center justify-center`} style={{ fontSize: '1.25rem', lineHeight: 1 }} />;
  }
  if (lower === 'bootstrap') {
    return <i className={`bi bi-bootstrap-fill ${className} flex items-center justify-center`} style={{ fontSize: '1.25rem', lineHeight: 1 }} />;
  }
  if (lower === 'javascript' || lower === 'js') {
    return <i className={`bi bi-filetype-js ${className} flex items-center justify-center`} style={{ fontSize: '1.25rem', lineHeight: 1 }} />;
  }
  if (lower === 'postgres' || lower === 'postgresql' || lower === 'sql') {
    return <i className={`bi bi-database-fill-gear ${className} flex items-center justify-center`} style={{ fontSize: '1.25rem', lineHeight: 1 }} />;
  }
  if (lower === 'python' || lower === 'flask') {
    return <i className={`bi bi-filetype-py ${className} flex items-center justify-center`} style={{ fontSize: '1.25rem', lineHeight: 1 }} />;
  }
  if (lower === 'git' || lower === 'vercel') {
    return <i className={`bi bi-git ${className} flex items-center justify-center`} style={{ fontSize: '1.25rem', lineHeight: 1 }} />;
  }

  const match = AVAILABLE_CMS_ICONS.find(i => i.name.toLowerCase() === iconName.toLowerCase());
  const IconComponent = match ? match.icon : Code2;
  return <IconComponent className={className} />;
}
