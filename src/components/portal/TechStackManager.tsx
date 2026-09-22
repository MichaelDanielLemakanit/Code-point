import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Sparkles,
  Layers,
  Terminal,
  AlertCircle
} from 'lucide-react';
import { SiteSettings, TechnologiesSectionData, TechCardItem } from '../../types';
import { AVAILABLE_CMS_ICONS, renderCmsIcon } from '../../utils/cmsIcons';

interface TechStackManagerProps {
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (settings: SiteSettings) => Promise<boolean>;
  onSettingsUpdated?: () => void;
  showToast?: (msg: string) => void;
}

const DEFAULT_TECH_DATA: TechnologiesSectionData = {
  badge_text: 'Modern Industry Tooling',
  title: 'Technologies You Will Master',
  subtitle: 'Practical stack tailored for full-stack software roles',
  items: [
    {
      id: 'html-css',
      title: 'HTML5 & CSS3',
      category: 'Front-End Foundation',
      description: 'Semantic web structures and modern responsive design layouts.',
      icon_name: 'Layout',
      tags: ['Flexbox', 'Grid', 'Semantic HTML', 'CSS Variables'],
      display_order: 1,
      is_visible: true
    },
    {
      id: 'bootstrap',
      title: 'Bootstrap 5',
      category: 'UI Framework',
      description: 'Rapid front-end UI framework and responsive mobile components.',
      icon_name: 'Layers',
      tags: ['Responsive Grids', 'Components', 'Utilities', 'Mobile-First'],
      display_order: 2,
      is_visible: true
    },
    {
      id: 'javascript',
      title: 'JavaScript (ES6+)',
      category: 'Core Language',
      description: 'Client-side interactivity, DOM manipulation, and asynchronous JS.',
      icon_name: 'Braces',
      tags: ['Async/Await', 'Fetch API', 'DOM APIs', 'ES Modules'],
      display_order: 3,
      is_visible: true
    },
    {
      id: 'sql-postgres',
      title: 'SQL & PostgreSQL',
      category: 'Database Systems',
      description: 'Relational database design, queries, joins, and data management.',
      icon_name: 'Database',
      tags: ['Schema Design', 'Complex Joins', 'Indexing', 'ACID Transactions'],
      display_order: 4,
      is_visible: true
    },
    {
      id: 'python-flask',
      title: 'Python & Flask',
      category: 'Backend & APIs',
      description: 'Backend API routes, server rendering, authentication, and SQL integrations.',
      icon_name: 'Server',
      tags: ['REST APIs', 'SQLAlchemy', 'JWT Auth', 'Jinja Templates'],
      display_order: 5,
      is_visible: true
    },
    {
      id: 'git-vercel',
      title: 'Git & Vercel',
      category: 'DevOps & Deployment',
      description: 'Version control workflows, cloud deployment, and live hosting.',
      icon_name: 'GitBranch',
      tags: ['Git Branching', 'CI/CD Pipelines', 'Cloud Hosting', 'SSL/Domains'],
      display_order: 6,
      is_visible: true
    }
  ]
};

