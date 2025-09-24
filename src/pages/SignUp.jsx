import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'

// Read Firebase config from Vite environment variables (VITE_ prefix)
// Create a .env file at the project root with these keys (see README for steps)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase app and auth
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [focused, setFocused] = useState({ email: false, password: false, confirmPassword: false })
  // custom show/hide toggles (overlay) so icon is visible in dark mode
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // password rule checks for realtime UI
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  // Zod schema for validation
  // stronger password policy: min 8, upper, lower, number, special char
  const SignUpSchema = z
    .object({
      email: z.string().min(1, 'Email is required').email('Invalid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: "Passwords don't match",
    })

  useEffect(() => {
    // Warn early if any config is missing
    const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k)
    if (missing.length) {
      setError(
        `Firebase config missing: ${missing.join(', ')}. Add them to your .env and restart the dev server.`,
      )
      console.error('Missing Firebase config keys:', missing)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validate with Zod
    try {
      SignUpSchema.parse({ email, password, confirmPassword })
    } catch (err) {
      if (err instanceof z.ZodError) {
        const flattened = err.flatten()
        // flattened.fieldErrors is an object like { email: ['...'], password: ['...'] }
        setFieldErrors(flattened.fieldErrors)
        return
      }
      setError('Validation failed')
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log('User has successfully signed up')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFieldErrors({})
    } catch (err) {
      // Map firebase errors to friendly messages
      let message = err.message || 'Failed to create account'
      if (err.code === 'auth/email-already-in-use') message = 'Email is already in use'
      if (err.code === 'auth/invalid-email') message = 'Invalid email address'
      if (err.code === 'auth/weak-password') message = 'Password is too weak'
      if (err.code === 'auth/configuration-not-found') {
        message =
          'Authentication configuration not found. Make sure you have enabled Email/Password sign-in in the Firebase console (Authentication → Sign-in method), and that your VITE_FIREBASE_API_KEY and projectId match the registered web app. After updating .env, restart the dev server.'
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-lg">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded px-6 sm:px-10 pt-6 pb-8 mb-4">
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">SignUp</h2>
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
            <input
              aria-label="Email"
              className={`shadow-sm border ${focused.email ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'} rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 leading-tight transition duration-150 ease-in-out focus:outline-none`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused((s) => ({ ...s, email: true }))}
              onBlur={() => setFocused((s) => ({ ...s, email: false }))}
              autoComplete="email"
              required
            />
            {fieldErrors.email && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
            <div className="relative">
            <input
              aria-label="Password"
              className={`shadow-sm border ${focused.password ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'} rounded w-full py-2 px-3 pr-10 text-gray-700 dark:text-gray-100 leading-tight transition duration-150 ease-in-out focus:outline-none`}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused((s) => ({ ...s, password: true }))}
              onBlur={() => setFocused((s) => ({ ...s, password: false }))}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {fieldErrors.password && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.password[0]}</p>
            )}
            </div>

            {/* Password requirement checklist */}
            <ul className="mt-3 grid grid-cols-2 gap-1 text-sm">
              <li className={`flex items-center ${passwordChecks.length ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="w-5 inline-flex justify-center">{passwordChecks.length ? '✓' : '•'}</span>
                <span>At least 8 characters</span>
              </li>
              <li className={`flex items-center ${passwordChecks.upper ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="w-5 inline-flex justify-center">{passwordChecks.upper ? '✓' : '•'}</span>
                <span>One uppercase letter (A–Z)</span>
              </li>
              <li className={`flex items-center ${passwordChecks.lower ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="w-5 inline-flex justify-center">{passwordChecks.lower ? '✓' : '•'}</span>
                <span>One lowercase letter (a–z)</span>
              </li>
              <li className={`flex items-center ${passwordChecks.number ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="w-5 inline-flex justify-center">{passwordChecks.number ? '✓' : '•'}</span>
                <span>One number (0–9)</span>
              </li>
              <li className={`flex items-center ${passwordChecks.special ? 'text-green-600' : 'text-gray-500'}`}>
                <span className="w-5 inline-flex justify-center">{passwordChecks.special ? '✓' : '•'}</span>
                <span>One special character (e.g. !@#$%)</span>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Confirm Password</label>
            <div className="relative">
            <input
              aria-label="Confirm Password"
              className={`shadow-sm border ${focused.confirmPassword ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'} rounded w-full py-2 px-3 pr-10 text-gray-700 dark:text-gray-100 leading-tight transition duration-150 ease-in-out focus:outline-none`}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocused((s) => ({ ...s, confirmPassword: true }))}
              onBlur={() => setFocused((s) => ({ ...s, confirmPassword: false }))}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
            {fieldErrors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.confirmPassword[0]}</p>
            )}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md w-full disabled:opacity-50 transition-shadow shadow-sm hover:shadow-md"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
      <div className="text-center">
        <button className="bg-green-50 border border-green-200 text-green-800 text-sm py-2 px-4 rounded w-full">Have an account? Login</button>
      </div>
    </div>
  </div>
  )
}
