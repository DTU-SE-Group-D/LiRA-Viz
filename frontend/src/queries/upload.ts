import { postForm } from './fetch';

export const uploadSurvey = (
  file: File,
  password: string,
  onSuccess: (response: any) => void,
  onError: (error: any) => void,
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  postForm('/upload', formData, onSuccess, onError);
};
