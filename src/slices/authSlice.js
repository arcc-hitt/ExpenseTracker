import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isLoggedIn: false,
    token: null,
    userId: null,
    isPremium: false,
  },
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      state.userId = action.payload.userId;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.token = null;
      state.userId = null;
      state.isPremium = false;
    },
    activatePremium: (state) => {
      state.isPremium = true;
    },
  },
});

export const { login, logout, activatePremium } = authSlice.actions;
export default authSlice.reducer;