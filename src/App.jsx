import { useState, useEffect } from 'react'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Welcome from './pages/Welcome'
import Profile from './pages/Profile'

export default function App() {
  const [route, setRoute] = useState('signup') // 'signup' | 'login' | 'welcome'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-2xl">
        {route === 'signup' && <SignUp onSwitchToLogin={() => setRoute('login')} />}
        {route === 'login' && (
          <Login onLoginSuccess={handleLoginSuccess} onSwitchToSignUp={() => setRoute('signup')} />
        )}
  {route === 'welcome' && <Welcome onLogout={handleLogout} onCompleteProfile={handleCompleteProfile} />}
  {route === 'profile' && <Profile onUpdated={handleProfileUpdated} />}
      </div>
    </div>
  )
}
