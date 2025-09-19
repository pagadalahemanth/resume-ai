import { createBrowserRouter } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <UploadPage />
  },
  {
    path: '/analysis/:resumeId',
    element: <AnalysisPage />
  }
]);