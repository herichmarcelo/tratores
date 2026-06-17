import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
  {
    variants: {
      variant: {
        default: 'bg-green-50 text-green-700 ring-green-600/20',
        warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
        destructive: 'bg-red-50 text-red-700 ring-red-600/20',
        secondary: 'bg-gray-50 text-gray-600 ring-gray-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);

export { Badge, badgeVariants };