export const TechStackManager: React.FC<TechStackManagerProps> = ({
  siteSettings,
  onUpdateSiteSettings,
  onSettingsUpdated,
  showToast
}) => {
  const [data, setData] = useState<TechnologiesSectionData>(DEFAULT_TECH_DATA);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<TechCardItem | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [localToast, setLocalToast] = useState<string | null>(null);

  // Synchronize from props or remote settings
  useEffect(() => {
    if (siteSettings?.technologies_section_json) {
      try {
        const parsed = JSON.parse(siteSettings.technologies_section_json);
        if (parsed && Array.isArray(parsed.items)) {
          setData({
            badge_text: parsed.badge_text || DEFAULT_TECH_DATA.badge_text,
            title: parsed.title || DEFAULT_TECH_DATA.title,
            subtitle: parsed.subtitle || DEFAULT_TECH_DATA.subtitle,
            items: parsed.items
          });
        }
      } catch (e) {
        console.warn('Failed to parse technologies_section_json', e);
      }
    }
  }, [siteSettings?.technologies_section_json]);

  const triggerToast = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      setLocalToast(msg);
      setTimeout(() => setLocalToast(null), 3000);
    }
  };

  const handleSave = async (customData?: TechnologiesSectionData) => {
    const dataToSave = customData || data;
    setSaving(true);
    try {
      const payload = {
        technologies_section_json: JSON.stringify(dataToSave)
      };

      if (onUpdateSiteSettings) {
        await onUpdateSiteSettings(payload as any);
      } else {
        const res = await fetch('/api/site-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to save to database');
      }

      if (onSettingsUpdated) {
        onSettingsUpdated();
      }

      triggerToast('Technologies section successfully saved and published!');
    } catch (err: any) {
      console.error(err);
      triggerToast('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Reorder items
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...data.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // re-assign display orders
    newItems.forEach((item, idx) => {
      item.display_order = idx + 1;
    });

    const updated = { ...data, items: newItems };
    setData(updated);
  };

  // Toggle visibility
  const toggleVisibility = (index: number) => {
    const newItems = [...data.items];
    newItems[index].is_visible = newItems[index].is_visible === false ? true : false;
    const updated = { ...data, items: newItems };
    setData(updated);
  };

  // Delete item
  const deleteItem = (index: number) => {
    if (!window.confirm(`Delete "${data.items[index].title}"?`)) return;
    const newItems = data.items.filter((_, idx) => idx !== index);
    newItems.forEach((item, idx) => {
      item.display_order = idx + 1;
    });
    const updated = { ...data, items: newItems };
    setData(updated);
  };

  // Open modal or form to edit item
  const openEditModal = (item?: TechCardItem) => {
    if (item) {
      setEditingItem({ ...item });
      setTagsInput(item.tags?.join(', ') || '');
    } else {
      const newItem: TechCardItem = {
        id: `tech-${Date.now()}`,
        title: '',
        category: 'Development',
        description: '',
        icon_name: 'Code2',
        tags: [],
        display_order: data.items.length + 1,
        is_visible: true
      };
      setEditingItem(newItem);
      setTagsInput('');
    }
  };

  const saveEditingItem = () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      alert('Please enter a title for the technology card.');
      return;
    }

    const cleanTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const updatedItem = {
      ...editingItem,
      tags: cleanTags
    };

    const existingIndex = data.items.findIndex(i => i.id === updatedItem.id);
    let newItems = [...data.items];

    if (existingIndex >= 0) {
      newItems[existingIndex] = updatedItem;
    } else {
      newItems.push(updatedItem);
    }

    newItems.forEach((item, idx) => {
      item.display_order = idx + 1;
    });

    const updated = { ...data, items: newItems };
    setData(updated);
    setEditingItem(null);
  };

  const handleResetToDefault = () => {
    if (!window.confirm('Reset the Technologies section to default initial content?')) return;
    setData(DEFAULT_TECH_DATA);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {localToast && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{localToast}</span>
          <button onClick={() => setLocalToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Terminal className="w-4 h-4" />
            <span>Technologies You Will Master</span>
          </div>
          <h3 className="text-lg font-bold text-white">Technology Stack CMS Manager</h3>
          <p className="text-xs text-slate-400 mt-1">
            Customize the modern stack cards, categories, tags, and icon representations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetToDefault}
            type="button"
            className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to factory default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => handleSave()}
            disabled={saving}
            type="button"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Section Header Inputs */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Section Header Settings</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Top Badge Text
            </label>
            <input
              type="text"
              value={data.badge_text}
              onChange={(e) => setData({ ...data, badge_text: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="e.g. Modern Industry Tooling"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="e.g. Technologies You Will Master"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Section Subtitle / Description
            </label>
            <input
              type="text"
              value={data.subtitle}
              onChange={(e) => setData({ ...data, subtitle: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="e.g. Practical stack tailored for full-stack software roles"
            />
          </div>
        </div>
      </div>

      {/* Cards List Manager */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Technology Cards ({data.items.length})</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Reorder, toggle visibility, edit details or add new cards.
            </p>
          </div>

          <button
            onClick={() => openEditModal()}
            type="button"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Technology Card</span>
          </button>
        </div>

        {/* Items Table / Cards */}
        <div className="space-y-3">
          {data.items.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.is_visible === false
                  ? 'bg-slate-950/60 border-slate-850 opacity-60'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                  {renderCmsIcon(item.icon_name, 'w-5 h-5 text-emerald-400')}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="text-sm font-bold text-white truncate">{item.title}</h5>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {item.category}
                    </span>
                    {item.is_visible === false && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {item.tags.map((t, ti) => (
                        <span key={ti} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                {/* Move Up */}
                <button
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === data.items.length - 1}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Toggle Visibility */}
                <button
                  onClick={() => toggleVisibility(idx)}
                  className={`p-1.5 rounded-lg border cursor-pointer ${
                    item.is_visible === false
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-emerald-400'
                  }`}
                  title={item.is_visible === false ? 'Show on Public Site' : 'Hide from Public Site'}
                >
                  {item.is_visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title="Edit Card"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteItem(idx)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-400/80 hover:text-rose-400 cursor-pointer"
                  title="Delete Card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>{editingItem.id.startsWith('tech-') && !data.items.some(i => i.id === editingItem.id) ? 'Add Technology' : 'Edit Technology'}</span>
              </h4>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Card Title *
                </label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. JavaScript (ES6+)"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    placeholder="e.g. Core Language"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Icon Selector
                  </label>
                  <select
                    value={editingItem.icon_name}
                    onChange={(e) => setEditingItem({ ...editingItem, icon_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {AVAILABLE_CMS_ICONS.map(ic => (
                      <option key={ic.name} value={ic.name}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Icon Visual Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {renderCmsIcon(editingItem.icon_name, 'w-5 h-5 text-emerald-400')}
                </div>
                <div className="text-xs text-slate-400">
                  <span>Selected Icon Preview: </span>
                  <span className="text-white font-mono">{editingItem.icon_name}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Card Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Explain what the student learns with this technology..."
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skills / Concept Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Async/Await, Fetch API, DOM APIs, ES Modules"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Separate tags with commas. These appear at the bottom of the card.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tech-visible"
                  checked={editingItem.is_visible !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, is_visible: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-400 bg-slate-950"
                />
                <label htmlFor="tech-visible" className="text-xs text-slate-300 cursor-pointer">
                  Visible on public website
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditingItem}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
