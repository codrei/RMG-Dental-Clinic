import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

type Variant = 'primary' | 'outline' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold text-sm px-6 py-3 transition-colors disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover',
  outline: 'border border-primary/30 text-primary hover:bg-primary-soft',
  ghost: 'text-foreground hover:bg-muted',
};

interface ButtonProps {
  to?: string;
  href?: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function Button({
  to,
  href,
  variant = 'primary',
  children,
  className = '',
  onClick,
  type = 'button',
  disabled,
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
      <span className="h-px w-6 bg-primary/50" aria-hidden="true" />
      {children}
    </span>
  );
}
