import { useState } from 'react'
import { auth, database } from '../firebase'
import { updateProfile } from 'firebase/auth'
import { ref, set } from 'firebase/database'

export default function Profile({ onUpdated }) {
  const user = auth.currentUser
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [phone, setPhone] = useState('')
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (user) {
        await updateProfile(user, { displayName, photoURL: photoUrl })
        await set(ref(database, `users/${user.uid}/profile`), {
          displayName,
          phone,
          photoUrl,
          updatedAt: Date.now(),
        })
      }
      onUpdated && onUpdated()
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded px-6 pt-6 pb-8 mb-4">
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Complete your profile</h2>
        {error && <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>}
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full name</label>
            <input className="shadow-sm border border-gray-200 dark:border-gray-700 rounded w-full py-2 px-3" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Photo URL</label>
            <input className="shadow-sm border border-gray-200 dark:border-gray-700 rounded w-full py-2 px-3" type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://example.com/photo.jpg" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone</label>
            <input className="shadow-sm border border-gray-200 dark:border-gray-700 rounded w-full py-2 px-3" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="flex items-center justify-center">
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md w-full disabled:opacity-50" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
