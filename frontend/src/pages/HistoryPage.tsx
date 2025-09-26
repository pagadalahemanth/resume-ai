import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

interface Resume {
  id: string;
  fileName: string;
  fileKey: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  reviews?: Array<{
    id: string;
    overallScore: number;
    createdAt: string;
  }>;
}

const HistoryPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        // Single API call - gets files with their latest review data
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/files/files`);
        setResumes(response.data.files || []);
      } catch (err) {
        setError('Failed to fetch resume history');
        console.error('Error fetching resumes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFileIcon = (fileType: string) => {
    const isPDF = fileType === 'application/pdf';
    return (
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        isPDF ? 'bg-red-100' : 'bg-blue-100'
      }`}>
        <svg className={`w-5 h-5 ${isPDF ? 'text-red-600' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      </div>
    );
  };

  const filteredResumes = resumes.filter(resume =>
    resume.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAnalyze = (resumeId: string) => {
    navigate(`/analysis/resume/${resumeId}`);
  };

  const handleDownload = async (resume: Resume) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/files/download/${resume.fileKey}`
      );
      
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = resume.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Simple Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Resumes</h1>
        <p className="text-gray-600 mt-1">{resumes.length} resume{resumes.length !== 1 ? 's' : ''} uploaded</p>
      </div>

      {/* Simple Search */}
      {resumes.length > 0 && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* File List */}
      {filteredResumes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching files' : 'No resumes yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try a different search term' : 'Upload your first resume to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Upload Resume
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredResumes
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(resume.fileType)}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {resume.fileName}
                    </h3>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      {/* <span>{formatFileSize(resume.fileSize)}</span> */}
                      <span>{formatDate(resume.createdAt)}</span>
                      {resume.reviews && resume.reviews.length > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Score: {resume.reviews[0].overallScore}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleAnalyze(resume.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {resume.reviews && resume.reviews.length > 0 ? 'View' : 'Analyze'}
                  </button>
                  <button
                    onClick={() => handleDownload(resume)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M7 21h10" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;