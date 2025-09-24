import { useEffect, useState } from 'react'

export default function Home({ onLogout, onCompleteProfile }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userMeta, setUserMeta] = useState(null) // { email, emailVerified }
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState(null)
  const [sendError, setSendError] = useState(null)
  // Local-only Daily Expenses state
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState('')
  const [expErrors, setExpErrors] = useState({})
  const [expenses, setExpenses] = useState([])

  useEffect(() => {
    let mounted = true
    const loadProfile = async () => {
      setLoading(true)
      try {
        const idToken = localStorage.getItem('expensetracker_token')
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
        const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL
        if (!idToken || !apiKey || !dbUrl) {
          setLoading(false)
          return
        }

        const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        })
        if (!lookupRes.ok) {
          setLoading(false)
          return
        }
        const lookupJson = await lookupRes.json()
        const userRec = lookupJson?.users?.[0]
        const uid = userRec?.localId
        if (userRec && mounted) {
          setUserMeta({ email: userRec.email, emailVerified: !!userRec.emailVerified })
        }
        if (!uid) {
          setLoading(false)
          return
        }

        const profileUrl = `${dbUrl.replace(/\/$/, '')}/users/${uid}/profile.json?auth=${idToken}`
        const profileRes = await fetch(profileUrl)
        if (!profileRes.ok) {
          setLoading(false)
          return
        }

        const profileData = await profileRes.json()
        if (mounted) setProfile(profileData)
      } catch (err) {
        console.error('Failed to load profile', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()
    return () => (mounted = false)
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-10 pb-12">
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-100">Welcome to Expense Tracker</h1>

        {loading ? (
          <p className="text-gray-600 dark:text-gray-300 mb-6">Loading profile…</p>
        ) : profile ? (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-4 mb-4">
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600">👤</div>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{profile.displayName || 'No name provided'}</h2>
            <p className="text-gray-600 dark:text-gray-300">{profile.phone || 'No phone provided'}</p>
            <div className="mt-6">
              {/* Full-width message / error banners */}
              {message && (
                <div className="mb-4 text-sm text-green-800 bg-green-100 px-4 py-3 rounded text-center">{message}</div>
              )}
              {sendError && (
                <div className="mb-4 text-sm text-red-800 bg-red-100 px-4 py-3 rounded text-center">{sendError}</div>
              )}

              <div className="flex items-center justify-center gap-4">
                {userMeta && !userMeta.emailVerified && (
                  <button
                    onClick={async () => {
                      setSendError(null)
                      setMessage(null)
                      setSending(true)
                      try {
                        const idToken = localStorage.getItem('expensetracker_token')
                        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
                        if (!idToken || !apiKey) throw new Error('Missing auth token or API key. Please sign out and sign in again.')
                        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ requestType: 'VERIFY_EMAIL', idToken }),
                        })
                        const json = await res.json()
                        if (!res.ok) {
                          const code = json?.error?.message || 'UNKNOWN_ERROR'
                          let friendly = 'Failed to send verification email.'
                          switch (code) {
                            case 'INVALID_ID_TOKEN':
                            case 'INVALID_TOKEN':
                              friendly = 'Your session is invalid or expired. Please log out and sign in again.'
                              break
                            case 'USER_NOT_FOUND':
                              friendly = 'No user account found. Please sign up first.'
                              break
                            case 'MISSING_ID_TOKEN':
                              friendly = 'Authentication token missing. Please sign out and sign in again.'
                              break
                            default:
                              friendly = json?.error?.message || friendly
                          }
                          setSendError(friendly)
                        } else {
                          setMessage('Check your email — you should receive a verification link shortly. Click it to verify.')
                        }
                      } catch (err) {
                        setSendError(err.message || 'Network error while sending verification email')
                      } finally {
                        setSending(false)
                      }
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded"
                    disabled={sending}
                  >
                    {sending ? 'Sending…' : 'Verify email'}
                  </button>
                )}

                <button onClick={() => onCompleteProfile && onCompleteProfile()} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded">Edit profile</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Your profile is incomplete. Please complete your profile to get the best experience.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => onCompleteProfile && onCompleteProfile()} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Complete profile</button>
            </div>
          </>
        )}

        {/* Daily Expenses section (local-only) */}
        {!loading && (
          <div className="mt-8 text-left">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Daily Expenses</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const errors = {}
                const value = parseFloat(String(amount).replace(/,/g, ''))
                if (!amount || isNaN(value) || value <= 0) errors.amount = 'Enter a valid amount (> 0)'
                if (!desc || desc.trim().length === 0) errors.desc = 'Description is required'
                if (!category) errors.category = 'Select a category'
                setExpErrors(errors)
                if (Object.keys(errors).length > 0) return

                const item = {
                  id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
                  amount: Number(value.toFixed(2)),
                  desc: desc.trim(),
                  category,
                  ts: Date.now(),
                }
                setExpenses((prev) => [item, ...prev])
                setAmount('')
                setDesc('')
                setCategory('')
              }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
              noValidate
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded border border-gray-200 dark:border-gray-700 py-2 px-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {expErrors.amount && <p className="text-red-600 text-sm mt-1">{expErrors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Lunch at cafe"
                  className="w-full rounded border border-gray-200 dark:border-gray-700 py-2 px-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                {expErrors.desc && <p className="text-red-600 text-sm mt-1">{expErrors.desc}</p>}
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded border border-gray-200 dark:border-gray-700 py-2 px-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Select</option>
                    <option value="Food">Food</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Salary">Salary</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Other">Other</option>
                  </select>
                  {expErrors.category && <p className="text-red-600 text-sm mt-1">{expErrors.category}</p>}
                </div>
                <button type="submit" className="self-end bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded h-10">Add</button>
              </div>
            </form>

            {/* List */}
            <div className="mt-6">
              {expenses.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">No expenses added yet.</p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.map((ex) => (
                    <li key={ex.id} className="py-3 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-gray-800 dark:text-gray-100 font-medium">{ex.desc}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(ex.ts).toLocaleString()} • {ex.category}</p>
                      </div>
                      <div className="text-right font-semibold text-gray-800 dark:text-gray-100">₹ {ex.amount.toFixed(2)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
