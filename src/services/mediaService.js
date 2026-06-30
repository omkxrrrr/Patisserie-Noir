import { apiPost } from '../api/client';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const mediaService = {
  async upload(file, purpose = 'general') {
    const base64Data = await fileToBase64(file);
    return apiPost('uploadImage', { base64Data, mimeType: file.type, fileName: file.name, purpose });
  }
};
