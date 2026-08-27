import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  SubjectConfig,
  SchoolTimetable,
  StudySession,
  TestCountdown,
  ActivityLog,
  SmartNotes,
  Flashcard,
  QuizQuestion,
  KeyTerm,
} from '../types';
import {
  DEFAULT_SUBJECTS,
  DEFAULT_TIMETABLE,
  DEFAULT_TESTS,
  DEFAULT_SESSIONS,
} from '../data/defaultCurriculum';

interface StudyContextType {
  userProfile: UserProfile;
  subjects: SubjectConfig[];
  timetable: SchoolTimetable;
  studySessions: StudySession[];
  testCountdowns: TestCountdown[];
  activityLogs: ActivityLog[];
  weakTopics: { subjectName: string; topicId: string; topicName: string; score?: number }[];
  updateProfile: (profile: Partial<UserProfile>) => void;
  toggleSubjectEnrolled: (subjectId: string) => void;
  addCustomSubject: (name: string, code?: string, color?: string) => string;
  addCustomTopic: (subjectId: string, name: string) => string;
  deleteTopic: (subjectId: string, topicId: string) => void;
  saveTopicAIContent: (
    subjectId: string,
    topicId: string,
    content: {
      notes?: SmartNotes;
      flashcards?: Flashcard[];
      quizQuestions?: QuizQuestion[];
      keyTerms?: KeyTerm[];
    }
  ) => void;
  markFlashcard: (topicId: string, cardId: string, known: boolean) => void;
  recordQuizCompleted: (
    subjectId: string,
    topicId: string,
    scorePercentage: number,
    durationMinutes: number
  ) => void;
  recordNoteRead: (subjectId: string, topicId: string, durationMinutes?: number) => void;
  recordGamePlayed: (
    subjectId: string,
    topicId: string,
    gameName: string,
    score: number,
    xpEarned: number
  ) => void;
  addXP: (amount: number, reason?: string) => void;
  logStudyTime: (minutes: number) => void;
  toggleSessionComplete: (sessionId: string) => void;
  addStudySession: (session: Omit<StudySession, 'id' | 'completed'>) => void;
  deleteStudySession: (sessionId: string) => void;
  addTestCountdown: (test: Omit<TestCountdown, 'id'>) => void;
  deleteTestCountdown: (testId: string) => void;
  updateTimetable: (timetable: SchoolTimetable) => void;
  resetAllData: () => void;
  celebrate: () => void;
}

