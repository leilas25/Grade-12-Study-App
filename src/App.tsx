import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { SubjectsView } from './components/SubjectsView';
import { TopicDetailView } from './components/TopicDetailView';
import { GameCentre } from './components/GameCentre';
import { PlannerView } from './components/PlannerView';
import { ProgressView } from './components/ProgressView';
import { StudyCoachDrawer } from './components/StudyCoachDrawer';
import { ProfilePreferencesModal } from './components/ProfilePreferencesModal';
import { UploadMaterialModal } from './components/UploadMaterialModal';
import { AppView } from './types';

function MainAppContent() {
  const { subjects } = useStudy();

  const [currentView, setCurrentView] = useState<AppView>('home');
  const [activeSubjectId, setActiveSubjectId] = useState<string>('');
  const [activeTopicId, setActiveTopicId] = useState<string>('');
  const [activeTopicTab, setActiveTopicTab] = useState<string>('smart_notes');

  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadSubjectId, setUploadSubjectId] = useState<string | undefined>();
  const [uploadTopicId, setUploadTopicId] = useState<string | undefined>();

  const handleSelectTopic = (subjectId: string, topicId: string, initialTab: string = 'smart_notes') => {
    setActiveSubjectId(subjectId);
    setActiveTopicId(topicId);
    setActiveTopicTab(initialTab);
    setCurrentView('topic_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUpload = (subjectId?: string, topicId?: string) => {
    setUploadSubjectId(subjectId);
    setUploadTopicId(topicId);
    setIsUploadOpen(true);
  };

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0];
  const activeTopic =
    activeSubject?.topics.find((t) => t.id === activeTopicId) || activeSubject?.topics[0];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white font-sans antialiased">
      {/* Top Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCoach={() => setIsCoachOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {currentView === 'home' && (
          <Dashboard
            onSelectTopic={handleSelectTopic}
            setCurrentView={setCurrentView}
            onOpenUpload={handleOpenUpload}
            onOpenCoach={() => setIsCoachOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
        )}

        {currentView === 'subjects' && (
          <SubjectsView
            onSelectTopic={handleSelectTopic}
            onOpenUpload={handleOpenUpload}
          />
        )}

        {currentView === 'topic_detail' && activeSubject && activeTopic && (
          <TopicDetailView
            subject={activeSubject}
            topic={activeTopic}
            initialTab={activeTopicTab}
            onBack={() => setCurrentView('subjects')}
            onOpenUpload={(subId, topId) => handleOpenUpload(subId, topId)}
          />
        )}

        {currentView === 'games' && (
          <GameCentre
            initialSubjectId={activeSubjectId}
            initialTopicId={activeTopicId}
          />
        )}

        {currentView === 'planner' && (
          <PlannerView
            onSelectTopic={handleSelectTopic}
          />
        )}

        {currentView === 'progress' && (
          <ProgressView
            onSelectTopic={handleSelectTopic}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals & Drawers */}
      <StudyCoachDrawer
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        contextSubject={activeSubject?.name}
        contextTopic={activeTopic?.name}
      />

      <ProfilePreferencesModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <UploadMaterialModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultSubjectId={uploadSubjectId || activeSubjectId}
        defaultTopicId={uploadTopicId || activeTopicId}
        onProcessedSuccess={(subId, topId) => {
          handleSelectTopic(subId, topId, 'smart_notes');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <MainAppContent />
    </StudyProvider>
  );
}
