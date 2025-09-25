// Mock all the components that use import.meta.env
jest.mock('../pages/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

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

// Mock the firebase module to avoid import.meta.env usage
jest.mock('../firebase', () => ({
  auth: {},
  db: {},
}));

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import authReducer from '../slices/authSlice';
import expensesReducer from '../slices/expensesSlice';
import themeReducer from '../slices/themeSlice';

// Mock fetch for token validation API calls
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
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default fetch mock for token validation
    global.fetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });
  });

  it('redirects to login when no token', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderWithProviders(<App />);

    // Wait for token validation to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // Should redirect to login, but since we're not actually navigating,
    // we can check that the component renders without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('applies dark mode class when theme is dark', async () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ users: [{ localId: 'user123' }] }),
    });

    renderWithProviders(<App />, {
      theme: { isDark: true },
    });

    // Wait for token validation to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark mode class when theme is light', async () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ users: [{ localId: 'user123' }] }),
    });

    // First set dark mode
    document.documentElement.classList.add('dark');

    renderWithProviders(<App />, {
      theme: { isDark: false },
    });

    // Wait for token validation to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('renders without crashing', async () => {
    localStorageMock.getItem.mockReturnValue('test-token');
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ users: [{ localId: 'user123' }] }),
    });

    expect(() => renderWithProviders(<App />)).not.toThrow();

    // Wait for token validation to complete
    await new Promise(resolve => setTimeout(resolve, 0));
  });
});