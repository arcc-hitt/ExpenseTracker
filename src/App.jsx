import { useMemo, useLayoutEffect, useEffect, useState } from 'react'
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import { useDispatch } from 'react-redux'
import { logout } from './slices/authSlice'
import { useSelector } from 'react-redux'

function ProtectedRoute({ children }) {
  const token = useMemo(() => localStorage.getItem('expensetracker_token'), [])
  if (!token) return <Navigate to="/login" replace />
  return children
}

function ProtectedLayout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const handleLogout = () => {
    localStorage.removeItem('expensetracker_token')
    dispatch(logout())
    navigate('/login', { replace: true })
  }
  return (
    <div className="min-h-screen p-6 relative" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="absolute top-6 right-6">
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded">Logout</button>
      </div>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const isDark = useSelector(state => state.theme.isDark)

  // Validate token on app startup
  useEffect(() => {
    const validateToken = async () => {
      const existingToken = localStorage.getItem('expensetracker_token')
      if (!existingToken) {
        setIsValidating(false)
        setIsAuthenticated(false)
        return
      }

      try {
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
        if (!apiKey) {
          setIsValidating(false)
          setIsAuthenticated(false)
          return
        }

        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: existingToken }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.users && data.users[0]) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem('expensetracker_token')
            dispatch(logout())
            setIsAuthenticated(false)
          }
        } else {
          localStorage.removeItem('expensetracker_token')
          dispatch(logout())
          setIsAuthenticated(false)
        }
      } catch (error) {
        localStorage.removeItem('expensetracker_token')
        dispatch(logout())
        setIsAuthenticated(false)
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [dispatch])

  useLayoutEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  // Show loading while validating token
  if (isValidating) {
    return (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Routes>
        {/* Default redirect based on auth */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />

        {/* Public routes */}
        <Route
          path="/signup"
          element={<SignUp onSwitchToLogin={() => navigate('/login')} />}
        />
        <Route
          path="/login"
          element={<Login onLoginSuccess={() => navigate('/home')} onSwitchToSignUp={() => navigate('/signup')} onForgot={() => navigate('/forgot')} />}
        />
        <Route path="/forgot" element={<ForgotPassword onBack={() => navigate('/login')} />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home onCompleteProfile={() => navigate('/profile')} />} />
          <Route path="/profile" element={<Profile onUpdated={() => navigate('/home')} />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
