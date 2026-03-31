import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Testimony } from '@/types';
import { TESTIMONY_STATUS } from '@/config/constants';

interface TestimonialCardProps {
  testimonial: Testimony;
  onClick?: () => void;
  className?: string;
}

export function TestimonialCard({ testimonial, onClick, className }: TestimonialCardProps) {
  const statusConfig = TESTIMONY_STATUS[testimonial.status];
  const image = testimonial.mediaFiles.find((m) => m.type === 'Image');

  return (
    <article
      onClick={onClick}
      className={cn(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md',
        className
      )}
    >
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
        <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-md">
          <Image
            src={image.url}
            alt={testimonial.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <blockquote className="mb-3 flex-1 text-sm text-muted-foreground">
        &ldquo;{testimonial.body}&rdquo;
      </blockquote>

      {/* Author */}
      <footer className="mt-auto">
        <p className="font-medium text-foreground">{testimonial.authorName}</p>
        {testimonial.authorRole && (
          <p className="text-xs text-muted-foreground">{testimonial.authorRole}</p>
        )}
      </footer>

      {/* Category tag */}
      {testimonial.category && (
        <span className="mt-2 inline-block self-start rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {testimonial.category.name}
        </span>
      )}
    </article>
  );
}
