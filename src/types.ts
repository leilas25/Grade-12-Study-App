export type Difficulty = 'easy' | 'medium' | 'hard';

export interface KeyConcept {
  title: string;
  explanation: string;
  tag?: 'Core' | 'Formula' | 'Process' | 'Theory' | 'Law';
}

export interface Definition {
  term: string;
  definition: string;
}

export interface Example {
  title: string;
  problem: string;
  solution: string;
  examTip?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: Difficulty;
  topic: string;
  known?: boolean;
  reviewCount?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  topic?: string;
}

export interface KeyTerm {
  word: string;
  clue: string;
}

export interface SmartNotes {
  summary: string;
  keyConcepts: KeyConcept[];
  definitions: Definition[];
  keyFacts: string[];
  rememberThis: string[];
  importantExamples: Example[];
  rawUploadedContent?: string;
  lastUpdated: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  progressPercentage: number; // 0 - 100 calculated dynamically
  masteryLevel: 'not_started' | 'in_progress' | 'mastered' | 'needs_practice';
  isWeak?: boolean;
  hasNotes: boolean;
  notesRead?: boolean;
  notes?: SmartNotes;
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  keyTerms: KeyTerm[];
  studyTimeMinutes: number;
  lastStudied?: string;
  quizHighScore?: number;
  totalQuizAttempts?: number;
}

export interface SubjectConfig {
  id: string;
  name: string;
  code: string;
  color: string;
  accentColor: string;
  iconName: string;
  isEnrolled: boolean;
  isCustom?: boolean;
  topics: Topic[];
}

export interface TimetablePeriod {
  period?: number;
  time?: string;
  startTime?: string;
  endTime?: string;
  subject: string;
  room?: string;
  teacher?: string;
}

export interface DaySchedule {
  day: string;
  periods: TimetablePeriod[];
}

export interface SchoolTimetable {
  schoolName?: string;
  lastUpdated?: string;
  days: DaySchedule[];
}

export interface StudySession {
  id: string;
  day: string; // e.g. "Monday", "2026-08-25"
  subject: string;
  topic: string;
  durationMinutes: number;
  activity: string;
  scheduledTime?: string;
  completed: boolean;
  completedAt?: string;
}

export interface TestCountdown {
  id: string;
  subject: string;
  title: string;
  date: string; // YYYY-MM-DD
  weighting?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'note_read' | 'flashcard_session' | 'quiz_completed' | 'game_played' | 'study_session';
  subject: string;
  topic: string;
  score?: number;
  xpEarned: number;
  durationMinutes: number;
  details?: string;
}

export interface UserProfile {
  name: string;
  grade: string;
  school: string;
  avatarColor: string;
  dailyGoalMinutes: number;
  targetExamDate?: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  minutesStudiedToday: number;
  completedDays: string[]; // ['2026-08-24', ...]
  hasCompletedOnboarding: boolean;
}

export type AppView = 'home' | 'subjects' | 'topic_detail' | 'games' | 'planner' | 'progress';

export type GameType = 
  | 'match_cards'
  | 'memory_match'
  | 'crossword'
  | 'word_search'
  | 'speed_round'
  | 'multiple_choice_sprint'
  | 'true_false_gauntlet'
  | 'fill_in_blank';
