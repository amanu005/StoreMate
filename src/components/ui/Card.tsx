'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'outline' | 'hero' | 'highlight';
}

export function Card({
  children,
  className,
  variant = 'default',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-3xl transition-all duration-200';

  const variants = {
    default: 'bg-white border border-slate-100 shadow-soft hover:shadow-card',
    flat: 'bg-slate-50 border border-slate-200/60',
    outline: 'bg-white border-2 border-slate-200',
    hero: 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-float',
    highlight: 'bg-emerald-50/70 border border-emerald-200',
  };

  return (
    <div className={twMerge(clsx(baseStyles, variants[variant], className))} {...props}>
      {children}
    </div>
  );
}
