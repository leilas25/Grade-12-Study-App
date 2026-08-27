import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCw,
  Check,
  X,
  Shuffle,
  Trophy,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { Topic, Flashcard } from '../types';
import { useStudy } from '../context/StudyContext';

interface FlashcardsViewProps {
  topic: Topic;
  subjectName: string;
  onOpenUpload: () => void;
  onNavigateTab: (tab: 'smart_notes' | 'flashcards' | 'quiz' | 'games' | 'upload') => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  topic,
  subjectName,
  onOpenUpload,
  onNavigateTab,
}) => {
  const { markFlashcard, celebrate } = useStudy();
  const flashcards = topic.flashcards || [];

  const [filter, setFilter] = useState<'all' | 'needs_review' | 'mastered'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [masteredInSession, setMasteredInSession] = useState(0);

  // Initialize or update deck when filter or flashcards change
  useEffect(() => {
    let filtered = [...flashcards];
    if (filter === 'needs_review') {
      filtered = filtered.filter((c) => c.known === false || c.reviewCount === 0);
    } else if (filter === 'mastered') {
      filtered = filtered.filter((c) => c.known === true);
    }
    setDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
  }, [flashcards, filter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionCompleted || deck.length === 0) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyK') {
        handleRate(true);
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyR') {
        handleRate(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, deck, sessionCompleted]);

  const currentCard = deck[currentIndex];

  const handleShuffle = () => {
    setDeck((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRate = (known: boolean) => {
    if (!currentCard) return;

    markFlashcard(topic.id, currentCard.id, known);
    if (known) {
      setMasteredInSession((prev) => prev + 1);
    }

    setIsFlipped(false);

    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
      celebrate();
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          No Flashcards Generated Yet for {topic.name}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload your notes or textbook extracts, and Gemini will automatically create high-yield Grade 12 flashcards.
        </p>
        <button
          onClick={onOpenUpload}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/25 transition-all inline-flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Notes to Generate</span>
        </button>
      </div>
    );
  }

  const totalCards = flashcards.length;
  const totalMastered = flashcards.filter((c) => c.known).length;
  const progressPct = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Top Header & Progress */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {subjectName} • Flashcards
            </span>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {topic.name}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500">Mastery</span>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {totalMastered} / {totalCards} ({progressPct}%)
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Filter Chips & Shuffle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All ({flashcards.length})
            </button>
            <button
              onClick={() => setFilter('needs_review')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'needs_review'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Needs Review ({flashcards.filter((c) => !c.known).length})
            </button>
            <button
              onClick={() => setFilter('mastered')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filter === 'mastered'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Mastered ({totalMastered})
            </button>
          </div>

          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center space-x-1"
            title="Shuffle deck"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>
        </div>
      </div>

      {/* Main Flashcard Card Area */}
      {!sessionCompleted && currentCard ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Card {currentIndex + 1} of {deck.length}
            </span>
            <span className="italic">Click card or press Spacebar to flip</span>
          </div>

          {/* Interactive 3D Flip Card */}
          <div
            className="relative h-80 sm:h-96 w-full cursor-pointer perspective-1000 select-none"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className="w-full h-full relative"
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front of Card */}
              <div
                className={`absolute inset-0 w-full h-full rounded-3xl p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-850 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-750 shadow-xl flex flex-col justify-between backface-hidden ${
                  currentCard.known ? 'ring-2 ring-emerald-500/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                    Question / Term
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      currentCard.difficulty === 'easy'
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600'
                        : currentCard.difficulty === 'hard'
                        ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600'
                        : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'
                    }`}
                  >
                    {currentCard.difficulty}
                  </span>
                </div>

                <div className="text-center my-auto px-4">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                    {currentCard.front}
                  </h3>
                </div>

                <div className="flex items-center justify-center text-xs text-slate-400 space-x-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Tap to flip answer</span>
                </div>
              </div>

              {/* Back of Card */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white border-2 border-purple-500/40 shadow-xl flex flex-col justify-between backface-hidden"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    Answer / Definition
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Topic: {currentCard.topic}
                  </span>
                </div>

                <div className="text-center my-auto px-4">
                  <p className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
                    {currentCard.back}
                  </p>
                </div>

                <div className="flex items-center justify-center text-xs text-slate-400 space-x-1">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Tap to flip back</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Response Controls */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => handleRate(false)}
              className="py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 font-bold text-sm flex items-center justify-center space-x-2 shadow-sm transition-all transform active:scale-95"
            >
              <X className="w-5 h-5 text-rose-500" />
              <span>Need to Review</span>
            </button>

            <button
              onClick={() => handleRate(true)}
              className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 transition-all transform active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>I Knew This (+10 XP)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Session Completed Screen */
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Flashcard Session Complete! 🎉
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You reviewed {deck.length} flashcards for {topic.name}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto py-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">Mastered</span>
              <div className="text-2xl font-black text-emerald-500">
                {masteredInSession}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-400">XP Earned</span>
              <div className="text-2xl font-black text-purple-500">
                +{masteredInSession * 10 + 20}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setSessionCompleted(false);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Review Deck Again</span>
            </button>

            <button
              onClick={() => onNavigateTab('quiz')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
            >
              <span>Take Quiz Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
