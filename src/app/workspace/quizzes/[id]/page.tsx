import { notFound } from 'next/navigation';
import { QuizRunner } from '@/components/quizzes/quiz-runner';
import { getPublishedQuizById } from '@/lib/utils/quiz/quiz.utils';

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;
  const quiz = await getPublishedQuizById(id);

  if (!quiz) notFound();

  return <QuizRunner quiz={quiz} />;
}