const STORAGE_KEYS = {
  PROFILE: 'matricace_user_profile_v3',
  SUBJECTS: 'matricace_subjects_v3',
  TIMETABLE: 'matricace_timetable_v3',
  SESSIONS: 'matricace_sessions_v3',
  TESTS: 'matricace_tests_v3',
  LOGS: 'matricace_logs_v3',
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If it's a new calendar day, reset minutesStudiedToday
        if (parsed.lastActiveDate !== todayStr) {
          const lastDate = new Date(parsed.lastActiveDate || todayStr);
          const currentDate = new Date(todayStr);
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          
          return {
            ...parsed,
            lastActiveDate: todayStr,
            minutesStudiedToday: 0,
            streakDays: diffDays === 1 ? (parsed.streakDays || 0) : (diffDays === 0 ? (parsed.streakDays || 0) : 0),
          };
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse user profile', e);
      }
    }
    return {
      name: 'Grade 12 Learner',
      grade: 'Grade 12',
      school: 'Matric High',
      avatarColor: '#2563EB',
      dailyGoalMinutes: 60,
      targetExamDate: new Date(new Date().getFullYear(), 9, 25).toISOString().split('T')[0], // Late October NSC exams
      xp: 0,
      level: 1,
      streakDays: 0,
      lastActiveDate: todayStr,
      minutesStudiedToday: 0,
      completedDays: [],
      hasCompletedOnboarding: true,
    };
  });

  // 2. Subjects State
  const [subjects, setSubjects] = useState<SubjectConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse subjects', e);
      }
    }
    return DEFAULT_SUBJECTS;
  });

  // 3. Timetable State
  const [timetable, setTimetable] = useState<SchoolTimetable>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse timetable', e);
      }
    }
    return DEFAULT_TIMETABLE;
  });

  // 4. Study Sessions State
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse study sessions', e);
      }
    }
    return DEFAULT_SESSIONS;
  });

  // 5. Test Countdowns State
  const [testCountdowns, setTestCountdowns] = useState<TestCountdown[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TESTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse test countdowns', e);
      }
    }
    return DEFAULT_TESTS;
  });

  // 6. Activity Logs State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse activity logs', e);
      }
    }
    return [];
  });

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(studySessions));
  }, [studySessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(testCountdowns));
  }, [testCountdowns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Recalculate Topic Mastery & Weak Topics
  const calculateTopicProgress = (topic: any): { percentage: number; level: 'not_started' | 'in_progress' | 'mastered' | 'needs_practice'; isWeak: boolean } => {
    let score = 0;
    const totalCards = topic.flashcards?.length || 0;
    const knownCards = topic.flashcards?.filter((c: any) => c.known).length || 0;
    
    // Notes read = 20% (only if learner actually read / studied them)
    if (topic.notesRead) score += 20;

    // Flashcard mastery = up to 40% (only for cards mastered by the learner)
    if (totalCards > 0 && knownCards > 0) {
      score += Math.round((knownCards / totalCards) * 40);
    }

    // Quiz score = up to 40% (only if learner attempted the quiz)
    if (typeof topic.quizHighScore === 'number' && (topic.totalQuizAttempts || 0) > 0) {
      score += Math.round((topic.quizHighScore / 100) * 40);
    }

    const percentage = Math.min(100, Math.max(0, score));

    const isWeak = (typeof topic.quizHighScore === 'number' && (topic.totalQuizAttempts || 0) > 0 && topic.quizHighScore < 70) ||
      (totalCards > 0 && knownCards < totalCards * 0.5 && topic.studyTimeMinutes > 0);

    let level: 'not_started' | 'in_progress' | 'mastered' | 'needs_practice' = 'not_started';
    if (isWeak) {
      level = 'needs_practice';
    } else if (percentage >= 80) {
      level = 'mastered';
    } else if (percentage > 0) {
      level = 'in_progress';
    }

    return { percentage, level, isWeak };
  };

  // Identify Weak Topics across enrolled subjects
  const weakTopics = React.useMemo(() => {
    const list: { subjectName: string; topicId: string; topicName: string; score?: number }[] = [];
    subjects
      .filter((s) => s.isEnrolled)
      .forEach((sub) => {
        sub.topics.forEach((t) => {
          const stats = calculateTopicProgress(t);
          if (stats.isWeak || stats.level === 'needs_practice') {
            list.push({
              subjectName: sub.name,
              topicId: t.id,
              topicName: t.name,
              score: t.quizHighScore,
            });
          }
        });
      });
    return list;
  }, [subjects]);

  const celebrate = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
      });
    } catch (e) {
      // safe fallback if canvas-confetti is in test environment
    }
  };

  const addXP = (amount: number, reason?: string) => {
    setUserProfile((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 250) + 1;
      if (newLevel > prev.level) {
        celebrate();
      }
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  };

  const logStudyTime = (minutes: number) => {
    if (minutes <= 0) return;
    setUserProfile((prev) => {
      const newMinutes = prev.minutesStudiedToday + minutes;
      const newStreak = prev.streakDays === 0 ? 1 : prev.streakDays;
      if (newMinutes >= prev.dailyGoalMinutes && prev.minutesStudiedToday < prev.dailyGoalMinutes) {
        celebrate();
        addXP(50, 'Daily Study Goal Reached');
      }
      return {
        ...prev,
        minutesStudiedToday: newMinutes,
        streakDays: newStreak,
        lastActiveDate: todayStr,
      };
    });
  };

  const updateProfile = (profileUpdate: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...profileUpdate,
    }));
  };

  const toggleSubjectEnrolled = (subjectId: string) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, isEnrolled: !s.isEnrolled } : s))
    );
  };

  const addCustomSubject = (name: string, code?: string, color?: string): string => {
    const id = `custom-sub-${Date.now()}`;
    const newSubject: SubjectConfig = {
      id,
      name,
      code: code || name.slice(0, 4).toUpperCase(),
      color: color || '#3B82F6',
      accentColor: color || '#60A5FA',
      iconName: 'BookOpen',
      isEnrolled: true,
      isCustom: true,
      topics: [],
    };
    setSubjects((prev) => [...prev, newSubject]);
    addXP(30, 'Added Custom Subject');
    return id;
  };

  const addCustomTopic = (subjectId: string, name: string): string => {
    const topicId = `topic-${Date.now()}`;
    const newTopic = {
      id: topicId,
      subjectId,
      name,
      progressPercentage: 0,
      masteryLevel: 'not_started' as const,
      hasNotes: false,
      flashcards: [],
      quizQuestions: [],
      keyTerms: [],
      studyTimeMinutes: 0,
    };
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId ? { ...s, topics: [...s.topics, newTopic] } : s
      )
    );
    addXP(20, 'Created New Topic');
    return topicId;
  };

  const deleteTopic = (subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) }
          : s
      )
    );
  };

  const saveTopicAIContent = (
    subjectId: string,
    topicId: string,
    content: {
      notes?: SmartNotes;
      flashcards?: Flashcard[];
      quizQuestions?: QuizQuestion[];
      keyTerms?: KeyTerm[];
    }
  ) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map((t) => {
            if (t.id !== topicId) return t;
            const updatedTopic = {
              ...t,
              hasNotes: !!content.notes || t.hasNotes,
              notes: content.notes || t.notes,
              flashcards: content.flashcards && content.flashcards.length > 0 ? content.flashcards : t.flashcards,
              quizQuestions: content.quizQuestions && content.quizQuestions.length > 0 ? content.quizQuestions : t.quizQuestions,
              keyTerms: content.keyTerms && content.keyTerms.length > 0 ? content.keyTerms : t.keyTerms,
              lastStudied: new Date().toISOString(),
            };
            const stats = calculateTopicProgress(updatedTopic);
            return {
              ...updatedTopic,
              progressPercentage: stats.percentage,
              masteryLevel: stats.level,
              isWeak: stats.isWeak,
            };
          }),
        };
      })
    );

    addXP(40, 'Generated AI Study Material');
    logStudyTime(10);
    celebrate();
  };

  const markFlashcard = (topicId: string, cardId: string, known: boolean) => {
    setSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        topics: s.topics.map((t) => {
          if (t.id !== topicId) return t;
          const updatedCards = t.flashcards.map((c) =>
            c.id === cardId
              ? { ...c, known, reviewCount: (c.reviewCount || 0) + 1 }
              : c
          );
          const updatedTopic = {
            ...t,
            flashcards: updatedCards,
            studyTimeMinutes: t.studyTimeMinutes + 1,
            lastStudied: new Date().toISOString(),
          };
          const stats = calculateTopicProgress(updatedTopic);
          return {
            ...updatedTopic,
            progressPercentage: stats.percentage,
            masteryLevel: stats.level,
            isWeak: stats.isWeak,
          };
        }),
      }))
    );

    addXP(known ? 10 : 3, known ? 'Mastered Flashcard' : 'Reviewed Flashcard');
    logStudyTime(1);
  };

  const recordQuizCompleted = (
    subjectId: string,
    topicId: string,
    scorePercentage: number,
    durationMinutes: number
  ) => {
    const subject = subjects.find((s) => s.id === subjectId);
    const topic = subject?.topics.find((t) => t.id === topicId);

    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map((t) => {
            if (t.id !== topicId) return t;
            const newHighScore = Math.max(t.quizHighScore || 0, scorePercentage);
            const updatedTopic = {
              ...t,
              quizHighScore: newHighScore,
              totalQuizAttempts: (t.totalQuizAttempts || 0) + 1,
              studyTimeMinutes: t.studyTimeMinutes + durationMinutes,
              lastStudied: new Date().toISOString(),
            };
            const stats = calculateTopicProgress(updatedTopic);
            return {
              ...updatedTopic,
              progressPercentage: stats.percentage,
              masteryLevel: stats.level,
              isWeak: stats.isWeak,
            };
          }),
        };
      })
    );

    const xpEarned = Math.round(scorePercentage * 0.5) + (scorePercentage === 100 ? 30 : 10);
    addXP(xpEarned, `Completed Quiz (${scorePercentage}%)`);
    logStudyTime(durationMinutes);

    setActivityLogs((prev) => [
      {
        id: `quiz-log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'quiz_completed',
        subject: subject?.name || subjectId,
        topic: topic?.name || topicId,
        score: scorePercentage,
        xpEarned,
        durationMinutes,
        details: `Scored ${scorePercentage}% in topic quiz`,
      },
      ...prev.slice(0, 49),
    ]);

    if (scorePercentage >= 80) {
      celebrate();
    }
  };

  const recordNoteRead = (subjectId: string, topicId: string, durationMinutes: number = 10) => {
    const subject = subjects.find((s) => s.id === subjectId);
    const topic = subject?.topics.find((t) => t.id === topicId);

    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map((t) => {
            if (t.id !== topicId) return t;
            const updatedTopic = {
              ...t,
              notesRead: true,
              studyTimeMinutes: t.studyTimeMinutes + durationMinutes,
              lastStudied: new Date().toISOString(),
            };
            const stats = calculateTopicProgress(updatedTopic);
            return {
              ...updatedTopic,
              progressPercentage: stats.percentage,
              masteryLevel: stats.level,
              isWeak: stats.isWeak,
            };
          }),
        };
      })
    );

    const xpEarned = 25;
    addXP(xpEarned, 'Completed Smart Notes Reading');
    logStudyTime(durationMinutes);

    setActivityLogs((prev) => [
      {
        id: `note-log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'note_read',
        subject: subject?.name || subjectId,
        topic: topic?.name || topicId,
        xpEarned,
        durationMinutes,
        details: 'Read and studied Smart Notes',
      },
      ...prev.slice(0, 49),
    ]);
  };

  const recordGamePlayed = (
    subjectId: string,
    topicId: string,
    gameName: string,
    score: number,
    xpEarned: number
  ) => {
    const subject = subjects.find((s) => s.id === subjectId);
    const topic = subject?.topics.find((t) => t.id === topicId);

    addXP(xpEarned, `Played ${gameName}`);
    logStudyTime(5);

    setActivityLogs((prev) => [
      {
        id: `game-log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'game_played',
        subject: subject?.name || subjectId,
        topic: topic?.name || topicId,
        score,
        xpEarned,
        durationMinutes: 5,
        details: `Scored ${score} in ${gameName}`,
      },
      ...prev.slice(0, 49),
    ]);

    celebrate();
  };

  const toggleSessionComplete = (sessionId: string) => {
    setStudySessions((prev) =>
      prev.map((sess) => {
        if (sess.id !== sessionId) return sess;
        const nextCompleted = !sess.completed;
        if (nextCompleted) {
          addXP(25, 'Completed Scheduled Study Session');
          logStudyTime(sess.durationMinutes || 25);
          celebrate();
        }
        return {
          ...sess,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const addStudySession = (session: Omit<StudySession, 'id' | 'completed'>) => {
    const newSession: StudySession = {
      ...session,
      id: `sess-${Date.now()}`,
      completed: false,
    };
    setStudySessions((prev) => [newSession, ...prev]);
    addXP(10, 'Scheduled Study Session');
  };

  const deleteStudySession = (sessionId: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const addTestCountdown = (test: Omit<TestCountdown, 'id'>) => {
    const newTest: TestCountdown = {
      ...test,
      id: `test-${Date.now()}`,
    };
    setTestCountdowns((prev) => [...prev, newTest]);
    addXP(15, 'Added Assessment Countdown');
  };

  const deleteTestCountdown = (testId: string) => {
    setTestCountdowns((prev) => prev.filter((t) => t.id !== testId));
  };

  const updateTimetable = (newTimetable: SchoolTimetable) => {
    setTimetable(newTimetable);
    addXP(25, 'Updated School Timetable');
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TIMETABLE);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.TESTS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);

    setUserProfile({
      name: 'Grade 12 Learner',
      grade: 'Grade 12',
      school: 'Matric High',
      avatarColor: '#2563EB',
      dailyGoalMinutes: 60,
      targetExamDate: new Date(new Date().getFullYear(), 9, 25).toISOString().split('T')[0],
      xp: 0,
      level: 1,
      streakDays: 0,
      lastActiveDate: todayStr,
      minutesStudiedToday: 0,
      completedDays: [],
      hasCompletedOnboarding: true,
    });
    setSubjects(DEFAULT_SUBJECTS);
    setTimetable(DEFAULT_TIMETABLE);
    setStudySessions(DEFAULT_SESSIONS);
    setTestCountdowns(DEFAULT_TESTS);
    setActivityLogs([]);
  };

  return (
    <StudyContext.Provider
      value={{
        userProfile,
        subjects,
        timetable,
        studySessions,
        testCountdowns,
        activityLogs,
        weakTopics,
        updateProfile,
        toggleSubjectEnrolled,
        addCustomSubject,
        addCustomTopic,
        deleteTopic,
        saveTopicAIContent,
        markFlashcard,
        recordQuizCompleted,
        recordNoteRead,
        recordGamePlayed,
        addXP,
        logStudyTime,
        toggleSessionComplete,
        addStudySession,
        deleteStudySession,
        addTestCountdown,
        deleteTestCountdown,
        updateTimetable,
        resetAllData,
        celebrate,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
