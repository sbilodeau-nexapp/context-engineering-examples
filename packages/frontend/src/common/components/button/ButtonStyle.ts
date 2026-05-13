import { css } from '@emotion/css';

import { theme } from '@/common/styles/Theme';

export const buttonStyle = css`
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: ${theme.palette.text.contrast};
  background-color: ${theme.palette.background.secondary};
  cursor: pointer;
  transition: border-color 0.25s;

  &:hover {
    border-color: #646cff;
  }
  &:focus,
  &:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
`;
