import clsx from 'clsx';
import { ComponentProps } from 'react';
import { Link as RouterLink } from 'react-router';

import { buttonStyle } from '@/common/components/button/ButtonStyle';
import { css } from '@/common/styles/Styles';

export const Link = (props: ComponentProps<typeof RouterLink>) => {
  return (
    <RouterLink
      {...props}
      className={clsx(buttonStyle, link, props.className)}
    />
  );
};

const link = css`
  display: block;
  text-decoration: none;
`;
