import { useState } from 'react'
import { z } from 'zod'

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const schema = z.object({ email: z.string().min(1, 'Email is required').email('Invalid email') })

  const handleSend = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    try {
      schema.parse({ email })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.flatten().fieldErrors.email?.[0] || 'Invalid email')
        return
      }
      setError('Validation failed')
      return
    }

    setLoading(true)
    try {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
      if (!apiKey) throw new Error('Missing API key')

      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
      })

      const json = await res.json()
      if (!res.ok) {
        const code = json?.error?.message || 'UNKNOWN_ERROR'
        let friendly = 'Failed to send password reset email.'
        switch (code) {
          case 'EMAIL_NOT_FOUND':
            friendly = 'No account found for this email.'
            break
          case 'INVALID_EMAIL':
            friendly = 'Invalid email address.'
            break
          default:
            friendly = json?.error?.message || friendly
        }
        setError(friendly)
      } else {
        setMessage('Check your email — we sent a password reset link. Follow the link to reset your password.')
      }
    } catch (err) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-lg">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded px-6 sm:px-10 pt-6 pb-8 mb-4">
          <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Forgot Password</h2>
          {error && <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>}
          {message && <div className="mb-4 text-sm text-green-700 bg-green-100 p-2 rounded">{message}</div>}

          <form onSubmit={handleSend} noValidate>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Enter the email with which you have registered.</label>
              <input
                aria-label="Email"
                className={`shadow-sm border border-gray-200 dark:border-gray-700 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 leading-tight transition duration-150 ease-in-out focus:outline-none`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>

            <div className="flex items-center justify-center">
              <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md w-full disabled:opacity-50" type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Link'}
              </button>
            </div>
          </form>

          <div className="text-center mt-3 text-sm text-gray-600 dark:text-gray-300">
            <a href="#" onClick={(e) => { e.preventDefault(); onBack && onBack() }} className="text-blue-600 dark:text-blue-400 hover:underline">Back to Login</a>
          </div>
        </div>
      </div>
    </div>
  )
}
