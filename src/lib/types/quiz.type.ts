export type QuizSelectionMode = 'single' | 'multiple';

export interface QuizOption {
  id: string;
  label: string;
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  explanation: string | null;
  selection_mode: QuizSelectionMode;
  order_index: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  title: string;
  passing_score: number;
  max_points: number;
  lesson_slug: string;
  questions: QuizQuestion[];
}
