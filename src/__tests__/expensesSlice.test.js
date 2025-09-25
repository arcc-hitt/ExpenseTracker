import expensesReducer, {
  addExpense,
  editExpense,
  deleteExpense,
  setExpenses,
  clearExpenses
} from '../slices/expensesSlice';

describe('Expenses Slice', () => {
  const initialState = {
    expenses: [],
  };

  it('should return the initial state', () => {
    expect(expensesReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle addExpense', () => {
    const expense = {
      id: '1',
      amount: 100,
      description: 'Test expense',
      category: 'Food',
      date: '2024-01-01',
    };

    const expectedState = {
      expenses: [expense],
    };

    expect(expensesReducer(initialState, addExpense(expense))).toEqual(expectedState);
  });

  it('should handle editExpense', () => {
    const initialStateWithExpense = {
      expenses: [{
        id: '1',
        amount: 100,
        description: 'Test expense',
        category: 'Food',
        date: '2024-01-01',
      }],
    };

    const updatedExpense = {
      id: '1',
      amount: 150,
      description: 'Updated expense',
      category: 'Transport',
      date: '2024-01-01',
    };

    const expectedState = {
      expenses: [updatedExpense],
    };

    expect(expensesReducer(initialStateWithExpense, editExpense(updatedExpense))).toEqual(expectedState);
  });

  it('should handle deleteExpense', () => {
    const initialStateWithExpense = {
      expenses: [{
        id: '1',
        amount: 100,
        description: 'Test expense',
        category: 'Food',
        date: '2024-01-01',
      }],
    };

    expect(expensesReducer(initialStateWithExpense, deleteExpense('1'))).toEqual(initialState);
  });

  it('should handle setExpenses', () => {
    const expenses = [
      { id: '1', amount: 50, description: 'Expense 1', category: 'Food', date: '2024-01-01' },
      { id: '2', amount: 75, description: 'Expense 2', category: 'Transport', date: '2024-01-02' },
    ];

    const expectedState = {
      expenses,
    };

    expect(expensesReducer(initialState, setExpenses(expenses))).toEqual(expectedState);
  });
});