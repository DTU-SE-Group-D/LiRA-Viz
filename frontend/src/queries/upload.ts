import { postForm } from './fetch';

/**
 * Uploads a survey to the backend.
 *
 * @param file the zip file
 * @param password the password (to prevent unauthorized uploads)
 * @param onSuccess the callback on success
 * @param onError the callback on error
 *
 * @author Kerbourc'h
 */
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
