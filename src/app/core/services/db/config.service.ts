import { Injectable } from '@angular/core';
import { Config } from '../../../store/config/model';

@Injectable({
  providedIn: 'root',
})
export class DbConfigService {

  get(): Config {
    return window.electron.config.load() as Config;
  }

  save(payload: Config): void {
    window.electron.config.save(payload);
  }
}
