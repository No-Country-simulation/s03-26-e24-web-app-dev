'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';
import type { Testimony } from '@/types';

interface TestimonialCardProps {
  testimonial: Testimony;
  onClick?: () => void;
  className?: string;
}

export const TestimonialCard = memo(function TestimonialCard({
  testimonial,
  onClick,
  className,
}: TestimonialCardProps) {
  const image = useMemo(
    () => testimonial.mediaFiles.find((m) => m.type === 'Image'),
    [testimonial.mediaFiles]
  );
  
  const initials = useMemo(
    () =>
      testimonial.authorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    [testimonial.authorName]
  );

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group cursor-pointer transition-all hover:shadow-md',
        className
      )}
    >
      <CardContent className="p-4">
        {/* Status */}
        <div className="mb-3 flex justify-end">
          <StatusBadge status={testimonial.status} />
        </div>

        {/* Image */}
        {image && (
          <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-md">
            <Image
              src={image.url}
              alt={testimonial.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}

        {/* Quote */}
        <blockquote className="mb-4 line-clamp-4 break-words text-sm italic text-muted-foreground">
          &ldquo;{testimonial.body}&rdquo;
        </blockquote>
      </CardContent>

      <CardFooter className="flex items-center gap-3 border-t px-4 py-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" alt={testimonial.authorName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{testimonial.authorName}</p>
          {testimonial.authorRole && (
            <p className="truncate text-xs text-muted-foreground">
              {testimonial.authorRole}
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
});
