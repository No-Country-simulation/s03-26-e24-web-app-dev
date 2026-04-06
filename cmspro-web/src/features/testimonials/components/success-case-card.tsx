'use client';

import { memo, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { cn } from '@/lib/utils';
import type { Testimony } from '@/types';
import { ArrowRight, Star } from 'lucide-react';

interface SuccessCaseCardProps {
  testimony: Testimony;
  onClick?: () => void;
  onReadMore?: () => void;
  className?: string;
}

export const SuccessCaseCard = memo(function SuccessCaseCard({
  testimony,
  onClick,
  onReadMore,
  className,
}: SuccessCaseCardProps) {
  const image = useMemo(
    () => testimony.mediaFiles.find((m) => m.type === 'Image'),
    [testimony.mediaFiles]
  );
  
  const initials = useMemo(
    () =>
      testimony.authorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    [testimony.authorName]
  );

  const handleReadMore = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onReadMore?.();
    },
    [onReadMore]
  );

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden border-2 border-primary/20 transition-all hover:border-primary/40 hover:shadow-lg',
        className
      )}
    >
      {/* Featured Badge */}
      <div className="absolute left-3 top-3 z-10">
        <Badge className="gap-1 bg-primary">
          <Star className="h-3 w-3 fill-current" />
          Caso de Éxito
        </Badge>
      </div>

      {/* Status Badge */}
      <div className="absolute right-3 top-3 z-10">
        <StatusBadge status={testimony.status} />
      </div>

      {/* Image */}
      {image && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={image.url}
            alt={testimony.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      <CardHeader className={cn(!image && 'pt-12')}>
        <h3 className="text-lg font-semibold leading-tight">{testimony.title}</h3>
      </CardHeader>

      <CardContent className="pb-2">
        {/* Preview Quote */}
        <blockquote className="line-clamp-3 text-sm text-muted-foreground">
          &ldquo;{testimony.body}&rdquo;
        </blockquote>

        {/* Read More Button */}
        <Button
          variant="link"
          className="mt-2 h-auto p-0 text-primary"
          onClick={handleReadMore}
        >
          Leer más
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>

      <CardFooter className="flex items-center gap-3 border-t pt-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src="" alt={testimony.authorName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{testimony.authorName}</p>
          {testimony.authorRole && (
            <p className="truncate text-xs text-muted-foreground">
              {testimony.authorRole}
            </p>
          )}
        </div>
        {testimony.category && (
          <Badge variant="secondary" className="shrink-0">
            {testimony.category.name}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
});
