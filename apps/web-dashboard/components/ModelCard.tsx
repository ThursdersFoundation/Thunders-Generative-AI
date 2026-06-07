'use client';

import { useCallback } from 'react';
import type { AIModel, ModelStatus, ModelType } from '@/types/model';
import clsx from 'clsx';

interface ModelCardProps {
  model: AIModel;
  onSelect?: (model: AIModel) => void;
  selected?: boolean;
  className?: string;
}

const statusConfig: Record<ModelStatus, { label: string; dotClass: string; badgeClass: string }> = {
  active: {
    label: 'Active',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  inactive: {
    label: 'Inactive',
    dotClass: 'bg-gray-400',
    badgeClass: 'bg-gray-400/10 text-gray-600 dark:text-gray-400',
  },
  loading: {
    label: 'Loading',
    dotClass: 'bg-amber-500 animate-pulse',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  error: {
    label: 'Error',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
};

const typeIcons: Record<ModelType, string> = {
  llm: '🧠',
  image: '🎨',
  audio: '🔊',
  video: '🎬',
  embedding: '📐',
  multimodal: '🔀',
};

export default function ModelCard({ model, onSelect, selected = false, className = '' }: ModelCardProps) {
  const status = statusConfig[model.status];

  const handleClick = useCallback(() => {
    onSelect?.(model);
  }, [model, onSelect]);

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'group relative flex flex-col rounded-xl border bg-card p-5 transition-all duration-200 cursor-pointer',
        'hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5',
        selected && 'border-primary ring-2 ring-primary/20',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg">
            {typeIcons[model.type]}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
              {model.displayName}
            </h3>
            <p className="text-xs text-muted-foreground">{model.provider}/{model.name}</p>
          </div>
        </div>
        <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium', status.badgeClass)}>
          <span className={clsx('h-1.5 w-1.5 rounded-full', status.dotClass)} />
          {status.label}
        </span>
      </div>

      {/* Description */}
      <p className="mb-4 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {model.description}
      </p>

      {/* Capabilities */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {model.capabilities.streaming && (
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            Streaming
          </span>
        )}
        {model.capabilities.functionCalling && (
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            Function Calling
          </span>
        )}
        {model.capabilities.vision && (
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            Vision
          </span>
        )}
        {model.capabilities.codeExecution && (
          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
            Code
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div className="text-center">
          <p className="text-sm font-semibold text-card-foreground">{formatNumber(model.requestCount)}</p>
          <p className="text-[10px] text-muted-foreground">Requests</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-card-foreground">{model.avgLatencyMs}ms</p>
          <p className="text-[10px] text-muted-foreground">Latency</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-card-foreground">
            {model.capabilities.contextWindow >= 1000
              ? `${model.capabilities.contextWindow / 1000}K`
              : model.capabilities.contextWindow}
          </p>
          <p className="text-[10px] text-muted-foreground">Context</p>
        </div>
      </div>

      {/* Pricing hint */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          ${model.pricing.inputPerMillion}/M in · ${model.pricing.outputPerMillion}/M out
        </span>
        <span>v{model.version}</span>
      </div>
    </div>
  );
}
