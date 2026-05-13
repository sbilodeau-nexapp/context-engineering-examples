import { Link } from '@/common/components/button/Link';
import { css } from '@/common/styles/Styles';

export const GlobalErrorBoundary = () => {
  return (
    <main className={container}>
      <h1>Oups, an error occured</h1>

      <Link to={'/'}>Return to Home</Link>
    </main>
  );
};

const container = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 40px;
`;
