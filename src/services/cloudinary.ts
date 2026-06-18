interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
}

const trim = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const parseCloudinaryUrl = (url: string): Partial<CloudinaryConfig> | null => {
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) return null;

  return {
    apiKey: match[1],
    apiSecret: match[2],
    cloudName: match[3],
  };
};

const getCloudinaryConfig = (): CloudinaryConfig => {
  const fromUrl = parseCloudinaryUrl(trim(import.meta.env.VITE_CLOUDINARY_URL));

  const cloudName = trim(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) || fromUrl?.cloudName || '';
  const apiKey = trim(import.meta.env.VITE_CLOUDINARY_API_KEY) || fromUrl?.apiKey || '';
  const apiSecret = trim(import.meta.env.VITE_CLOUDINARY_API_SECRET) || fromUrl?.apiSecret || '';
  const uploadPreset = trim(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  if (!cloudName) {
    throw new Error('Cloudinary não configurado. Defina VITE_CLOUDINARY_CLOUD_NAME ou VITE_CLOUDINARY_URL no .env');
  }

  return { cloudName, apiKey, apiSecret, uploadPreset: uploadPreset || undefined };
};

const generateSignature = async (
  params: Record<string, string>,
  apiSecret: string,
): Promise<string> => {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const hash = await crypto.subtle.digest(
    'SHA-1',
    new TextEncoder().encode(sorted + apiSecret),
  );

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const uploadToCloudinary = async (
  file: File,
  folder = 'tratores',
): Promise<string> => {
  const { cloudName, apiKey, apiSecret, uploadPreset } = getCloudinaryConfig();

  const formData = new FormData();
  formData.append('file', file);

  if (uploadPreset) {
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);
  } else if (apiKey && apiSecret) {
    const timestamp = Math.round(Date.now() / 1000).toString();
    const params: Record<string, string> = { folder, timestamp };
    const signature = await generateSignature(params, apiSecret);

    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);
  } else {
    throw new Error(
      'Configure VITE_CLOUDINARY_URL no .env ou crie um upload preset unsigned no Cloudinary.',
    );
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  const data = await response.json();

  if (!response.ok) {
    const message = data.error?.message || 'Falha ao enviar imagem para o Cloudinary';

    if (message.includes('Upload preset not found')) {
      throw new Error(
        'Preset de upload não encontrado. Remova VITE_CLOUDINARY_UPLOAD_PRESET do .env ou crie o preset no Cloudinary.',
      );
    }

    if (message.includes('Invalid API key')) {
      throw new Error(
        'API Key inválida. Reinicie o servidor (npm run dev) após salvar o .env.',
      );
    }

    throw new Error(message);
  }

  if (!data.secure_url) {
    throw new Error('Cloudinary não retornou a URL da imagem');
  }

  return data.secure_url;
};
