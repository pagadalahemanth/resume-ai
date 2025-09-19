import { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import 'react-toastify/dist/ReactToastify.css'
import UploadPage from './pages/UploadPage'
import AnalysisPage from './pages/AnalysisPage'

// Types
interface User {
  id: string
  email: string
  name: string | null
  picture: string | null
  isAdmin: boolean
}

interface AppContextType {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}

// Create Context
export const AppContext = createContext<AppContextType | undefined>(undefined)

// Custom hook for using AppContext
export const useApp = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

// Navbar Component
const Navbar = () => {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  const handleAuth = async () => {
    if (user) {
      await logout()
      navigate('/')
    } else {
      navigate('/login')
    }
  }

  return (
    <nav className="bg-white shadow-lg dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">📄</span>
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                Resume AI
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  to="/history" 
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white
                           flex items-center space-x-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>History</span>
                </Link>

                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white
                             flex items-center space-x-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Admin</span>
                  </Link>
                )}

                <div className="flex items-center space-x-3">
                  {user.picture && (
                    <img 
                      src={user.picture} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border-2 border-primary-500"
                    />
                  )}
                  <button
                    onClick={handleAuth}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white
                             flex items-center space-x-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={handleAuth}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md
                         flex items-center space-x-2 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// Page Components
import LoginPage from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'

const Review = () => (
  <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-3xl font-bold mb-6">Resume Review</h1>
    {/* Review component will go here */}
  </div>
)

const History = () => (
  <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-3xl font-bold mb-6">Review History</h1>
    {/* History component will go here */}
  </div>
)

const Admin = () => (
  <div className="max-w-4xl mx-auto p-6">
    <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
    {/* Admin component will go here */}
  </div>
)

// Main App Component
function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          throw new Error('No token')
        }

        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/status`)
        setUser(response.data.user)
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
        localStorage.removeItem('auth_token')
        delete axios.defaults.headers.common['Authorization']
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ user, loading, setUser, logout }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="pt-6">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={user ? <UploadPage /> : <Navigate to="/login" />} />
            <Route path="/review" element={user ? <Review /> : <Navigate to="/login" />} />
<Route path="/analysis/resume/:resumeId" element={user ? <AnalysisPage /> : <Navigate to="/login" />} />
            <Route path="/history" element={user ? <History /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.isAdmin ? <Admin /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </AppContext.Provider>
  )
}

export default App
