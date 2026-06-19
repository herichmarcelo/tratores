import React from 'react';
import { Tractor } from 'lucide-react';
import { cn } from '../utils';

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
  wide: 'w-32 h-20',
};

const iconSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-12 h-12',
  wide: 'w-10 h-10',
};

interface TractorImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  size?: keyof typeof sizeClasses;
  fit?: 'contain' | 'cover';
  bordered?: boolean;
}

export const TractorImage: React.FC<TractorImageProps> = ({
  src,
  alt = 'Trator',
  className,
  size = 'sm',
  fit = 'contain',
  bordered = true,
}) => {
  const imgFit = fit === 'cover' ? 'object-cover' : 'object-contain';
  const frameClass = bordered
    ? 'rounded-lg overflow-hidden border border-gray-200 bg-white'
    : 'rounded-md overflow-hidden bg-transparent';

  if (src) {
    return (
      <div
        className={cn(
          frameClass,
          'flex items-center justify-center shrink-0',
          bordered && fit === 'contain' && 'p-1',
          sizeClasses[size],
          className,
        )}
      >
        <img
          src={src}
          alt={alt}
          className={cn('w-full h-full', imgFit)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        frameClass,
        bordered ? 'bg-gray-50' : 'bg-gray-100',
        'flex items-center justify-center shrink-0',
        sizeClasses[size],
        className,
      )}
    >
      <Tractor className={cn('text-gray-400', iconSizes[size])} />
    </div>
  );
};
