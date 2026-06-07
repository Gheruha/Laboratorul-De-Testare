import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ClipboardCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LessonContent } from '@/components/lessons/lesson-content';
import {
  getLessonBySlug,
  getLessonNavigation,
} from '@/lib/utils/lesson/lesson.utils';

interface LessonPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const [lesson, navigation] = await Promise.all([
    getLessonBySlug(slug),
    getLessonNavigation(slug),
  ]);

  if (!lesson) notFound();

  return (
    <article className="mx-auto w-full max-w-4xl px-5 py-10 md:px-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Manual Testing</Badge>
          <Badge variant="outline">
            Lesson {navigation.position} of {navigation.total}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold md:text-4xl">{lesson.title}</h1>
        {lesson.description && (
          <p className="max-w-2xl text-muted-foreground">
            {lesson.description}
          </p>
        )}
      </header>

      <Separator className="my-8" />
      <LessonContent blocks={lesson.content.blocks} />
      <Separator className="my-10" />

      <footer className="space-y-6">
        <div className="flex justify-center">
          <Button disabled size="lg">
            <ClipboardCheck />
            Quiz coming soon
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            {navigation.previous && (
              <Button
                variant="outline"
                asChild
                className="h-auto w-full justify-start py-3"
              >
                <Link href={`/workspace/lessons/${navigation.previous.slug}`}>
                  <ArrowLeft />
                  <span className="truncate">{navigation.previous.title}</span>
                </Link>
              </Button>
            )}
          </div>
          <div>
            {navigation.next && (
              <Button
                variant="outline"
                asChild
                className="h-auto w-full justify-end py-3"
              >
                <Link href={`/workspace/lessons/${navigation.next.slug}`}>
                  <span className="truncate">{navigation.next.title}</span>
                  <ArrowRight />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </footer>
    </article>
  );
}
