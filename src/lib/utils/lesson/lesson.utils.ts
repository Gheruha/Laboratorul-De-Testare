import { createSupabaseClientServiceRole } from '@/lib/supabase/client';
import {
  Lesson,
  LessonBlock,
  LessonContent,
  LessonNavigation,
  LessonSummary,
} from '@/lib/types/lesson.type';
import type { Json } from '@/lib/types/database.types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseLessonContent = (content: Json): LessonContent => {
  if (!isRecord(content) || !Array.isArray(content.blocks)) {
    return { blocks: [] };
  }

  return { blocks: content.blocks as LessonBlock[] };
};

export const getPublishedLessons = async (): Promise<LessonSummary[]> => {
  const supabase = createSupabaseClientServiceRole();
  const { data, error } = await supabase
    .from('lessons')
    .select('id, slug, title, description, module_number, order_index, quiz_id')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Failed to load lessons');
  }

  return data ?? [];
};

export const getLessonBySlug = async (slug: string): Promise<Lesson | null> => {
  const supabase = createSupabaseClientServiceRole();
  const { data, error } = await supabase
    .from('lessons')
    .select(
      'id, slug, title, description, module_number, order_index, quiz_id, content, language, source_language',
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Failed to load lesson');
  }

  if (!data) return null;

  return {
    ...data,
    content: parseLessonContent(data.content),
  };
};

export const getLessonNavigation = async (
  currentSlug: string,
): Promise<LessonNavigation> => {
  const lessons = await getPublishedLessons();
  const currentIndex = lessons.findIndex(lesson => lesson.slug === currentSlug);

  if (currentIndex === -1) {
    return { previous: null, next: null, position: 0, total: lessons.length };
  }

  return {
    previous: lessons[currentIndex - 1] ?? null,
    next: lessons[currentIndex + 1] ?? null,
    position: currentIndex + 1,
    total: lessons.length,
  };
};
