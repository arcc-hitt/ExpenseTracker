import { useMemo } from 'react'
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Home from './pages/Home'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'

function ProtectedRoute({ children }) {
  const token = useMemo(() => localStorage.getItem('expensetracker_token'), [])
  if (!token) return <Navigate to="/login" replace />
  return children
}

function ProtectedLayout() {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem('expensetracker_token')
    navigate('/login', { replace: true })
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 relative">
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
  const location = useLocation()
  const token = localStorage.getItem('expensetracker_token')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <Routes>
        {/* Default redirect based on auth */}
        <Route path="/" element={<Navigate to={token ? '/home' : '/login'} replace />} />

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
