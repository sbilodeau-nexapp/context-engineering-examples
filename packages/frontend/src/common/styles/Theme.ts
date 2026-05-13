export const theme = {
  palette: {
    text: {
      primary: 'var(--primaryText)',
      secondary: 'var(--secondaryText)',
      contrast: 'var(--contrastText)',
    },
    background: {
      primary: 'var(--primaryBackground)',
      secondary: 'var(--secondaryBackground)',
      tertiary: 'var(--tertiaryBackground)',
    },
  },
} as const;

export type Theme = typeof theme;
