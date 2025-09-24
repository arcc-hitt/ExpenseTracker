import { useState, useEffect } from 'react'
import { auth, database, storage } from '../firebase'
import { updateProfile } from 'firebase/auth'
import { ref, set } from 'firebase/database'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { z } from 'zod'

export default function Profile({ onUpdated }) {
  const user = auth.currentUser
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [phone, setPhone] = useState('')
  const [photoUrl, setPhotoUrl] = useState(user?.photoURL || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [focused, setFocused] = useState({ displayName: false, photoUrl: false, phone: false })
  const [initialLoading, setInitialLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [localPreview, setLocalPreview] = useState(photoUrl || '')

  const ProfileSchema = z
    .object({
      displayName: z.string().min(1, 'Full name is required'),
      photoUrl: z.string().url('Photo URL must be a valid URL').optional().or(z.literal('')),
      phone: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine((val) => val === undefined || val === '' || /^[+0-9\-\s()]{6,20}$/.test(val), {
          message: 'Phone number is invalid',
        }),
    })

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    // Validate with Zod
    try {
      ProfileSchema.parse({ displayName, photoUrl, phone })
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

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    // preview locally
    const url = URL.createObjectURL(file)
    setLocalPreview(url)

    // upload to Firebase Storage
    const userId = auth.currentUser?.uid
    if (!userId) return
    const storagePath = `users/${userId}/profile_${Date.now()}_${file.name}`
    const sRef = storageRef(storage, storagePath)
    const uploadTask = uploadBytesResumable(sRef, file)
    setUploading(true)
    setUploadProgress(0)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        setUploadProgress(percent)
      },
      (err) => {
        console.error('Upload failed', err)
        setUploading(false)
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
        setPhotoUrl(downloadUrl)
        setUploading(false)
        setUploadProgress(100)
      }
    )
  }

  // Load previously saved profile from Realtime Database using idToken
  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      setInitialLoading(true)
      try {
        const idToken = localStorage.getItem('expensetracker_token')
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
        const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL
        if (!idToken || !apiKey || !dbUrl) {
          setInitialLoading(false)
          return
        }

        // Lookup account to get UID
        const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        })

        if (!lookupRes.ok) {
          // token might be expired or invalid
          setInitialLoading(false)
          return
        }

        const lookupJson = await lookupRes.json()
        const uid = lookupJson?.users?.[0]?.localId
        if (!uid) {
          setInitialLoading(false)
          return
        }

        // Fetch profile from Realtime Database
        const profileUrl = `${dbUrl.replace(/\/$/, '')}/users/${uid}/profile.json?auth=${idToken}`
        const profileRes = await fetch(profileUrl)
        if (!profileRes.ok) {
          setInitialLoading(false)
          return
        }
        const profileData = await profileRes.json()
        if (mounted && profileData) {
          if (profileData.displayName) setDisplayName(profileData.displayName)
          if (profileData.photoUrl) setPhotoUrl(profileData.photoUrl)
          if (profileData.phone) setPhone(profileData.phone)
        }
      } catch (err) {
        // ignore silently, keep initialLoading false
        console.error('Failed to load profile', err)
      } finally {
        if (mounted) setInitialLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-lg">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded px-6 sm:px-10 pt-6 pb-8 mb-4">
        <h2 className="text-center text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Complete your profile</h2>
        {error && <div className="mb-4 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>}
        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Full name</label>
            <input
              aria-label="Full name"
              className={`shadow-sm border ${focused.displayName ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'} rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 leading-tight transition duration-150 ease-in-out focus:outline-none`}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onFocus={() => setFocused((s) => ({ ...s, displayName: true }))}
              onBlur={() => setFocused((s) => ({ ...s, displayName: false }))}
            />
            {fieldErrors.displayName && <p className="text-red-600 text-sm mt-1">{fieldErrors.displayName[0]}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Upload photo</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {localPreview ? (
                <img src={localPreview} alt="preview" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">No preview</div>
              )}
            </div>
            {uploading && <p className="text-sm text-gray-600 mt-2">Uploading: {uploadProgress}%</p>}
            <p className="mt-2 text-sm text-gray-500">Or paste an image URL below</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone</label>
            <input
              aria-label="Phone"
              className={`shadow-sm border ${focused.phone ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700'} rounded w-full py-2 px-3 text-gray-700 dark:text-gray-100 leading-tight transition duration-150 ease-in-out focus:outline-none`}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onFocus={() => setFocused((s) => ({ ...s, phone: true }))}
              onBlur={() => setFocused((s) => ({ ...s, phone: false }))}
            />
            {fieldErrors.phone && <p className="text-red-600 text-sm mt-1">{fieldErrors.phone[0]}</p>}
          </div>

          <div className="flex items-center justify-center">
            <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md w-full disabled:opacity-50" type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}
