import { Link } from '@/common/components/button/Link';
import { css } from '@/common/styles/Styles';

export const UnknownRoute = () => {
  return (
    <main className={container}>
      <h1>Oups, this page does not seem to exists</h1>

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
