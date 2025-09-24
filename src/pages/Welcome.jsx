import { useEffect, useState } from 'react'

export default function Welcome({ onLogout, onCompleteProfile }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

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
        const uid = lookupJson?.users?.[0]?.localId
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
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => onCompleteProfile && onCompleteProfile()} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Edit profile</button>
              <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">Logout</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Your profile is incomplete. Please complete your profile to get the best experience.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => onCompleteProfile && onCompleteProfile()} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">Complete profile</button>
              <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">Logout</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
