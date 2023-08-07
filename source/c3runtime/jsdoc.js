/**
 * @typedef {{
 *  app: {
 *    id: string;
 *  };
 *  browser: {
 *    lang: string;
 *  };
 *  i18n: {
 *    lang: string;
 *    tld: string;
 *  };
 *  payload?: string;
 * }} Environment
 */

/**
 * @typedef {{
 *  type: string,
 *  isMobile: () => boolean,
 *  isTablet: () => boolean,
 *  isDesktop: () => boolean,
 *  isTV: () => boolean,
 * }} DeviceInfo
 */
