import React, { useState } from 'react';
import {
  User,
  X,
  Check,
  Target,
  BookOpen,
  RotateCcw,
  Sparkles,
  Calendar,
  School,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface ProfilePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_COLORS = [
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Rose
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
];

export const ProfilePreferencesModal: React.FC<ProfilePreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    userProfile,
    updateProfile,
    subjects,
    toggleSubjectEnrolled,
    resetAllData,
    celebrate,
  } = useStudy();

  const [name, setName] = useState(userProfile.name);
  const [school, setSchool] = useState(userProfile.school || 'Matric High School');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(userProfile.dailyGoalMinutes);
  const [targetExamDate, setTargetExamDate] = useState(
    userProfile.targetExamDate || new Date(new Date().getFullYear(), 9, 25).toISOString().split('T')[0]
  );
  const [avatarColor, setAvatarColor] = useState(userProfile.avatarColor || '#2563EB');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Grade 12 Learner',
      school: school.trim(),
      dailyGoalMinutes: Number(dailyGoalMinutes) || 60,
      targetExamDate,
      avatarColor,
    });
    setSavedSuccess(true);
    celebrate();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all data and study progress back to clean Grade 12 defaults?'
      )
    ) {
      resetAllData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-sm"
              style={{ backgroundColor: avatarColor }}
            >
              {name ? name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Learner Profile & Preferences
              </h2>
              <p className="text-xs text-slate-400">
                Personalize your learner identity, study targets, and subject enrollments.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Learner Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
              Your Name:
            </label>
            <input
              type="text"
              required
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-semibold"
            />
          </div>

          {/* School & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                School:
              </label>
              <input
                type="text"
                placeholder="e.g. Pretoria High School"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Matric Finals Date:
              </label>
              <input
                type="date"
                value={targetExamDate}
                onChange={(e) => setTargetExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Daily Study Goal */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-400 uppercase">
                Daily Study Goal:
              </label>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {dailyGoalMinutes} Minutes / Day
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {[30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyGoalMinutes(mins)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    dailyGoalMinutes === mins
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
              Avatar Color:
            </label>
            <div className="flex items-center space-x-2.5">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAvatarColor(color)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    avatarColor === color ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {avatarColor === color && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Enrolled Subjects Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">
              Enrolled Grade 12 Subjects:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubjectEnrolled(sub.id)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                    sub.isEnrolled
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500/50 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                  }`}
                >
                  <span>{sub.name}</span>
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${
                      sub.isEnrolled ? 'bg-blue-600 text-white' : 'border border-slate-400'
                    }`}
                  >
                    {sub.isEnrolled && <Check className="w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons Row */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
