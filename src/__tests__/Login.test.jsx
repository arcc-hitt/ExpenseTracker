import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../pages/Login';

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
}));

// Mock Redux store
const createMockStore = () => {
  return configureStore({
    reducer: {
      auth: (state = { isLoggedIn: false, token: null, userId: null, isPremium: false }) => state,
    },
  });
};

const renderWithProviders = (component) => {
  const store = createMockStore();
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithProviders(<Login />);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('calls onSwitchToSignUp when sign up link is clicked', async () => {
    const user = userEvent.setup();
    const mockOnSwitchToSignUp = jest.fn();
    renderWithProviders(<Login onSwitchToSignUp={mockOnSwitchToSignUp} />);

    const signUpLink = screen.getByText('Sign up');
    await user.click(signUpLink);

    expect(mockOnSwitchToSignUp).toHaveBeenCalledTimes(1);
  });

  it('calls onForgot when forgot password link is clicked', async () => {
    const user = userEvent.setup();
    const mockOnForgot = jest.fn();
    renderWithProviders(<Login onForgot={mockOnForgot} />);

    const forgotLink = screen.getByText('Forgot password?');
    await user.click(forgotLink);

    expect(mockOnForgot).toHaveBeenCalledTimes(1);
  });
});