import React, { useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { cn } from '../utils';

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

interface ImageUploadProps {
  preview?: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  isUploading?: boolean;
  label?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  preview,
  onFileSelect,
  onClear,
  isUploading = false,
  label = 'Foto do Trator',
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert('Formato inválido. Use PNG, JPG ou WEBP.');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`A imagem deve ter no máximo ${MAX_SIZE_MB}MB.`);
      return;
    }

    onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
      />

      {preview ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={preview}
            alt="Pré-visualização"
            className="w-full h-full object-contain"
          />
          {!isUploading && (
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/90 border border-gray-200 text-gray-600 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            'w-full h-40 rounded-lg border-2 border-dashed border-gray-300',
            'flex flex-col items-center justify-center gap-2 text-gray-500',
            'hover:border-primary-400 hover:text-primary-600 transition-colors',
            isUploading && 'opacity-60 cursor-not-allowed',
          )}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          ) : (
            <>
              <Camera className="w-8 h-8" />
              <span className="text-sm font-medium">Clique para enviar ou arraste a foto</span>
              <span className="text-xs text-gray-400">PNG, JPG até {MAX_SIZE_MB}MB</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
