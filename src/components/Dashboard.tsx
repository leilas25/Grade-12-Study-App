import React from 'react';
import {
  Flame,
  Target,
  Sparkles,
  Gamepad2,
  BookOpen,
  HelpCircle,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Plus,
  Play,
  Dna,
  Calculator,
  Atom,
  Globe,
  Receipt,
  Briefcase,
  TrendingUp,
  Brain,
  Upload,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { AppView } from '../types';

interface DashboardProps {
  onSelectTopic: (subjectId: string, topicId: string, initialTab?: string) => void;
  setCurrentView: (view: AppView) => void;
  onOpenUpload: (subjectId?: string, topicId?: string) => void;
  onOpenCoach: () => void;
  onOpenProfile: () => void;
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

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectTopic,
  setCurrentView,
  onOpenUpload,
  onOpenCoach,
  onOpenProfile,
}) => {
  const {
    userProfile,
    subjects,
    studySessions,
    testCountdowns,
    weakTopics,
    toggleSessionComplete,
    logStudyTime,
  } = useStudy();

  const enrolledSubjects = subjects.filter((s) => s.isEnrolled);

  // Calculate days remaining for upcoming tests
  const sortedTests = [...testCountdowns]
    .map((test) => {
      const testDate = new Date(test.date);
      const today = new Date();
      const diffTime = testDate.getTime() - today.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return { ...test, daysRemaining };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const nearestTest = sortedTests[0];

  const goalPercent = Math.min(
    100,
    Math.round((userProfile.minutesStudiedToday / userProfile.dailyGoalMinutes) * 100)
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Matric 2026 Target: 100% Prepared</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-blue-400">{userProfile.name}</span>!
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Upload your notes, review AI Smart Notes, flip flashcards, and play interactive games to master Grade 12 concepts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenUpload()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/25 transition-all transform active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Notes</span>
            </button>
            <button
              onClick={onOpenCoach}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center space-x-2 transition-all"
            >
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Ask AI Coach</span>
            </button>
          </div>
        </div>

        {/* Dynamic Action Recommendation Alert */}
        {nearestTest && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 px-6 sm:px-8 py-4 rounded-b-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-white">Upcoming {nearestTest.subject} Assessment: </span>
                <span className="text-slate-300">
                  "{nearestTest.title}" is in <strong className="text-amber-400">{nearestTest.daysRemaining} days</strong>.
                </span>
                {weakTopics.length > 0 && (
                  <span className="text-slate-400 ml-1">
                    (Practice recommended for: <strong className="text-rose-300">{weakTopics[0].topicName}</strong>)
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                const targetSub = subjects.find(
                  (s) => s.name.toLowerCase() === nearestTest.subject.toLowerCase()
                );
                if (targetSub && targetSub.topics.length > 0) {
                  onSelectTopic(targetSub.id, targetSub.topics[0].id, 'quiz');
                } else {
                  setCurrentView('subjects');
                }
              }}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1"
            >
              <span>Practice Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Daily Progress & Goal Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Daily Study Goal Card */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Goal
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {userProfile.minutesStudiedToday} <span className="text-sm font-normal text-slate-400">/ {userProfile.dailyGoalMinutes} mins</span>
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {goalPercent}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Quick Log Time:</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => logStudyTime(15)}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                +15m
              </button>
              <button
                onClick={() => logStudyTime(30)}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                +30m
              </button>
            </div>
          </div>
        </div>

        {/* 2. Streak Counter Card */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Study Streak
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {userProfile.streakDays}
            </span>
            <span className="text-sm font-semibold text-orange-500">
              Days Strong 🔥
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Complete any study session or quiz today to keep your streak blazing!
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Matric Exam Countdown:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {userProfile.targetExamDate
                ? `${Math.max(
                    0,
                    Math.ceil(
                      (new Date(userProfile.targetExamDate).getTime() - new Date().getTime()) /
                        (1000 * 3600 * 24)
                    )
                  )} days`
                : '60 days'}
            </span>
          </div>
        </div>

        {/* 3. Level & XP Progression Card */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Learner Status
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              Level {userProfile.level}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {userProfile.xp} Total XP
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
              style={{ width: `${Math.min(100, ((userProfile.xp % 250) / 250) * 100)}%` }}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Next Level at:</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {userProfile.level * 250} XP
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Quick Study Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <button
            onClick={() => setCurrentView('games')}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 hover:from-indigo-500/20 hover:to-blue-500/20 border border-blue-500/20 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Play Games</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">8 interactive challenges</p>
          </button>

          <button
            onClick={() => setCurrentView('subjects')}
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Smart Notes</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Summary & definitions</p>
          </button>

          <button
            onClick={() => {
              const defaultTopic = enrolledSubjects[0]?.topics[0];
              if (defaultTopic) {
                onSelectTopic(enrolledSubjects[0].id, defaultTopic.id, 'quiz');
              } else {
                setCurrentView('subjects');
              }
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/20 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Take Quiz</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Test your recall</p>
          </button>

          <button
            onClick={() => setCurrentView('planner')}
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/20 text-left transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Timetable</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">School & study plan</p>
          </button>
        </div>
      </div>

      {/* Main 2-Column Content: Today's Plan + Weak Topics / Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Scheduled Plan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Today's Study Schedule</span>
            </h2>
            <button
              onClick={() => setCurrentView('planner')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>Manage Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {studySessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  session.completed
                    ? 'bg-slate-50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800/60 opacity-75'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 shadow-sm hover:border-blue-400'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <button
                    onClick={() => toggleSessionComplete(session.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      session.completed
                        ? 'bg-emerald-500 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500'
                    }`}
                  >
                    {session.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {session.subject}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {session.scheduledTime || `${session.durationMinutes} mins`}
                      </span>
                    </div>
                    <h3
                      className={`text-sm font-semibold ${
                        session.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {session.topic}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {session.activity}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const sub = subjects.find(
                      (s) => s.name.toLowerCase() === session.subject.toLowerCase()
                    );
                    const top = sub?.topics.find(
                      (t) => t.name.toLowerCase() === session.topic.toLowerCase()
                    ) || sub?.topics[0];
                    if (sub && top) {
                      onSelectTopic(sub.id, top.id);
                    } else {
                      setCurrentView('subjects');
                    }
                  }}
                  className="p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                  title="Start Study Session"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Weak Topics & Countdown */}
        <div className="space-y-6">
          {/* Weak Topics Card */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>Needs Practice (Weak Areas)</span>
              </h3>
            </div>

            {weakTopics.length > 0 ? (
              <div className="space-y-2.5">
                {weakTopics.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                        {item.subjectName}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.topicName}
                      </h4>
                    </div>

                    <button
                      onClick={() => {
                        const sub = subjects.find((s) => s.name === item.subjectName);
                        if (sub) {
                          onSelectTopic(sub.id, item.topicId, 'quiz');
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      Practice
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">All topics in great shape!</p>
                <p>Complete more quizzes to identify areas for improvement.</p>
              </div>
            )}
          </div>

          {/* Upcoming Tests Card */}
          <div className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Upcoming Assessments</span>
              </h3>
              <button
                onClick={() => setCurrentView('planner')}
                className="text-xs text-blue-500 font-semibold hover:underline"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2.5">
              {sortedTests.slice(0, 3).map((test) => (
                <div
                  key={test.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                      {test.subject}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {test.title}
                    </h4>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {test.daysRemaining === 0 ? 'Today!' : `${test.daysRemaining}d left`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Your Enrolled Subjects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Your Grade 12 Subjects ({enrolledSubjects.length})
          </h2>
          <button
            onClick={onOpenProfile}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Customize Subjects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {enrolledSubjects.map((subject) => {
            const totalTopics = subject.topics.length;
            const avgProgress =
              totalTopics > 0
                ? Math.round(
                    subject.topics.reduce((acc, t) => acc + (t.progressPercentage || 0), 0) /
                      totalTopics
                  )
                : 0;

            return (
              <div
                key={subject.id}
                onClick={() => {
                  if (subject.topics.length > 0) {
                    onSelectTopic(subject.id, subject.topics[0].id);
                  } else {
                    setCurrentView('subjects');
                  }
                }}
                className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: subject.color }}
                    >
                      {getSubjectIcon(subject.iconName)}
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {totalTopics} Topics
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {subject.topics.map((t) => t.name).join(', ') || 'No topics added yet'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Mastery Progress</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{avgProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${avgProgress}%`,
                        backgroundColor: subject.color || '#2563EB',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
