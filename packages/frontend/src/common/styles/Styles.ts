import { css as emotionCSS } from '@emotion/css';

import { Theme, theme } from '@/common/styles/Theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CSSObject = Record<string, any>;

type Styles = TemplateStringsArray | CSSObject | ((theme: Theme) => CSSObject);

export const css = (styles: Styles, ...args: Array<CSSObject>) => {
  if (styles instanceof Function) {
    return emotionCSS(styles(theme));
  }

  if (isTemplateString(styles)) {
    return emotionCSS(styles, ...args);
  }

  return emotionCSS(styles);
};

export type { Theme };

const isTemplateString = (
  styles: TemplateStringsArray | CSSObject,
): styles is TemplateStringsArray => {
  return Array.isArray(styles) && 'raw' in styles;
};
