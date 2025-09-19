import { useState, useEffect } from 'react'
import axios from 'axios'
import { Document, Page, pdfjs } from 'react-pdf'
import { toast } from 'react-toastify'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface FilePreviewProps {
  fileKey: string
  fileType: string
  className?: string
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileKey,
  fileType,
  className = ''
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setIsLoading(true)
        const { data: { downloadUrl } } = await axios.get(
          `${import.meta.env.VITE_API_URL}/upload/download-url/${fileKey}`
        )
        setPreviewUrl(downloadUrl)
      } catch (error) {
        console.error('Preview error:', error)
        toast.error('Failed to load file preview')
      } finally {
        setIsLoading(false)
      }
    }

    loadPreview()
  }, [fileKey])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!previewUrl) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        Preview not available
      </div>
    )
  }

  // PDF Preview
  if (fileType === 'application/pdf') {
    return (
      <div className={className}>
        <Document
          file={previewUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          onLoadError={(error) => console.error('PDF load error:', error)}
          className="flex flex-col items-center"
        >
          {Array.from(new Array(numPages || 0), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              className="mb-4"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      </div>
    )
  }

  // DOCX Preview (just show a placeholder)
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2">DOCX preview not available</p>
          <p className="mt-1 text-sm">Please download to view the document</p>
        </div>
      </div>
    )
  }

  return null
}