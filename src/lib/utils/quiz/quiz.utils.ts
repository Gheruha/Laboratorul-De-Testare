import { createSupabaseClientServiceRole } from '@/lib/supabase/client';
import type {
  Quiz,
  QuizOption,
  QuizQuestion,
  QuizSelectionMode,
} from '@/lib/types/quiz.type';

type QuizOptionRow = QuizOption & { question_id: string };

export const getPublishedQuizById = async (
  quizId: string,
): Promise<Quiz | null> => {
  const supabase = createSupabaseClientServiceRole();
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('id, title, passing_score')
    .eq('id', quizId)
    .eq('is_published', true)
    .maybeSingle();

  if (quizError) {
    if (
      quizError.code === 'PGRST205' ||
      quizError.message.includes('schema cache')
    ) {
      throw new Error(
        'Quiz tables are not installed. Run supabase/migrations/20260607001000_seed_english_quizzes.sql in the Supabase SQL Editor.',
      );
    }

    throw new Error(quizError.message || 'Failed to load quiz');
  }

  if (!quiz) return null;

  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('slug')
    .eq('quiz_id', quizId)
    .eq('is_published', true)
    .maybeSingle();

  if (lessonError) {
    throw new Error(lessonError.message || 'Failed to load quiz lesson');
  }

  if (!lesson) return null;

  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('id, prompt, explanation, selection_mode, order_index')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true });

  if (questionsError) {
    throw new Error(questionsError.message || 'Failed to load quiz questions');
  }

  const questionIds = (questions ?? []).map(question => question.id);
  let options: QuizOptionRow[] = [];

  if (questionIds.length > 0) {
    const { data: optionRows, error: optionsError } = await supabase
      .from('quiz_options')
      .select('id, question_id, label, is_correct, order_index')
      .in('question_id', questionIds)
      .order('order_index', { ascending: true });

    if (optionsError) {
      throw new Error(optionsError.message || 'Failed to load quiz options');
    }

    options = optionRows ?? [];
  }

  const mappedQuestions: QuizQuestion[] = (questions ?? []).map(question => ({
    ...question,
    selection_mode: question.selection_mode as QuizSelectionMode,
    options: options.filter(option => option.question_id === question.id),
  }));

  return {
    ...quiz,
    lesson_slug: lesson.slug,
    questions: mappedQuestions,
  };
};
