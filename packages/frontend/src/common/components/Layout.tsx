import { Outlet } from 'react-router';

import { Link } from '@/common/components/button/Link';
import { ThemeToggleButton } from '@/common/components/ThemeToggleButton';
import { css, Theme } from '@/common/styles/Styles';

export const Layout = () => {
  return (
    <div className={container}>
      <header className={header}>
        <h1 className={title}>Vite + React</h1>

        <div className={links}>
          <Link to={'/count'}>Count</Link>
          <Link to={'/locale'}>Translation</Link>
          <Link to={'/'}>Hello World</Link>
        </div>

        <ThemeToggleButton />
      </header>

      <div className={mainContent}>
        <Outlet />
      </div>
    </div>
  );
};

const container = css((theme: Theme) => ({
  height: '100vh',
  backgroundColor: theme.palette.background.primary,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
}));

const mainContent = css({
  display: 'flex',
  flexDirection: 'column',
  margin: '40px',
  gap: '30px',
  height: 300,
  flex: 1,
});

const title = css((theme: Theme) => ({
  color: theme.palette.text.primary,
  fontSize: 30,
  fontWeight: 600,
}));

const links = css`
  display: flex;
  gap: 16px;
  flex: 1;
`;

const header = css(
  (theme: Theme) => `
  background-color: ${theme.palette.background.tertiary};
  padding: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 40px;
`,
);
