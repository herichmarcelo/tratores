import React from 'react';
import { Tractor } from 'lucide-react';
import { cn } from '../utils';

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
};

const iconSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

interface TractorImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  size?: keyof typeof sizeClasses;
}

export const TractorImage: React.FC<TractorImageProps> = ({
  src,
  alt = 'Trator',
  className,
  size = 'sm',
}) => {
  if (src) {
    return (
      <div
        className={cn(
          'rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center p-1',
          sizeClasses[size],
          className,
        )}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center',
        sizeClasses[size],
        className,
      )}
    >
      <Tractor className={cn('text-gray-400', iconSizes[size])} />
    </div>
  );
};
