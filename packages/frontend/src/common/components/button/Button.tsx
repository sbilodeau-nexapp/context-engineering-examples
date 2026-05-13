import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

import { buttonStyle } from '@/common/components/button/ButtonStyle';

export const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button {...props} className={clsx(buttonStyle, props.className)} />;
};
