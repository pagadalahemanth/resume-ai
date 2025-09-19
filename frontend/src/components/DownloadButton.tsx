import { useState } from 'react'
import axios from 'axios'

interface DownloadButtonProps {
  fileKey: string
  fileName?: string
  className?: string
  onDownloadStart?: () => void
  onDownloadComplete?: () => void
  onError?: (error: Error) => void
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  fileKey,
  fileName = 'resume',
  className = '',
  onDownloadStart,
  onDownloadComplete,
  onError
}) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      onDownloadStart?.()

      // Get download URL
      const { data: { downloadUrl } } = await axios.get(
        `${import.meta.env.VITE_API_URL}/upload/download-url/${fileKey}`
      )

      // Download the file
      const response = await axios.get(downloadUrl, {
        responseType: 'blob'
      })

      // Create a blob and download it
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      onDownloadComplete?.()
    } catch (error) {
      console.error('Download error:', error)
      onError?.(error as Error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium 
                 rounded-md text-white bg-primary-600 hover:bg-primary-700 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isDownloading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Downloading...
        </>
      ) : (
        <>
          <svg className="-ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Download Resume
        </>
      )}
    </button>
  )
}