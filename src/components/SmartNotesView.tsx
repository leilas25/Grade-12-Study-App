import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  VolumeX,
  CheckCircle2,
  Brain,
  HelpCircle,
  Gamepad2,
  Upload,
  Search,
  Sparkles,
  Lightbulb,
  Copy,
  Check,
  Tag,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { SmartNotes, Topic } from '../types';
import { useStudy } from '../context/StudyContext';

interface SmartNotesViewProps {
  topic: Topic;
  subjectName: string;
  onNavigateTab: (tab: 'smart_notes' | 'flashcards' | 'quiz' | 'games' | 'upload') => void;
  onOpenUpload: () => void;
}

export const SmartNotesView: React.FC<SmartNotesViewProps> = ({
  topic,
  subjectName,
  onNavigateTab,
  onOpenUpload,
}) => {
  const { recordNoteRead } = useStudy();
  const notes = topic.notes;

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedTerm, setCopiedTerm] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [hasMarkedRead, setHasMarkedRead] = useState(topic.notesRead || false);

  if (!notes) {
    return (
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          No Smart Notes Yet for {topic.name}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload your class notes, textbook photos, or syllabus extracts. Gemini will analyze your notes and generate structured Smart Notes, flashcards, quizzes, and games.
        </p>
        <button
          onClick={onOpenUpload}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all inline-flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Material to Generate</span>
        </button>
      </div>
    );
  }

  // Text-to-speech reader using Web Speech API
  const handleToggleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
      } else {
        const textToRead = `${topic.name}. Topic Summary: ${notes.summary}. Key facts: ${notes.keyFacts.join('. ')}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsReading(false);
        utterance.onerror = () => setIsReading(false);
        window.speechSynthesis.speak(utterance);
        setIsReading(true);
      }
    }
  };

  const handleCopy = (text: string, term: string) => {
    navigator.clipboard.writeText(`${term}: ${text}`);
    setCopiedTerm(term);
    setTimeout(() => setCopiedTerm(null), 2000);
  };

  const handleMarkAsRead = () => {
    recordNoteRead(topic.subjectId, topic.id, 15);
    setHasMarkedRead(true);
  };

  const filteredDefinitions = notes.definitions.filter(
    (d) =>
      d.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-850 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <span>{subjectName}</span>
            <span>•</span>
            <span>Grade 12 CAPS / IEB</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {topic.name}
          </h1>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleToggleSpeech}
            className={`p-2.5 rounded-xl border transition-all flex items-center space-x-2 text-xs font-semibold ${
              isReading
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Read Notes Aloud"
          >
            {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isReading ? 'Stop Audio' : 'Listen'}</span>
          </button>

          <button
            onClick={handleMarkAsRead}
            disabled={hasMarkedRead}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-sm transition-all ${
              hasMarkedRead
                ? 'bg-emerald-500 text-white cursor-default'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{hasMarkedRead ? 'Read (+25 XP)' : 'Mark Studied'}</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 transition-colors"
            title="Upload/Regenerate Notes"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Topic Summary Card */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-slate-850 dark:to-indigo-950/20 rounded-3xl p-6 sm:p-8 border border-blue-100 dark:border-blue-900/30 shadow-sm space-y-3">
        <div className="flex items-center space-x-2.5 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Topic Summary & Intuition</span>
        </div>
        <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-base">
          {notes.summary}
        </p>
      </section>

      {/* 2. Key Concepts */}
      {notes.keyConcepts && notes.keyConcepts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Key Concepts & Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {notes.keyConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-blue-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {concept.title}
                  </h3>
                  {concept.tag && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {concept.tag}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {concept.explanation}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Definitions Glossary */}
      {notes.definitions && notes.definitions.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Exam Terminology & Definitions ({notes.definitions.length})
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredDefinitions.map((def, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-850 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {def.term}
                    </span>
                    <button
                      onClick={() => handleCopy(def.definition, def.term)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Copy definition"
                    >
                      {copiedTerm === def.term ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {def.definition}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Key Facts & Remember This */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.keyFacts && notes.keyFacts.length > 0 && (
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>Crucial Exam Facts</span>
            </h3>
            <ul className="space-y-2">
              {notes.keyFacts.map((fact, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2 leading-relaxed"
                >
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {notes.rememberThis && notes.rememberThis.length > 0 && (
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:bg-slate-850 rounded-3xl p-6 border border-amber-500/30 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Remember This (Mnemonics & Pitfalls)</span>
            </h3>
            <div className="space-y-2.5">
              {notes.rememberThis.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-amber-200 dark:border-amber-900/40 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Important Examples & Worked Problems */}
      {notes.importantExamples && notes.importantExamples.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <span>Important Worked Examples</span>
          </h2>

          <div className="space-y-4">
            {notes.importantExamples.map((ex, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-850 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">
                  {ex.title}
                </h3>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono">
                  <strong>Problem:</strong> {ex.problem}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  <strong>Solution:</strong>
                  <br />
                  {ex.solution}
                </div>
                {ex.examTip && (
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                    💡 Examiner Tip: {ex.examTip}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Next Step Action Toolbar */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white text-center space-y-4 shadow-xl border border-slate-800">
        <h3 className="text-lg font-bold">What would you like to do next with this material?</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Solidify your memory by flipping flashcards, testing yourself in a quick quiz, or playing interactive study games.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigateTab('flashcards')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
          >
            <Brain className="w-4 h-4" />
            <span>Flip Flashcards</span>
          </button>

          <button
            onClick={() => onNavigateTab('quiz')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-xs flex items-center space-x-2 shadow-md text-slate-950 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Take Topic Quiz</span>
          </button>

          <button
            onClick={() => onNavigateTab('games')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play Study Games</span>
          </button>
        </div>
      </div>
    </div>
  );
};
