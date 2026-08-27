export interface ProcessMaterialPayload {
  subject: string;
  topic: string;
  notesText?: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface CoachMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CoachContext {
  subject?: string;
  topic?: string;
  notesSnippet?: string;
  weakTopics?: string[];
}

export const geminiService = {
  async processStudyMaterial(payload: ProcessMaterialPayload) {
    const res = await fetch('/api/ai/process-material', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to process study material.');
    }
    return data.data;
  },

  async askCoach(message: string, history: CoachMessage[] = [], context?: CoachContext) {
    const res = await fetch('/api/ai/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, context }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Study Coach is currently unavailable.');
    }
    return data.reply;
  },

  async parseTimetable(payload: { imageBase64?: string; mimeType?: string; rawText?: string }) {
    const res = await fetch('/api/ai/parse-timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to parse timetable.');
    }
    return data.data;
  },

  async generateStudyPlan(payload: {
    enrolledSubjects: string[];
    weakTopics: string[];
    upcomingTests: { subject: string; title: string; date: string }[];
    dailyTargetMinutes: number;
  }) {
    const res = await fetch('/api/ai/generate-study-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to generate study plan.');
    }
    return data.data;
  },
};
