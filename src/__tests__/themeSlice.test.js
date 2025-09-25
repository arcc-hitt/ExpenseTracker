import themeReducer, { toggleTheme } from '../slices/themeSlice';

describe('Theme Slice', () => {
  const initialState = {
    isDark: false,
  };

  it('should return the initial state', () => {
    expect(themeReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle toggleTheme from light to dark', () => {
    const expectedState = {
      isDark: true,
    };

    expect(themeReducer(initialState, toggleTheme())).toEqual(expectedState);
  });

  it('should handle toggleTheme from dark to light', () => {
    const darkState = {
      isDark: true,
    };

    expect(themeReducer(darkState, toggleTheme())).toEqual(initialState);
  });
});