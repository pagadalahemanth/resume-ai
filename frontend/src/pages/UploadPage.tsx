import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useApp } from '../App'
import { useFileUpload } from '../hooks/useFileUpload'

export const UploadPage = () => {
  const { user } = useApp()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const { uploadStatus, uploadFile } = useFileUpload({
    onSuccess: (resumeId) => {
      console.log('Upload successful, navigating to analysis with ID:', resumeId);
      navigate(`/analysis/${resumeId}`);
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error(error.message);
    },
    validationRules: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
    }
  })

  const isUploading = uploadStatus.status === 'uploading' || uploadStatus.status === 'processing'
  const uploadProgress = uploadStatus.progress

  // Handle file selection
  const handleFile = async (file: File) => {
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
