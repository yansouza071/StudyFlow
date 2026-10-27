export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type ObjectiveStatus = 'todo' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface StudyObjective {
  id: string;
  title: string;
  description: string;
  targetDate: string; // YYYY-MM-DD (prazo)
  status: ObjectiveStatus;
  category?: string;
  priority?: PriorityLevel;
  progress?: number; // 0 - 100
  estimatedHours?: number;
  loggedHours?: number;
  subtasks?: Subtask[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  objectiveId?: string;
  objectiveTitle?: string;
  durationMinutes: number;
  timestamp: string;
  type: 'focus' | 'break';
}

export interface FilterOptions {
  search: string;
  status: string; // '' | 'todo' | 'in_progress' | 'completed'
  category: string;
  sortBy: 'targetDate' | 'createdAt' | 'title' | 'status';
  sortOrder: 'asc' | 'desc';
}

export type ViewMode = 'cards' | 'kanban' | 'pomodoro' | 'analytics';

export interface GeneratedStudyPlan {
  topic: string;
  summary: string;
  estimatedHours: number;
  suggestedPriority?: PriorityLevel;
  subtasks: Array<{ title: string; estimatedMinutes?: number }>;
  studyTips: string[];
  recommendedResources?: Array<{ title: string; url: string; type?: string }>;
}

export interface FlashcardQuestion {
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
