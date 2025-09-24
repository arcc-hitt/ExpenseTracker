import { createSlice } from '@reduxjs/toolkit';

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    expenses: [],
  },
  reducers: {
    addExpense: (state, action) => {
      state.expenses.unshift(action.payload); // Add to beginning
    },
    setExpenses: (state, action) => {
      state.expenses = action.payload;
    },
    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter(exp => exp.id !== action.payload);
    },
    editExpense: (state, action) => {
      const index = state.expenses.findIndex(exp => exp.id === action.payload.id);
      if (index !== -1) {
        state.expenses[index] = action.payload;
      }
    },
  },
});

export const { addExpense, setExpenses, deleteExpense, editExpense } = expensesSlice.actions;
export default expensesSlice.reducer;