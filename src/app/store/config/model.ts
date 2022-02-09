export enum SupportedBrowsers {
  Chrome = "chrome",
  Chromium = "chromium",
}

export interface Config {
  browser: SupportedBrowsers;
  defaultPassword: string;
  useMiddleware: boolean
}
