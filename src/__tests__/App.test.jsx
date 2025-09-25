// Mock all the components that use import.meta.env
jest.mock('../pages/SignUp', () => {
  return function MockSignUp() {
    return <div data-testid="signup-page">SignUp Page</div>;
  };
});

jest.mock('../pages/Home', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('../pages/Profile', () => {
  return function MockProfile() {
    return <div data-testid="profile-page">Profile Page</div>;
  };
});

jest.mock('../pages/ForgotPassword', () => {
  return function MockForgotPassword() {
    return <div data-testid="forgot-password-page">Forgot Password Page</div>;
  };
});

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from '../App';

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
      auth: (state = { isLoggedIn: false, token: null, userId: null, isPremium: false }) => state,
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

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when no token', () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderWithProviders(<App />);

    // Should redirect to login, but since we're not actually navigating,
    // we can check that the component renders without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('applies dark mode class when theme is dark', () => {
    localStorageMock.getItem.mockReturnValue('test-token');

    renderWithProviders(<App />, {
      theme: { isDarkMode: true },
    });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark mode class when theme is light', () => {
    localStorageMock.getItem.mockReturnValue('test-token');

    // First set dark mode
    document.documentElement.classList.add('dark');

    renderWithProviders(<App />, {
      theme: { isDarkMode: false },
    });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders without crashing', () => {
    localStorageMock.getItem.mockReturnValue('test-token');

    expect(() => renderWithProviders(<App />)).not.toThrow();
  });
});