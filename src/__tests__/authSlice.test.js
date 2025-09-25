import authReducer, { login, logout, activatePremium } from '../slices/authSlice';

describe('Auth Slice', () => {
  const initialState = {
    isLoggedIn: false,
    token: null,
    userId: null,
    isPremium: false,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle login', () => {
    const payload = { token: 'test-token', userId: 'user123' };
    const expectedState = {
      isLoggedIn: true,
      token: 'test-token',
      userId: 'user123',
      isPremium: false,
    };

    expect(authReducer(initialState, login(payload))).toEqual(expectedState);
  });

  it('should handle logout', () => {
    const loggedInState = {
      isLoggedIn: true,
      token: 'test-token',
      userId: 'user123',
      isPremium: true,
    };

    expect(authReducer(loggedInState, logout())).toEqual(initialState);
  });

  it('should handle activatePremium', () => {
    const stateWithUser = {
      isLoggedIn: true,
      token: 'test-token',
      userId: 'user123',
      isPremium: false,
    };

    const expectedState = {
      ...stateWithUser,
      isPremium: true,
    };

    expect(authReducer(stateWithUser, activatePremium())).toEqual(expectedState);
  });
});