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
  const match = AVAILABLE_CMS_ICONS.find(i => i.name.toLowerCase() === (iconName || '').toLowerCase());
  const IconComponent = match ? match.icon : Code2;
  return <IconComponent className={className} />;
}
