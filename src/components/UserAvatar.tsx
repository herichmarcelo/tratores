import React, { useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { cn } from '../utils';

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const sizeClasses = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-20 h-20 text-lg',
};

const iconSizes = {
  sm: 'w-5 h-5',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
};

const getInitials = (nome: string): string => {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

interface UserAvatarProps {
  src?: string | null;
  nome: string;
  size?: keyof typeof sizeClasses;
  editable?: boolean;
  onUpload?: (file: File) => void;
  isUploading?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  nome,
  size = 'md',
  editable = false,
  onUpload,
  isUploading = false,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Formato inválido. Use PNG, JPG ou WEBP.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`A imagem deve ter no máximo ${MAX_SIZE_MB}MB.`);
      return;
    }

    onUpload(file);
    e.target.value = '';
  };

  const content = src ? (
    <img src={src} alt={nome} className="w-full h-full object-cover" />
  ) : (
    <span className="font-semibold">{getInitials(nome)}</span>
  );

  const avatar = (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center shrink-0 relative',
        'bg-gradient-to-br from-primary-600 to-cyan-400 text-white',
        sizeClasses[size],
        editable && 'cursor-pointer group relative',
        className,
      )}
      onClick={editable && !isUploading ? () => inputRef.current?.click() : undefined}
      title={editable ? 'Clique para alterar a foto' : undefined}
    >
      {content}
      {editable && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {isUploading ? (
            <Loader2 className={cn('animate-spin text-white', iconSizes[size])} />
          ) : (
            <Camera className={cn('text-white', iconSizes[size])} />
          )}
        </div>
      )}
      {isUploading && !editable && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <Loader2 className={cn('animate-spin text-white', iconSizes[size])} />
        </div>
      )}
    </div>
  );

  return (
    <>
      {avatar}
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </>
  );
};

interface AvatarUploadFieldProps {
  preview?: string | null;
  nome: string;
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  label?: string;
}

export const AvatarUploadField: React.FC<AvatarUploadFieldProps> = ({
  preview,
  nome,
  onFileSelect,
  isUploading = false,
  label = 'Foto do colaborador',
}) => (
  <div className="flex flex-col items-center gap-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <UserAvatar
      src={preview}
      nome={nome || 'Novo'}
      size="lg"
      editable
      onUpload={onFileSelect}
      isUploading={isUploading}
    />
    <p className="text-xs text-gray-400 text-center">Clique na foto para enviar (PNG, JPG até 5MB)</p>
  </div>
);
