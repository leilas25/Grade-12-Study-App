import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Upload,
  AlertCircle,
  Clock,
  Check,
  X,
  Brain,
  Gamepad2,
} from 'lucide-react';
import { Topic, QuizQuestion } from '../types';
import { useStudy } from '../context/StudyContext';

interface QuizViewProps {
  topic: Topic;
  subjectName: string;
  onOpenUpload: () => void;
  onNavigateTab: (tab: 'smart_notes' | 'flashcards' | 'quiz' | 'games' | 'upload') => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  topic,
  subjectName,
  onOpenUpload,
  onNavigateTab,
}) => {
  const { recordQuizCompleted, celebrate } = useStudy();
  const questions = topic.quizQuestions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillBlankInput, setFillBlankInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; selected: string; isCorrect: boolean; question: QuizQuestion }[]
  >([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [showReviewModal, setShowReviewModal] = useState(false);

  const currentQ = questions[currentIndex];

  if (questions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          No Quiz Questions Available for {topic.name}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload your study notes, and Gemini will automatically create multiple-choice, true/false, and fill-in-the-blank exam questions.
        </p>
        <button
          onClick={onOpenUpload}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all inline-flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Notes to Generate Quiz</span>
        </button>
      </div>
    );
  }

  const handleSubmitAnswer = () => {
    if (!currentQ || isSubmitted) return;

    let chosen = selectedOption;
    if (currentQ.type === 'fill_blank' && !chosen) {
      chosen = fillBlankInput.trim();
    }

    if (!chosen) return;

    const isCorrect = chosen.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim();

    setUserAnswers((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selected: chosen!,
        isCorrect,
        question: currentQ,
      },
    ]);

    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setFillBlankInput('');
      setIsSubmitted(false);
    } else {
      // Quiz Finished!
      const totalCorrect =
        userAnswers.filter((a) => a.isCorrect).length +
        ((selectedOption || fillBlankInput.trim()).toLowerCase().trim() ===
        currentQ.correctAnswer.toLowerCase().trim()
          ? 1
          : 0);

      const scorePercentage = Math.round((totalCorrect / questions.length) * 100);
      const durationMins = Math.max(1, Math.round((Date.now() - startTime) / (1000 * 60)));

      recordQuizCompleted(topic.subjectId, topic.id, scorePercentage, durationMins);
      setQuizFinished(true);

      if (scorePercentage >= 70) {
        celebrate();
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setFillBlankInput('');
    setIsSubmitted(false);
    setUserAnswers([]);
    setQuizFinished(false);
  };

  const correctCount = userAnswers.filter((a) => a.isCorrect).length;
  const finalPercentage = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Header & Progress */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {subjectName} • Topic Quiz
            </span>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              {topic.name}
            </h1>
          </div>

          {!quizFinished && (
            <div className="text-right">
              <span className="text-xs text-slate-500">Question</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {currentIndex + 1} / {questions.length}
              </div>
            </div>
          )}
        </div>

        {!quizFinished && (
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {!quizFinished && currentQ ? (
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Question Tag */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              {currentQ.type.replace('_', ' ')}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                currentQ.difficulty === 'easy'
                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600'
                  : currentQ.difficulty === 'hard'
                  ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600'
                  : 'bg-amber-100 dark:bg-amber-950/40 text-amber-600'
              }`}
            >
              {currentQ.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options / Input Form */}
          <div className="space-y-3">
            {currentQ.options && currentQ.options.length > 0 ? (
              currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                let optStyle =
                  'border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 hover:border-blue-400';

                if (isSubmitted) {
                  if (opt.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim()) {
                    optStyle =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
                  } else if (isSelected) {
                    optStyle =
                      'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 line-through';
                  } else {
                    optStyle = 'border-slate-200 dark:border-slate-800 opacity-50';
                  }
                } else if (isSelected) {
                  optStyle =
                    'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500/30';
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${optStyle}`}
                  >
                    <span>{opt}</span>
                    {isSubmitted && opt.toLowerCase().trim() === currentQ.correctAnswer.toLowerCase().trim() && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    )}
                    {isSubmitted && isSelected && opt.toLowerCase().trim() !== currentQ.correctAnswer.toLowerCase().trim() && (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </button>
                );
              })
            ) : (
              /* Fill in the blank text input */
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  value={fillBlankInput}
                  disabled={isSubmitted}
                  onChange={(e) => setFillBlankInput(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Explanation Box on Submit */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-1.5 ${
                (selectedOption || fillBlankInput)
                  ?.toLowerCase()
                  .trim() === currentQ.correctAnswer.toLowerCase().trim()
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="font-bold flex items-center space-x-1.5">
                {(selectedOption || fillBlankInput)?.toLowerCase().trim() ===
                currentQ.correctAnswer.toLowerCase().trim() ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Incorrect — Correct Answer: {currentQ.correctAnswer}</span>
                  </>
                )}
              </div>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {isSubmitted ? 'Review explanation before proceeding' : 'Select an option to submit'}
            </span>

            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption && !fillBlankInput.trim()}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all flex items-center space-x-2"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Finished Scorecard */
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg ${
              finalPercentage >= 70
                ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10'
                : 'bg-rose-500/10 text-rose-500 shadow-rose-500/10'
            }`}
          >
            {finalPercentage >= 70 ? (
              <Trophy className="w-10 h-10 animate-bounce" />
            ) : (
              <AlertCircle className="w-10 h-10" />
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {finalPercentage >= 80
                ? 'Outstanding Mastery! 🌟'
                : finalPercentage >= 60
                ? 'Good Effort! Keep Pushing 🚀'
                : 'Needs Targeted Review 📖'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You scored <strong className="text-slate-800 dark:text-slate-200">{finalPercentage}%</strong> on{' '}
              {topic.name}
            </p>
          </div>

          {/* Score Stats Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">Correct</span>
              <div className="text-xl font-black text-emerald-500">
                {correctCount} / {questions.length}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">Score</span>
              <div className="text-xl font-black text-blue-500">{finalPercentage}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">XP Earned</span>
              <div className="text-xl font-black text-purple-500">
                +{Math.round(finalPercentage * 0.5) + (finalPercentage === 100 ? 30 : 10)}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleRestartQuiz}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>

            <button
              onClick={() => onNavigateTab('games')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play Games with this Topic</span>
            </button>

            <button
              onClick={() => onNavigateTab('smart_notes')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all"
            >
              <Brain className="w-4 h-4" />
              <span>Review Smart Notes</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
