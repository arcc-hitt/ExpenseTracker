import { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { z } from 'zod'

export default function Login({ onLoginSuccess, onSwitchToSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [focused, setFocused] = useState({ email: false, password: false })

  const schema = z.object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    try {
      schema.parse({ email, password })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setFieldErrors(err.flatten().fieldErrors)
        return
      }
      setError('Validation failed')
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      const result = await signInWithEmailAndPassword(auth, email, password)
      // Get token and store it
      const token = await result.user.getIdToken()
      localStorage.setItem('expensetracker_token', token)
      onLoginSuccess()
    } catch (err) {
      let message = err.message || 'Login failed'
      if (err.code === 'auth/user-not-found') message = 'No user found with this email'
      if (err.code === 'auth/wrong-password') message = 'Incorrect password'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-lg">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded px-6 sm:px-10 pt-6 pb-8 mb-4">
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Login</h2>
        {error && <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              aria-label="Email"
              className={`shadow-sm border ${focused.email ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'} rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 leading-tight transition duration-150 ease-in-out focus:outline-none`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused((s) => ({ ...s, email: true }))}
              onBlur={() => setFocused((s) => ({ ...s, email: false }))}
              required
            />
            {fieldErrors.email && <p className="text-red-600 text-sm mt-1">{fieldErrors.email[0]}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
            <input
              aria-label="Password"
              className={`shadow-sm border ${focused.password ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'} rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 leading-tight transition duration-150 ease-in-out focus:outline-none`}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused((s) => ({ ...s, password: true }))}
              onBlur={() => setFocused((s) => ({ ...s, password: false }))}
              required
            />
            {fieldErrors.password && <p className="text-red-600 text-sm mt-1">{fieldErrors.password[0]}</p>}
          </div>

          <div className="flex items-center justify-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md w-full disabled:opacity-50" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        </div>
        <div className="text-center mt-3 text-sm text-gray-600 dark:text-gray-300">
        <span>Don't have an account? </span>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            onSwitchToSignUp && onSwitchToSignUp()
          }}
          className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded px-1"
        >
          Sign up
        </a>
      </div>
    </div>
  </div>
  )
}
