import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useApp } from '../App'

// Types
interface UploadUrlResponse {
  uploadUrl: string
  key: string
}

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const UploadPage = () => {
  const { user } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // File validation
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only PDF and DOCX files are allowed'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB'
    }
    return null
  }

  // Upload process
  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      // Step 1: Get presigned URL
      const { data: { uploadUrl, key } } = await axios.post<UploadUrlResponse>(
        '/api/upload-url',
        {
          fileName: file.name,
          contentType: file.type
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      // Step 2: Upload to S3
      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0
          setUploadProgress(progress)
        }
      })

      // Step 3: Notify backend about successful upload
      await axios.post('/api/notify-upload', { key })

      toast.success('Resume uploaded successfully!')
      navigate(`/review?key=${key}`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload resume. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle file selection
  const handleFile = async (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }
    await uploadFile(file)
  }

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      await handleFile(file)
    }
  }, [])

  // Click upload handler
  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // File input change handler
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold mb-4">Please login to upload your resume</h2>
        <p className="text-gray-600 dark:text-gray-400">
          You need to be logged in to use this feature
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' 
            : 'border-gray-300 dark:border-gray-700'
          }
          transition-colors duration-200
        `}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleChange}
        />

        <div className="space-y-4">
          <div className="text-4xl mb-4">
            📄
          </div>
          <h3 className="text-xl font-semibold">
            {isDragging ? 'Drop your resume here' : 'Upload your resume'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Drag and drop your resume or click to browse
          </p>
          <button
            onClick={handleClick}
            disabled={isUploading}
            className="btn-primary mt-4"
          >
            Select File
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supported formats: PDF, DOCX (Max 10MB)
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm font-medium">
                Uploading... {uploadProgress}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadPage
