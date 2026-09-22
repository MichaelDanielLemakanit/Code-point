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
  Calendar,
  Clock,
  Laptop,
  MapPin
} from 'lucide-react';
import { SiteSettings, ClassSchedulesSectionData, ScheduleTrackItem } from '../../types';
import { AVAILABLE_CMS_ICONS, renderCmsIcon } from '../../utils/cmsIcons';

interface ClassSchedulesManagerProps {
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (settings: SiteSettings) => Promise<boolean>;
  onSettingsUpdated?: () => void;
  showToast?: (msg: string) => void;
}

const DEFAULT_SCHEDULES_DATA: ClassSchedulesSectionData = {
  badge_text: 'Structured Timetable Tracks',
  title: 'Flexible Class Schedules',
  subtitle: 'Choose a timing track that fits into your daily work or school routine.',
  items: [
    {
      id: 'evening-track',
      title: 'Evening Track',
      schedule: 'Monday – Thursday',
      time_badge: '2:00 PM – 4:00 PM EAT',
      accent_badge: 'Weekday Momentum',
      recommended_for: 'Working Professionals & Students',
      description: 'Ideal for full-time employees and university students who want to study after hours.',
      icon_name: 'Moon',
      highlights: [
        'Live online lecture streaming & code walkthroughs',
        'Daily mentor Q&A and active code review channels',
        'Full recordings stored in student portal',
        'Optional Ngong Road campus lab access'
      ],
      campus_note: 'Ngong Rd Lab Included',
      online_note: 'Live Online Sync',
      display_order: 1,
      is_visible: true
    },
    {
      id: 'weekend-track',
      title: 'Weekend Track',
      schedule: 'Saturdays Only',
      time_badge: '9:00 AM – 4:00 PM EAT',
      accent_badge: 'High-Impact Immersion',
      recommended_for: 'Busy Weekday Professionals',
      description: 'Intensive weekend coding lab designed for busy professionals during weekdays.',
      icon_name: 'Sun',
      highlights: [
        'Full-day Saturday immersive coding labs & sprint reviews',
        '1-on-1 architecture clinics at our Ngong Road campus',
        'Weekly asynchronous assignments with midweek feedback',
        'Collaborative peer hackathons & team project building'
      ],
      campus_note: 'Ngong Rd Lab Included',
      online_note: 'Live Online Sync',
      display_order: 2,
      is_visible: true
    }
  ]
};

