import { createSlice } from '@reduxjs/toolkit'

// Key used to persist theme preference
const STORAGE_KEY = 'expensetracker_pref_dark'

function readInitialPreference() {
	// Default false (light). Attempt localStorage & media query gracefully.
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (stored === 'true') return true
		if (stored === 'false') return false
	} catch (_) { /* ignore storage errors (e.g., tests, SSR) */ }
	try {
		if (typeof window !== 'undefined' && window.matchMedia) {
			return window.matchMedia('(prefers-color-scheme: dark)').matches
		}
	} catch (_) { /* ignore */ }
	return false
}

const themeSlice = createSlice({
	name: 'theme',
	initialState: {
		isDark: readInitialPreference(),
	},
	reducers: {
		toggleTheme: (state) => {
			state.isDark = !state.isDark
			try { localStorage.setItem(STORAGE_KEY, String(state.isDark)) } catch (_) { /* ignore */ }
		},
		setDark: (state, action) => {
			state.isDark = !!action.payload
			try { localStorage.setItem(STORAGE_KEY, String(state.isDark)) } catch (_) { /* ignore */ }
		},
	},
})

export const { toggleTheme, setDark } = themeSlice.actions
export default themeSlice.reducer
