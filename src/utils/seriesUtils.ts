import { nanosystemApiClient } from "../lib/axios";

export const downloadNanosystem = async (id: string) => {
  try {
    const response = await nanosystemApiClient.get('/nanosystem/download-nanosystem', {
      responseType: 'blob',
      params: { id }
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', id);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}; 