// Mock Modal component
jest.mock('../components/Modal', () => {
  return function MockModal({ children, onClose }) {
    return (
      <div data-testid="modal">
        {children}
        <button onClick={onClose} data-testid="modal-close">Close</button>
      </div>
    );
  };
});

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Home from '../pages/Home';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { isLoggedIn: true, token: 'test-token', userId: 'user123', isPremium: false }) => state,
      theme: (state = { isDarkMode: false }) => state,
      expenses: (state = { expenses: [], totalAmount: 0 }) => state,
      ...initialState,
    },
  });
};

const renderWithProviders = (component, initialState) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('test-token');
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: 'expense-id-123' }),
    });
  });

  it('renders loading state initially', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders expense form when loaded', async () => {
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Daily Expenses')).toBeInTheDocument();
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
    });
  });

  it('shows validation errors for empty expense form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Enter a valid amount (> 0)')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Select a category')).toBeInTheDocument();
    });
  });

  it('adds expense successfully', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Home />);

    await waitFor(() => {
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    });

    const amountInput = screen.getByLabelText('Amount');
    const descInput = screen.getByLabelText('Description');
    const categorySelect = screen.getByLabelText('Category');
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(amountInput, '50.00');
    await user.type(descInput, 'Test expense');
    await user.selectOptions(categorySelect, 'Food');
    await user.click(addButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/user123/expenses.json?auth=test-token'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            amount: 50,
            desc: 'Test expense',
            category: 'Food',
            ts: expect.any(Number),
          }),
        })
      );
    });
  });

  it('displays expenses list', () => {
    const mockExpenses = [
      {
        id: '1',
        amount: 25.50,
        desc: 'Lunch',
        category: 'Food',
        ts: Date.now(),
      },
    ];

    renderWithProviders(<Home />, {
      expenses: { expenses: mockExpenses, totalAmount: 25.50 },
    });

    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('₹ 25.50')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
  });

  it('shows no expenses message when list is empty', () => {
    renderWithProviders(<Home />, {
      expenses: { expenses: [], totalAmount: 0 },
    });

    expect(screen.getByText('No expenses added yet.')).toBeInTheDocument();
  });
});