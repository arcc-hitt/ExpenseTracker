import { useState, useEffect } from 'react'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Welcome from './pages/Welcome'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'

export default function App() {
  const [route, setRoute] = useState('signup') // 'signup' | 'login' | 'welcome' | 'forgot'

  useEffect(() => {
    const token = localStorage.getItem('expensetracker_token')
    if (token) setRoute('welcome')
  }, [])

  const handleLoginSuccess = () => setRoute('welcome')
  const handleLogout = () => {
    localStorage.removeItem('expensetracker_token')
    setRoute('login')
  }

  const handleCompleteProfile = () => setRoute('profile')
  const handleProfileUpdated = () => setRoute('welcome')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 relative">
      {/* Top-right logout button for authenticated routes */}
      {(route === 'welcome' || route === 'profile') && (
        <div className="absolute top-6 right-6">
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded">Logout</button>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {route === 'signup' && <SignUp onSwitchToLogin={() => setRoute('login')} />}
          {route === 'login' && (
            <Login onLoginSuccess={handleLoginSuccess} onSwitchToSignUp={() => setRoute('signup')} onForgot={() => setRoute('forgot')} />
          )}
          {route === 'forgot' && <ForgotPassword onBack={() => setRoute('login')} />}
          {route === 'welcome' && <Welcome onLogout={handleLogout} onCompleteProfile={handleCompleteProfile} />}
          {route === 'profile' && <Profile onUpdated={handleProfileUpdated} />}
        </div>
      </div>
    </div>
  )
}
