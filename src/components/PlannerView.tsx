import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Plus,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  Brain,
  Check,
  RefreshCw,
  FileImage,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { geminiService } from '../services/geminiService';
import { DaySchedule, SchoolTimetable, StudySession, TestCountdown } from '../types';

interface PlannerViewProps {
  onSelectTopic: (subjectId: string, topicId: string) => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({ onSelectTopic }) => {
  const {
    timetable,
    updateTimetable,
    studySessions,
    toggleSessionComplete,
    addStudySession,
    deleteStudySession,
    testCountdowns,
    addTestCountdown,
    deleteTestCountdown,
    subjects,
    weakTopics,
    userProfile,
    celebrate,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'schedule' | 'timetable' | 'tests'>('schedule');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // Timetable upload state
  const [isUploadingTimetable, setIsUploadingTimetable] = useState(false);
  const [timetableImagePreview, setTimetableImagePreview] = useState<string | null>(null);

  // AI Schedule generation state
  const [isGeneratingAIPlan, setIsGeneratingAIPlan] = useState(false);
  const [aiPlanError, setAiPlanError] = useState<string | null>(null);

  // Add Session modal
  const [showAddSession, setShowAddSession] = useState(false);
  const [newSubject, setNewSubject] = useState(subjects[0]?.name || 'Mathematics');
  const [newTopic, setNewTopic] = useState('');
  const [newDay, setNewDay] = useState('Monday');
  const [newTime, setNewTime] = useState('16:00');
  const [newDuration, setNewDuration] = useState(30);

  // Add Test modal
  const [showAddTest, setShowAddTest] = useState(false);
  const [testSub, setTestSub] = useState(subjects[0]?.name || 'Mathematics');
  const [testTitle, setTestTitle] = useState('');
  const [testDate, setTestDate] = useState(
    new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [testWeighting, setTestWeighting] = useState('Term Test');

  // Parse Timetable image with Gemini
  const handleTimetableImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      const mimeType = file.type;
      setTimetableImagePreview(reader.result as string);
      setIsUploadingTimetable(true);

      try {
        const parsedData = await geminiService.parseTimetable({
          imageBase64: base64Data,
          mimeType,
        });

        if (parsedData && parsedData.days) {
          updateTimetable(parsedData);
          celebrate();
        }
      } catch (err: any) {
        console.error('Failed to parse timetable', err);
      } finally {
        setIsUploadingTimetable(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate AI Study Plan based on weak topics & upcoming tests
  const handleGenerateAIPlan = async () => {
    setIsGeneratingAIPlan(true);
    setAiPlanError(null);

    try {
      const enrolledNames = subjects.filter((s) => s.isEnrolled).map((s) => s.name);
      const weakTopicNames = weakTopics.map((w) => `${w.subjectName}: ${w.topicName}`);
      const upcoming = testCountdowns.map((t) => ({
        subject: t.subject,
        title: t.title,
        date: t.date,
      }));

      const planResult = await geminiService.generateStudyPlan({
        enrolledSubjects: enrolledNames,
        weakTopics: weakTopicNames,
        upcomingTests: upcoming,
        dailyTargetMinutes: userProfile.dailyGoalMinutes,
      });

      if (planResult && Array.isArray(planResult.sessions)) {
        // Add all sessions to context
        planResult.sessions.forEach((s: any) => {
          addStudySession({
            day: s.day || 'Monday',
            scheduledTime: s.scheduledTime || '17:00',
            subject: s.subject || 'Mathematics',
            topic: s.topic || 'Revision',
            activity: s.activity || 'Smart Notes & Quiz',
            durationMinutes: s.durationMinutes || 30,
          });
        });
        celebrate();
      }
    } catch (err: any) {
      setAiPlanError(err.message || 'Failed to generate AI study plan.');
    } finally {
      setIsGeneratingAIPlan(false);
    }
  };

  const handleSaveCustomSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    addStudySession({
      day: newDay,
      scheduledTime: newTime,
      subject: newSubject,
      topic: newTopic.trim(),
      activity: 'Custom Study Session',
      durationMinutes: newDuration,
    });

    setShowAddSession(false);
    setNewTopic('');
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle.trim()) return;

    addTestCountdown({
      subject: testSub,
      title: testTitle.trim(),
      date: testDate,
      weighting: testWeighting,
    });

    setShowAddTest(false);
    setTestTitle('');
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const filteredSessions = studySessions.filter(
    (s) => (s.day || 'Monday').toLowerCase() === selectedDay.toLowerCase()
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Study Planner & Timetable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize your school periods, AI-tailored study schedule, and exam countdowns.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white dark:bg-slate-850 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Study Schedule
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'timetable'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            School Timetable
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'tests'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tests ({testCountdowns.length})
          </button>
        </div>
      </div>

      {/* ====================================================
          TAB 1: PERSONAL STUDY SCHEDULE
      ==================================================== */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* AI Optimizer Card */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-blue-800/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Adaptive Matric Scheduler</span>
                </div>
                <h2 className="text-xl font-extrabold text-white">
                  Generate AI-Tailored Study Schedule
                </h2>
                <p className="text-xs text-slate-300 max-w-xl">
                  Gemini analyzes your enrolled subjects, weak topics ({weakTopics.length} identified), and upcoming test dates to craft a balanced weekly plan.
                </p>
              </div>

              <button
                onClick={handleGenerateAIPlan}
                disabled={isGeneratingAIPlan}
                className="px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs shadow-lg shadow-blue-500/25 flex items-center space-x-2 whitespace-nowrap transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isGeneratingAIPlan ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing & Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Plan</span>
                  </>
                )}
              </button>
            </div>

            {aiPlanError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                {aiPlanError}
              </div>
            )}
          </div>

          {/* Day Selector Strip */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {daysOfWeek.map((day) => {
              const isSelected = selectedDay === day;
              const count = studySessions.filter(
                (s) => (s.day || 'Monday').toLowerCase() === day.toLowerCase()
              ).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span>{day}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-blue-800 text-white' : 'bg-slate-100 dark:bg-slate-750 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Session Cards for Selected Day */}
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {selectedDay}'s Study Plan ({filteredSessions.length} sessions)
              </h3>

              <button
                onClick={() => {
                  setNewDay(selectedDay);
                  setShowAddSession(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Session</span>
              </button>
            </div>

            {filteredSessions.length > 0 ? (
              <div className="space-y-3">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      session.completed
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60'
                        : 'bg-slate-50/50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-blue-400'
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
                        {session.completed && <Check className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {session.subject}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500">
                            {session.scheduledTime} ({session.durationMinutes} mins)
                          </span>
                        </div>
                        <h4
                          className={`text-sm font-semibold ${
                            session.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {session.topic}
                        </h4>
                        <p className="text-xs text-slate-400">{session.activity}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
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
                          }
                        }}
                        className="p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                        title="Study Topic"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        onClick={() => deleteStudySession(session.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                <Clock className="w-8 h-8 mx-auto opacity-50" />
                <p>No study sessions scheduled for {selectedDay}.</p>
                <button
                  onClick={() => {
                    setNewDay(selectedDay);
                    setShowAddSession(true);
                  }}
                  className="text-blue-500 font-bold hover:underline"
                >
                  + Add a custom session
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 2: SCHOOL TIMETABLE
      ==================================================== */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          {/* Upload Timetable Banner */}
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                School Timetable Scanner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload a photo or screenshot of your Grade 12 school timetable. Gemini will scan and digitize the periods!
              </p>
            </div>

            <label className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-2 cursor-pointer shadow-md transition-all">
              <Upload className="w-4 h-4" />
              <span>{isUploadingTimetable ? 'Analyzing Photo...' : 'Upload Timetable Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleTimetableImageUpload}
                disabled={isUploadingTimetable}
                className="hidden"
              />
            </label>
          </div>

          {/* Timetable Grid */}
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Weekly School Schedule (Mon - Fri)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(timetable.days || []).map((daySched, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <h4 className="font-black text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                    {daySched.day}
                  </h4>

                  <div className="space-y-2">
                    {daySched.periods.map((period, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs space-y-0.5"
                      >
                        <span className="text-[10px] font-bold text-slate-400">
                          {period.startTime} - {period.endTime}
                        </span>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {period.subject}
                        </div>
                        {period.room && (
                          <div className="text-[10px] text-slate-400">Room: {period.room}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          TAB 3: ASSESSMENTS & EXAM COUNTDOWNS
      ==================================================== */}
      {activeTab === 'tests' && (
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Upcoming Assessments & Tests
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track exam dates with live countdown timers and test revision targets.
              </p>
            </div>

            <button
              onClick={() => setShowAddTest(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Assessment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testCountdowns.map((test) => {
              const diffDays = Math.max(
                0,
                Math.ceil(
                  (new Date(test.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                )
              );

              return (
                <div
                  key={test.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                        {test.subject}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {test.weighting || 'Test'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-400">Exam Date: {test.date}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-2xl font-black text-amber-500">{diffDays}d</div>
                      <span className="text-[10px] text-slate-400">remaining</span>
                    </div>

                    <button
                      onClick={() => deleteTestCountdown(test.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Session */}
      {showAddSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Study Session
            </h3>
            <form onSubmit={handleSaveCustomSession} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Subject:
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Topic / Target:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meiosis revision & flashcards"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Day:
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Time:
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSession(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Save Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Test */}
      {showAddTest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Add Assessment / Exam Date
            </h3>
            <form onSubmit={handleSaveTest} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Subject:
                </label>
                <select
                  value={testSub}
                  onChange={(e) => setTestSub(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Assessment Title:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Life Sciences Paper 1 Control Test"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Date:
                </label>
                <input
                  type="date"
                  required
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTest(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
