'use client';

import type { ReactNode } from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface SegmentedTabItem {
  value: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface SegmentedTabsProps {
  items: SegmentedTabItem[];
  size?: 'sm' | 'md';
  className?: string;
  listClassName?: string;
  triggerClassName?: string;
}

export function SegmentedTabs({
  items,
  size = 'md',
  className,
  listClassName,
  triggerClassName,
}: SegmentedTabsProps) {
  return (
    <div className={cn('max-w-full overflow-x-auto', className)}>
      <TabsList
        className={cn(
          'inline-flex w-auto items-center justify-start gap-1 rounded-lg border border-border/70 bg-muted/70 p-0.5 shadow-sm backdrop-blur',
          size === 'sm' ? 'h-8' : 'h-9',
          listClassName
        )}
      >
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className={cn(
              '!flex-none gap-1.5 rounded-md font-medium transition-all duration-200 data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-sm',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              triggerClassName
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {typeof item.count === 'number' && (
              <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[11px] leading-none text-muted-foreground">
                {item.count}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
