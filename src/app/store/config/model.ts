/* eslint-disable no-shadow */

export enum SupportedBrowsers {
  chrome = 'chrome',
  chromium = 'chromium',
}

export interface Config {
  browser: SupportedBrowsers;
  defaultPassword: string;
  useMiddleware: boolean;
}
