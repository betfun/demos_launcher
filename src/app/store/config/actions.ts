import { Config } from './model';

export class SaveConfig {
  public static readonly type = '[Config] Save config';
  constructor(public payload: Config) {}
}

export class GetConfig {
  public static readonly type = '[Config] Get config';
  constructor() {}
}
