import React from 'react';
import {
  TrendingUp,
  Flame,
  Target,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

interface ProgressViewProps {
  onSelectTopic: (subjectId: string, topicId: string, initialTab?: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ onSelectTopic }) => {
  const { userProfile, subjects, activityLogs, weakTopics } = useStudy();

  const enrolledSubjects = subjects.filter((s) => s.isEnrolled);

  const totalTopics = enrolledSubjects.reduce((acc, s) => acc + s.topics.length, 0);
  const masteredTopics = enrolledSubjects.reduce(
    (acc, s) => acc + s.topics.filter((t) => t.masteryLevel === 'mastered').length,
    0
  );
  const inProgressTopics = enrolledSubjects.reduce(
    (acc, s) => acc + s.topics.filter((t) => t.masteryLevel === 'in_progress').length,
    0
  );
  const needsPracticeTopics = enrolledSubjects.reduce(
    (acc, s) => acc + s.topics.filter((t) => t.masteryLevel === 'needs_practice').length,
    0
  );

  const overallMasteryPct =
    totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Learner Progress & Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detailed breakdown of your Grade 12 curriculum mastery, study consistency, and activity logs.
        </p>
      </div>

      {/* Top Stat Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-500">
            <Flame className="w-4 h-4" />
            <span>Study Streak</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {userProfile.streakDays} Days
          </div>
          <span className="text-[10px] text-slate-400">Consistent study momentum</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-500">
            <Target className="w-4 h-4" />
            <span>Today's Time</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {userProfile.minutesStudiedToday}m
          </div>
          <span className="text-[10px] text-slate-400">
            Target: {userProfile.dailyGoalMinutes} mins
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-500">
            <Trophy className="w-4 h-4" />
            <span>Level & XP</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            Lvl {userProfile.level}
          </div>
          <span className="text-[10px] text-slate-400">{userProfile.xp} Total XP</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-500">
            <CheckCircle2 className="w-4 h-4" />
            <span>Curriculum</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {overallMasteryPct}%
          </div>
          <span className="text-[10px] text-slate-400">
            {masteredTopics} / {totalTopics} Mastered
          </span>
        </div>
      </div>

      {/* Curriculum Mastery Breakdown */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Subject Mastery Progress
        </h2>

        <div className="space-y-4">
          {enrolledSubjects.map((sub) => {
            const subTotal = sub.topics.length;
            const subMastered = sub.topics.filter((t) => t.masteryLevel === 'mastered').length;
            const avgPct =
              subTotal > 0
                ? Math.round(
                    sub.topics.reduce((acc, t) => acc + (t.progressPercentage || 0), 0) /
                      subTotal
                  )
                : 0;

            return (
              <div key={sub.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span>{sub.name}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                    <span>
                      {subMastered} / {subTotal} Mastered
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{avgPct}%</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${avgPct}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column: Weak Topics for Revision vs Recent Activity History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Weak Topics */}
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Topics Needing Practice ({weakTopics.length})
            </h3>
          </div>

          {weakTopics.length > 0 ? (
            <div className="space-y-3">
              {weakTopics.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400">
                      {item.subjectName}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
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
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Practice
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">
                No weak topics flagged right now!
              </p>
              <p>Great job! Keep doing quizzes to verify full concept mastery.</p>
            </div>
          )}
        </div>

        {/* Right: Activity Log */}
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Study Activity
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {log.subject}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {log.topic}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    +{log.xpEarned} XP
                  </span>
                  <div className="text-[10px] text-slate-400">{log.durationMinutes}m</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
