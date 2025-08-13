import { createContext, useContext, useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import 'react-toastify/dist/ReactToastify.css'

// Types
interface User {
  id: string
  email: string
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
            <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
              Resume AI
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Link to="/history" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  History
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Admin
                  </Link>
                )}
              </>
            )}
            <button
              onClick={handleAuth}
              className="btn-primary"
            >
              {user ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

// Page Components
import UploadPage from './pages/UploadPage'

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
        const response = await axios.get('/api/auth/status')
        setUser(response.data.user)
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
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
            <Route path="/" element={<UploadPage />} />
            <Route path="/review" element={<Review />} />
            <Route path="/history" element={user ? <History /> : <Navigate to="/" />} />
            <Route path="/admin" element={user?.isAdmin ? <Admin /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </AppContext.Provider>
  )
}

export default App
