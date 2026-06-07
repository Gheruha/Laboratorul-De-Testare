export type LessonCalloutVariant = 'example' | 'info' | 'summary' | 'warning';

export type LessonBlock =
  | {
      type: 'heading';
      level: 1 | 2 | 3;
      text: string;
    }
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'callout';
      variant: LessonCalloutVariant;
      title: string;
      text: string;
    }
  | {
      type: 'list';
      style: 'ordered' | 'unordered';
      items: string[];
    }
  | {
      type: 'table';
      headers: string[];
      rows: string[][];
    }
  | {
      type: 'code';
      language?: string;
      code?: string;
      text?: string;
    };

export interface LessonContent {
  blocks: LessonBlock[];
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  module_number: number;
  order_index: number;
  quiz_id: string | null;
}

export interface Lesson extends LessonSummary {
  content: LessonContent;
  language: string;
  source_language: string | null;
}

export interface LessonNavigation {
  previous: LessonSummary | null;
  next: LessonSummary | null;
  position: number;
  total: number;
}
