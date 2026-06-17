export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dmcgufpyk';
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY || '139841258566749';
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_preset'); // Note: You'll need to create an unsigned upload preset in Cloudinary
  formData.append('api_key', apiKey);

  try {
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    }
    throw new Error('Failed to get secure URL from Cloudinary');
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};