import { useTranslation } from 'react-i18next';

import { Button } from '@/common/components/button/Button';
import { css } from '@/common/styles/Styles';

export const ChangeLocaleButton = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className={container}>
      <h4>{t('testLanguage')}</h4>

      <div className={controls}>
        <Button onClick={() => i18n.changeLanguage('fr')}>Français</Button>
        <Button onClick={() => i18n.changeLanguage('en')}>English</Button>
      </div>
    </div>
  );
};

const container = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  '& > h4': {
    fontSize: '20px',
  },
});

const controls = css({
  display: 'flex',
  gap: '8px',
});
