'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TestimonyStatus } from '@/types';

const statusConfig: Record<
  TestimonyStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  Draft: { label: 'Borrador', variant: 'secondary' },
  PendingReview: { label: 'En revisión', variant: 'outline' },
  Published: { label: 'Publicado', variant: 'default' },
  Rejected: { label: 'Rechazado', variant: 'destructive' },
};

interface StatusBadgeProps {
  status: TestimonyStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
