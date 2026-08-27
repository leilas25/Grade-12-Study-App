import React from 'react';
import { LayoutDashboard, BookOpen, Gamepad2, Calendar, TrendingUp } from 'lucide-react';
import { AppView } from '../types';

interface MobileNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, setCurrentView }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-3 py-2">
      <div className="flex items-center justify-around">
        <button
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            currentView === 'home' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setCurrentView('subjects')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            currentView === 'subjects' || currentView === 'topic_detail'
              ? 'text-blue-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Subjects</span>
        </button>

        <button
          onClick={() => setCurrentView('games')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            currentView === 'games' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Games</span>
        </button>

        <button
          onClick={() => setCurrentView('planner')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            currentView === 'planner' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Planner</span>
        </button>

        <button
          onClick={() => setCurrentView('progress')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            currentView === 'progress' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Progress</span>
        </button>
      </div>
    </div>
  );
};