export const ClassSchedulesManager: React.FC<ClassSchedulesManagerProps> = ({
  siteSettings,
  onUpdateSiteSettings,
  onSettingsUpdated,
  showToast
}) => {
  const [data, setData] = useState<ClassSchedulesSectionData>(DEFAULT_SCHEDULES_DATA);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleTrackItem | null>(null);
  const [highlightsInput, setHighlightsInput] = useState('');
  const [localToast, setLocalToast] = useState<string | null>(null);

  useEffect(() => {
    if (siteSettings?.class_schedules_section_json) {
      try {
        const parsed = JSON.parse(siteSettings.class_schedules_section_json);
        if (parsed && Array.isArray(parsed.items)) {
          setData({
            badge_text: parsed.badge_text || DEFAULT_SCHEDULES_DATA.badge_text,
            title: parsed.title || DEFAULT_SCHEDULES_DATA.title,
            subtitle: parsed.subtitle || DEFAULT_SCHEDULES_DATA.subtitle,
            items: parsed.items
          });
        }
      } catch (e) {
        console.warn('Failed to parse class_schedules_section_json', e);
      }
    }
  }, [siteSettings?.class_schedules_section_json]);

  const triggerToast = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      setLocalToast(msg);
      setTimeout(() => setLocalToast(null), 3000);
    }
  };

  const handleSave = async (customData?: ClassSchedulesSectionData) => {
    const dataToSave = customData || data;
    setSaving(true);
    try {
      const payload = {
        class_schedules_section_json: JSON.stringify(dataToSave)
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

      triggerToast('Class Schedules section successfully saved and published!');
    } catch (err: any) {
      console.error(err);
      triggerToast('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...data.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    newItems.forEach((item, idx) => {
      item.display_order = idx + 1;
    });

    const updated = { ...data, items: newItems };
    setData(updated);
  };

  const toggleVisibility = (index: number) => {
    const newItems = [...data.items];
    newItems[index].is_visible = newItems[index].is_visible === false ? true : false;
    const updated = { ...data, items: newItems };
    setData(updated);
  };

  const deleteItem = (index: number) => {
    if (!window.confirm(`Delete timetable track "${data.items[index].title}"?`)) return;
    const newItems = data.items.filter((_, idx) => idx !== index);
    newItems.forEach((item, idx) => {
      item.display_order = idx + 1;
    });
    const updated = { ...data, items: newItems };
    setData(updated);
  };

  const openEditModal = (item?: ScheduleTrackItem) => {
    if (item) {
      setEditingItem({ ...item });
      setHighlightsInput(item.highlights?.join('\n') || '');
    } else {
      const newItem: ScheduleTrackItem = {
        id: `track-${Date.now()}`,
        title: '',
        schedule: 'Monday – Thursday',
        time_badge: '6:00 PM – 8:00 PM EAT',
        accent_badge: 'Flexible Timing',
        recommended_for: 'All Learners',
        description: '',
        icon_name: 'Clock',
        highlights: [],
        campus_note: 'Ngong Rd Lab Included',
        online_note: 'Live Online Sync',
        display_order: data.items.length + 1,
        is_visible: true
      };
      setEditingItem(newItem);
      setHighlightsInput('');
    }
  };

  const saveEditingItem = () => {
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      alert('Please enter a track title.');
      return;
    }

    const cleanHighlights = highlightsInput
      .split('\n')
      .map(h => h.trim())
      .filter(h => h.length > 0);

    const updatedItem = {
      ...editingItem,
      highlights: cleanHighlights
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
    if (!window.confirm('Reset Class Schedules to default initial content?')) return;
    setData(DEFAULT_SCHEDULES_DATA);
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
            <Calendar className="w-4 h-4" />
            <span>Class Timetable Tracks</span>
          </div>
          <h3 className="text-lg font-bold text-white">Class Schedules CMS Manager</h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure section header, days of week, timing badges, features, and campus access notes.
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
              placeholder="e.g. Structured Timetable Tracks"
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
              placeholder="e.g. Flexible Class Schedules"
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
              placeholder="e.g. Choose a timing track that fits into your daily work or school routine."
            />
          </div>
        </div>
      </div>

      {/* Schedule Tracks List */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Timing Tracks ({data.items.length})</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit schedule days, time badges, accent chips, and curriculum delivery notes.
            </p>
          </div>

          <button
            onClick={() => openEditModal()}
            type="button"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Schedule Track</span>
          </button>
        </div>

        {/* Tracks List */}
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
                    <h5 className="text-sm font-bold text-white">{item.title}</h5>
                    {item.accent_badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {item.accent_badge}
                      </span>
                    )}
                    {item.is_visible === false && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        Hidden
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300 mt-1">
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3 h-3 text-emerald-400" />
                      {item.schedule}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-300 font-mono">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {item.time_badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                <button
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === data.items.length - 1}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

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

                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  title="Edit Track"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => deleteItem(idx)}
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-400/80 hover:text-rose-400 cursor-pointer"
                  title="Delete Track"
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
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>{editingItem.id.startsWith('track-') && !data.items.some(i => i.id === editingItem.id) ? 'Add Schedule Track' : 'Edit Schedule Track'}</span>
              </h4>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Track Title *
                  </label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="e.g. Evening Track"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Accent Badge
                  </label>
                  <input
                    type="text"
                    value={editingItem.accent_badge}
                    onChange={(e) => setEditingItem({ ...editingItem, accent_badge: e.target.value })}
                    placeholder="e.g. Weekday Momentum"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Days / Schedule
                  </label>
                  <input
                    type="text"
                    value={editingItem.schedule}
                    onChange={(e) => setEditingItem({ ...editingItem, schedule: e.target.value })}
                    placeholder="e.g. Monday – Thursday"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Time Range Badge
                  </label>
                  <input
                    type="text"
                    value={editingItem.time_badge}
                    onChange={(e) => setEditingItem({ ...editingItem, time_badge: e.target.value })}
                    placeholder="e.g. 2:00 PM – 4:00 PM EAT"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Recommended For
                  </label>
                  <input
                    type="text"
                    value={editingItem.recommended_for}
                    onChange={(e) => setEditingItem({ ...editingItem, recommended_for: e.target.value })}
                    placeholder="e.g. Working Professionals & Students"
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
                  Track Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Describe who this schedule fits best..."
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Track Highlights / Inclusions (One per line)
                </label>
                <textarea
                  rows={4}
                  value={highlightsInput}
                  onChange={(e) => setHighlightsInput(e.target.value)}
                  placeholder="Live online lecture streaming & code walkthroughs&#10;Daily mentor Q&A and active code review channels&#10;Full recordings stored in student portal&#10;Optional Ngong Road campus lab access"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter each highlight bullet on a new line.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Campus Access Note
                  </label>
                  <input
                    type="text"
                    value={editingItem.campus_note || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, campus_note: e.target.value })}
                    placeholder="e.g. Ngong Rd Lab Included"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Online Access Note
                  </label>
                  <input
                    type="text"
                    value={editingItem.online_note || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, online_note: e.target.value })}
                    placeholder="e.g. Live Online Sync"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="track-visible"
                  checked={editingItem.is_visible !== false}
                  onChange={(e) => setEditingItem({ ...editingItem, is_visible: e.target.checked })}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-400 bg-slate-950"
                />
                <label htmlFor="track-visible" className="text-xs text-slate-300 cursor-pointer">
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
