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
import authReducer from '../slices/authSlice';
import expensesReducer from '../slices/expensesSlice';
import themeReducer from '../slices/themeSlice';

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
      auth: authReducer,
      theme: themeReducer,
      expenses: expensesReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (component, initialState = {}) => {
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
    // Mock all fetch calls in sequence - these should match the actual API calls
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: [{ localId: 'user123', email: 'test@example.com', emailVerified: true }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ displayName: 'Test User', phone: '1234567890', photoUrl: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null), // No expenses initially
      });
  });

  it('renders profile incomplete message initially', () => {
    renderWithProviders(<Home />);
    expect(screen.getByText('Your profile is incomplete. Please complete your profile to get the best experience.')).toBeInTheDocument();
  });

  it('renders expense form when profile loads', async () => {
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
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses:')).toBeInTheDocument();
  });

  it('shows no expenses message when list is empty', () => {
    renderWithProviders(<Home />, {
      expenses: { expenses: [], totalAmount: 0 },
    });

    expect(screen.getByText('No expenses added yet.')).toBeInTheDocument();
  });
});