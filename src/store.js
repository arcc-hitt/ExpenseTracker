import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import expensesReducer from './slices/expensesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expensesReducer,
  },
});