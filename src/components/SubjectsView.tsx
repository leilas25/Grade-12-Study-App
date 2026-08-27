import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Brain,
  HelpCircle,
  Gamepad2,
  ChevronRight,
  Sparkles,
  Dna,
  Calculator,
  Atom,
  Globe,
  Receipt,
  Briefcase,
  Layers,
  Upload,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { SubjectConfig } from '../types';

interface SubjectsViewProps {
  onSelectTopic: (subjectId: string, topicId: string, initialTab?: string) => void;
  onOpenUpload: (subjectId?: string, topicId?: string) => void;
}

const getSubjectIcon = (iconName: string) => {
  switch (iconName) {
    case 'Dna':
      return <Dna className="w-5 h-5" />;
    case 'Calculator':
      return <Calculator className="w-5 h-5" />;
    case 'Atom':
      return <Atom className="w-5 h-5" />;
    case 'Globe':
      return <Globe className="w-5 h-5" />;
    case 'Receipt':
      return <Receipt className="w-5 h-5" />;
    case 'Briefcase':
      return <Briefcase className="w-5 h-5" />;
    default:
      return <BookOpen className="w-5 h-5" />;
  }
};

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  onSelectTopic,
  onOpenUpload,
}) => {
  const { subjects, addCustomSubject, addCustomTopic } = useStudy();
  const [filter, setFilter] = useState<'enrolled' | 'all' | 'custom'>('enrolled');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');

  const filteredSubjects = subjects.filter((s) => {
    if (filter === 'enrolled' && !s.isEnrolled) return false;
    if (filter === 'custom' && !s.isCustom) return false;
    if (searchTerm) {
      const matchSub = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTopic = s.topics.some((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchSub || matchTopic;
    }
    return true;
  });

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || filteredSubjects[0];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const newId = addCustomSubject(newSubName.trim());
    setSelectedSubjectId(newId);
    setNewSubName('');
    setShowAddSubjectModal(false);
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !activeSubject) return;
    const topicId = addCustomTopic(activeSubject.id, newTopicName.trim());
    setNewTopicName('');
    setShowAddTopicModal(false);
    onSelectTopic(activeSubject.id, topicId, 'upload');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Grade 12 Subjects & Topics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse curriculum topics, access Smart Notes, review flashcards, and run exam practice.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subjects or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-600/20 whitespace-nowrap transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        <button
          onClick={() => setFilter('enrolled')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            filter === 'enrolled'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Enrolled Subjects ({subjects.filter((s) => s.isEnrolled).length})
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Matric Subjects ({subjects.length})
        </button>

        <button
          onClick={() => setFilter('custom')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            filter === 'custom'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Custom Subjects ({subjects.filter((s) => s.isCustom).length})
        </button>
      </div>

      {/* Main 2-Column Layout: Subject Selector on Left, Topic Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Subjects list (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {filteredSubjects.map((sub) => {
            const isSelected = activeSubject?.id === sub.id;
            const totalTopics = sub.topics.length;
            const avgProgress =
              totalTopics > 0
                ? Math.round(
                    sub.topics.reduce((acc, t) => acc + (t.progressPercentage || 0), 0) /
                      totalTopics
                  )
                : 0;

            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-850 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white/60 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: sub.color }}
                    >
                      {getSubjectIcon(sub.iconName)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {sub.name}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {totalTopics} {totalTopics === 1 ? 'Topic' : 'Topics'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {avgProgress}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${avgProgress}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Topics List for Selected Subject (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeSubject ? (
            <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Subject Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: activeSubject.color }}
                  >
                    {getSubjectIcon(activeSubject.iconName)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {activeSubject.name}
                    </h2>
                    <span className="text-xs text-slate-400">
                      {activeSubject.topics.length} Curriculum Topics
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddTopicModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Topic</span>
                </button>
              </div>

              {/* Topics Grid */}
              <div className="space-y-3">
                {activeSubject.topics.map((topic) => {
                  const hasCards = (topic.flashcards?.length || 0) > 0;
                  const hasQuiz = (topic.quizQuestions?.length || 0) > 0;

                  return (
                    <div
                      key={topic.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {topic.name}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              topic.masteryLevel === 'mastered'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                : topic.masteryLevel === 'needs_practice'
                                ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                                : topic.masteryLevel === 'in_progress'
                                ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {topic.masteryLevel?.replace('_', ' ') || 'Not Started'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                          <span>{topic.progressPercentage || 0}% Mastered</span>
                          <span>•</span>
                          <span>{topic.flashcards?.length || 0} Flashcards</span>
                          <span>•</span>
                          <span>{topic.quizQuestions?.length || 0} Questions</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectTopic(activeSubject.id, topic.id, 'smart_notes')}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                        >
                          <span>Study Topic</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onOpenUpload(activeSubject.id, topic.id)}
                          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                          title="Upload/Regenerate Notes"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              Select a subject to view curriculum topics.
            </div>
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Custom Grade 12 Subject
            </h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Subject Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Information Technology, History, Visual Arts"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showAddTopicModal && activeSubject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Topic to {activeSubject.name}
            </h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Topic Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meiosis, Calculus, Electric Circuits"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  Create & Upload Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
