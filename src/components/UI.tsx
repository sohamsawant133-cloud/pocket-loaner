import React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { AlertCircle } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'primary';
  className?: string;
}

export const Card = ({ children, className, variant = 'default', ...props }: CardProps) => {
  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm',
    glass: 'glass-card',
    primary: 'bg-brand-secondary text-white shadow-lg',
  };

  // Extract motion-specific props or cast to any to avoid type conflicts with standard HTML attributes
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-3xl p-6', variants[variant], className)}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) => {
  const variants = {
    primary: 'bg-brand-primary text-brand-secondary font-bold hover:brightness-110 shadow-md',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary/90 shadow-md',
    outline: 'border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary/5',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(
        'rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const ErrorMessage = ({ message, onRetry, className }: { message: string, onRetry?: () => void, className?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-xs flex items-center gap-3", className)}
    >
      <AlertCircle className="w-5 h-5 shrink-0" />
      <p className="font-medium flex-1">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold transition-colors"
        >
          Retry
        </button>
      )}
    </motion.div>
  );
};
