import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../App'
import axios from 'axios'

export const AuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useApp()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      console.error('Authentication error:', error)
      // Show error message to user
      setTimeout(() => navigate('/login'), 3000)
      return
    }

    if (token) {
      // Store token
      localStorage.setItem('auth_token', token)
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Get user data
      const fetchUser = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/status`)
          setUser(response.data.user)
          navigate('/')
        } catch (error) {
          console.error('Failed to fetch user:', error)
          localStorage.removeItem('auth_token')
          delete axios.defaults.headers.common['Authorization']
          setTimeout(() => navigate('/login'), 3000)
        }
      }

      fetchUser()
    } else {
      setTimeout(() => navigate('/login'), 3000)
    }
  }, [searchParams, navigate, setUser])

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Completing login...
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  )
}

export default AuthCallback