import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

export interface FileValidationRules {
  maxSize: number
  allowedTypes: string[]
}

export interface UploadHookOptions {
  onSuccess?: (key: string) => void
  onError?: (error: Error) => void
  validationRules?: FileValidationRules
}

interface UploadUrlResponse {
  uploadUrl: string
  key: string
}

interface UploadProgress {
  progress: number
  status: 'idle' | 'uploading' | 'processing' | 'error' | 'success'
}

const defaultValidationRules: FileValidationRules = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
}

export const useFileUpload = (options: UploadHookOptions = {}) => {
  const [uploadStatus, setUploadStatus] = useState<UploadProgress>({
    progress: 0,
    status: 'idle'
  })

  const validationRules = {
    ...defaultValidationRules,
    ...options.validationRules
  }

  const validateFile = (file: File): string | null => {
    if (!validationRules.allowedTypes.includes(file.type)) {
      return 'Only PDF and DOCX files are allowed'
    }
    if (file.size > validationRules.maxSize) {
      return `File size must be less than ${validationRules.maxSize / (1024 * 1024)}MB`
    }
    return null
  }

  const uploadFile = async (file: File) => {
    try {
      const validationError = validateFile(file)
      if (validationError) {
        throw new Error(validationError)
      }

      setUploadStatus({ progress: 0, status: 'uploading' })

      console.log('Starting upload process...');
      
      // Step 1: Get presigned URL
      console.log('Getting presigned URL...');
      const { data: { uploadUrl, key } } = await axios.post<UploadUrlResponse>(
        `${import.meta.env.VITE_API_URL}/upload/upload-url`,
        {
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size
        }
      );
      console.log('Got presigned URL:', { uploadUrl, key });

      // Step 2: Upload to S3
      console.log('Uploading to S3...', { contentType: file.type });
      try {
        // Create a fresh instance of axios without default headers
        const axiosInstance = axios.create();
        delete axiosInstance.defaults.headers.common['Authorization'];
        
        console.log('Starting S3 upload with URL:', uploadUrl);
        const uploadResponse = await axiosInstance.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          // Disable any automatic transformations
          transformRequest: [(data) => data],
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0
            console.log('Upload progress:', progress);
            setUploadStatus({ progress, status: 'uploading' })
          }
        });
        console.log('S3 upload response:', uploadResponse);
      } catch (uploadError: any) {
        console.error('S3 upload error:', {
          message: uploadError.message,
          response: uploadError.response?.data,
          status: uploadError.response?.status,
          headers: uploadError.response?.headers,
          requestConfig: {
            headers: uploadError.config?.headers,
            method: uploadError.config?.method,
            url: uploadError.config?.url
          }
        });
        
        // Log the actual file details for debugging
        console.log('File details:', {
          name: file.name,
          type: file.type,
          size: file.size
        });
        
        throw new Error(`S3 upload failed: ${uploadError.message}`);
      }
      console.log('S3 upload complete, notifying backend...');
      setUploadStatus({ progress: 100, status: 'processing' });
      const notifyResponse = await axios.post(`${import.meta.env.VITE_API_URL}/upload/notify-upload`, {
        key,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      if (!notifyResponse.data.resume?.id) {
        throw new Error('Failed to get resume ID from server');
      }
      
      console.log('Backend notification response:', notifyResponse.data);

      setUploadStatus({ progress: 100, status: 'success' });
      const resumeId = notifyResponse.data.resume.id;
      options.onSuccess?.(resumeId);
      toast.success('Resume uploaded successfully!');
    } catch (error: any) {
      console.error('Upload process error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload resume';
      setUploadStatus({ progress: 0, status: 'error' });
      toast.error(errorMessage);
      options.onError?.(error as Error);
    }
  }

  const resetUpload = () => {
    setUploadStatus({ progress: 0, status: 'idle' })
  }

  return {
 
    uploadStatus,
    uploadFile,
    resetUpload
  }
}