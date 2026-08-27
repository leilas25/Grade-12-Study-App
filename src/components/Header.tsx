import React from 'react';
import { Sparkles, Flame, Target, User, Bot, BookOpen, Brain, Trophy, Plus } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  onOpenCoach: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onOpenCoach,
  onOpenProfile,
}) => {
  const { userProfile } = useStudy();

  const xpForNextLevel = userProfile.level * 250;
  const currentLevelXP = userProfile.xp % 250;
  const xpProgressPercent = Math.min(100, Math.round((currentLevelXP / 250) * 100));

  const goalPercent = Math.min(
    100,
    Math.round((userProfile.minutesStudiedToday / userProfile.dailyGoalMinutes) * 100)
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">Matric<span className="text-blue-400">Ace</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Grade 12
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Interactive Study & Exam Companion</p>
            </div>
          </div>

          {/* Center Navigation for Desktop */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'home'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('subjects')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'subjects' || currentView === 'topic_detail'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Subjects
            </button>
            <button
              onClick={() => setCurrentView('games')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'games'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Games
            </button>
            <button
              onClick={() => setCurrentView('planner')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'planner'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Planner
            </button>
            <button
              onClick={() => setCurrentView('progress')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentView === 'progress'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Progress
            </button>
          </nav>

          {/* Right Stats & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Streak Badge */}
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold cursor-pointer hover:bg-orange-500/20 transition-all"
              title={`${userProfile.streakDays} Day Study Streak`}
              onClick={() => setCurrentView('progress')}
            >
              <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
              <span>{userProfile.streakDays}d</span>
            </div>

            {/* Daily Study Goal */}
            <div
              className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs cursor-pointer hover:bg-slate-750 transition-all"
              title={`Daily Goal: ${userProfile.minutesStudiedToday} of ${userProfile.dailyGoalMinutes} mins`}
              onClick={() => setCurrentView('planner')}
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">
                {userProfile.minutesStudiedToday}/{userProfile.dailyGoalMinutes}m
              </span>
              <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
            </div>

            {/* XP Level Badge */}
            <div
              className="flex items-center space-x-2 px-2.5 sm:px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-700/50 text-xs cursor-pointer hover:bg-indigo-900/60 transition-all"
              onClick={() => setCurrentView('progress')}
              title={`Level ${userProfile.level} (${userProfile.xp} total XP)`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <div className="flex flex-col">
                <span className="font-bold text-indigo-200 leading-tight">Lvl {userProfile.level}</span>
                <span className="text-[10px] text-indigo-300/80 leading-none">{userProfile.xp} XP</span>
              </div>
            </div>

            {/* AI Study Coach Button */}
            <button
              onClick={onOpenCoach}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 transition-all transform active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI Coach</span>
            </button>

            {/* Profile Avatar / Preferences Trigger */}
            <button
              onClick={onOpenProfile}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform hover:scale-105 border border-white/20"
              style={{ backgroundColor: userProfile.avatarColor || '#2563EB' }}
              title={`Profile & Preferences: ${userProfile.name}`}
            >
              {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
