import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Testimony } from '@/types';
import { TESTIMONY_STATUS } from '@/config/constants';

interface SuccessCaseCardProps {
  testimony: Testimony;
  onClick?: () => void;
  onReadMore?: () => void;
  className?: string;
}

export function SuccessCaseCard({
  testimony,
  onClick,
  onReadMore,
  className,
}: SuccessCaseCardProps) {
  const statusConfig = TESTIMONY_STATUS[testimony.status];
  const image = testimony.mediaFiles.find((m) => m.type === 'Image');

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReadMore?.();
  };

  return (
    <article
      onClick={onClick}
      className={cn(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border-2 border-primary/20 bg-card p-5 shadow-md transition-all hover:border-primary/40 hover:shadow-lg',
        // Success cases are larger/more prominent
        'min-h-[280px]',
        className
      )}
    >
      {/* Featured badge */}
      <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
        Caso de Éxito
      </span>

      {/* Status badge */}
      <span
        className={cn(
          'absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium',
          {
            'bg-gray-100 text-gray-700': statusConfig.color === 'gray',
            'bg-yellow-100 text-yellow-700': statusConfig.color === 'yellow',
            'bg-green-100 text-green-700': statusConfig.color === 'green',
            'bg-red-100 text-red-700': statusConfig.color === 'red',
          }
        )}
      >
        {statusConfig.label}
      </span>

      {/* Image */}
      {image && (
        <div className="relative mb-4 mt-6 aspect-video w-full overflow-hidden rounded-md">
          <Image
            src={image.url}
            alt={testimony.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="mb-2 mt-4 text-lg font-semibold text-foreground">
        {testimony.title}
      </h3>

      {/* Preview text */}
      <blockquote className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
        &ldquo;{testimony.body}&rdquo;
      </blockquote>

      {/* Read more button */}
      <button
        onClick={handleReadMore}
        className="mb-3 self-start text-sm font-medium text-primary hover:underline"
      >
        Leer más →
      </button>

      {/* Author */}
      <footer className="mt-auto border-t pt-3">
        <p className="font-medium text-foreground">{testimony.authorName}</p>
        {testimony.authorRole && (
          <p className="text-xs text-muted-foreground">{testimony.authorRole}</p>
        )}
      </footer>

      {/* Category tag */}
      {testimony.category && (
        <span className="mt-2 inline-block self-start rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {testimony.category.name}
        </span>
      )}
    </article>
  );
}
