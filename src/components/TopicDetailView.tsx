import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  HelpCircle,
  Gamepad2,
  Upload,
  Sparkles,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { SubjectConfig, Topic } from '../types';
import { SmartNotesView } from './SmartNotesView';
import { FlashcardsView } from './FlashcardsView';
import { QuizView } from './QuizView';
import { GameCentre } from './GameCentre';

interface TopicDetailViewProps {
  subject: SubjectConfig;
  topic: Topic;
  initialTab?: string;
  onBack: () => void;
  onOpenUpload: (subjectId: string, topicId: string) => void;
}

export const TopicDetailView: React.FC<TopicDetailViewProps> = ({
  subject,
  topic,
  initialTab = 'smart_notes',
  onBack,
  onOpenUpload,
}) => {
  const [activeTab, setActiveTab] = useState<
    'smart_notes' | 'flashcards' | 'quiz' | 'games' | 'upload'
  >(initialTab as any || 'smart_notes');

  const totalCards = topic.flashcards?.length || 0;
  const knownCards = topic.flashcards?.filter((c) => c.known).length || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back Button & Title Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {subject.name}</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Mastery Level:</span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
              topic.masteryLevel === 'mastered'
                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : topic.masteryLevel === 'needs_practice'
                ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : topic.masteryLevel === 'in_progress'
                ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {topic.masteryLevel?.replace('_', ' ') || 'Not Started'}
          </span>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="bg-white dark:bg-slate-850 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('smart_notes')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'smart_notes'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Smart Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'flashcards'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Flashcards ({totalCards})</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'quiz'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quiz ({topic.quizQuestions?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'games'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Games (8)</span>
        </button>

        <button
          onClick={() => onOpenUpload(subject.id, topic.id)}
          className="py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Notes</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'smart_notes' && (
        <SmartNotesView
          topic={topic}
          subjectName={subject.name}
          onNavigateTab={setActiveTab}
          onOpenUpload={() => onOpenUpload(subject.id, topic.id)}
        />
      )}

      {activeTab === 'flashcards' && (
        <FlashcardsView
          topic={topic}
          subjectName={subject.name}
          onOpenUpload={() => onOpenUpload(subject.id, topic.id)}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'quiz' && (
        <QuizView
          topic={topic}
          subjectName={subject.name}
          onOpenUpload={() => onOpenUpload(subject.id, topic.id)}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'games' && (
        <GameCentre initialSubjectId={subject.id} initialTopicId={topic.id} />
      )}
    </div>
  );
};
