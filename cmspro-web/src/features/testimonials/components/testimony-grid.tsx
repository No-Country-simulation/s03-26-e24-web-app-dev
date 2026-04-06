'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TestimonialCard } from './testimonial-card';
import { SuccessCaseCard } from './success-case-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import type { Testimony } from '@/types';
import { FileText } from 'lucide-react';

interface TestimonyGridProps {
  testimonials: Testimony[];
  isLoading?: boolean;
  emptyMessage?: string;
  onCreateNew?: () => void;
}

export function TestimonyGrid({
  testimonials,
  isLoading,
  emptyMessage = 'No hay testimonios para mostrar',
  onCreateNew,
}: TestimonyGridProps) {
  const router = useRouter();

  const handleClick = useCallback(
    (testimony: Testimony) => {
      router.push(`/testimonials/${testimony.id}`);
    },
    [router]
  );

  const handleReadMore = useCallback(
    (testimony: Testimony) => {
      router.push(`/testimonials/${testimony.id}`);
    },
    [router]
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex items-center gap-3 border-t p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6 text-muted-foreground" />}
        title={emptyMessage}
        description="Los testimonios aparecerán aquí una vez que sean creados y publicados."
        action={
          onCreateNew
            ? { label: 'Crear testimonio', onClick: onCreateNew }
            : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimony) =>
        testimony.type === 'SuccessCase' ? (
          <SuccessCaseCard
            key={testimony.id}
            testimony={testimony}
            onClick={() => handleClick(testimony)}
            onReadMore={() => handleReadMore(testimony)}
          />
        ) : (
          <TestimonialCard
            key={testimony.id}
            testimonial={testimony}
            onClick={() => handleClick(testimony)}
          />
        )
      )}
    </div>
  );
}
