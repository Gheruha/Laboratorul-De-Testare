import { AlertCircle, BookOpen, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  LessonBlock,
  LessonCalloutVariant,
} from '@/lib/types/lesson.type';
import { cn } from '@/lib/utils';

const calloutStyles: Record<
  LessonCalloutVariant,
  { className: string; icon: typeof Info }
> = {
  example: {
    className: 'border-blue-500/30 bg-blue-500/5',
    icon: BookOpen,
  },
  info: {
    className: 'border-cyan-500/30 bg-cyan-500/5',
    icon: Info,
  },
  summary: {
    className: 'border-emerald-500/30 bg-emerald-500/5',
    icon: CheckCircle2,
  },
  warning: {
    className: 'border-amber-500/30 bg-amber-500/5',
    icon: AlertCircle,
  },
};

export function LessonContent({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h2 key={key} className="pt-4 text-2xl font-semibold">
                {block.text}
              </h2>
            );
          }

          return (
            <h3 key={key} className="pt-2 text-lg font-semibold">
              {block.text}
            </h3>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p key={key} className="leading-7 text-muted-foreground">
              {block.text}
            </p>
          );
        }

        if (block.type === 'list') {
          const List = block.style === 'ordered' ? 'ol' : 'ul';
          return (
            <List
              key={key}
              className={cn(
                'space-y-2 pl-6 leading-7 text-muted-foreground',
                block.style === 'ordered' ? 'list-decimal' : 'list-disc',
              )}
            >
              {block.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </List>
          );
        }

        if (block.type === 'callout') {
          const style = calloutStyles[block.variant] ?? calloutStyles.info;
          const Icon = style.icon;
          return (
            <Card
              key={key}
              className={cn('gap-3 py-4 shadow-none', style.className)}
            >
              <CardHeader className="px-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="size-4" />
                  {block.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 text-sm leading-6 text-muted-foreground">
                {block.text}
              </CardContent>
            </Card>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={key} className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {block.headers.map(header => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {block.rows.map((row, rowIndex) => (
                    <TableRow key={`${key}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <TableCell
                          key={`${key}-${rowIndex}-${cellIndex}`}
                          className="whitespace-normal align-top"
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        }

        if (block.type === 'code') {
          return (
            <pre
              key={key}
              className="overflow-x-auto rounded-md border bg-muted p-4 text-sm"
            >
              <code>{block.code ?? block.text}</code>
            </pre>
          );
        }

        return null;
      })}
    </div>
  );
}
