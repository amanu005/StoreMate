'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StockStatus } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'healthy' | 'low' | 'critical' | 'neutral' | 'info' | 'voice' | 'sale';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border';

  const variants = {
    healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    low: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    critical: 'bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulseSlow',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    voice: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    sale: 'bg-emerald-100/60 text-emerald-800 border-emerald-300',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
}

export function StockStatusBadge({ status, language = 'ta' }: { status: StockStatus; language?: string }) {
  if (status === 'healthy') {
    return (
      <Badge variant="healthy" size="sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
        {language === 'ta' ? 'நல்ல நிலை' : 'Healthy'}
      </Badge>
    );
  }
  if (status === 'low') {
    return (
      <Badge variant="low" size="sm">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-ping" />
        {language === 'ta' ? 'குறைவு' : 'Low Stock'}
      </Badge>
    );
  }
  return (
    <Badge variant="critical" size="sm">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-ping" />
      {language === 'ta' ? 'தீர்ந்தது' : 'Critical'}
    </Badge>
  );
}
