import { Injectable } from '@angular/core';
import { Config, SupportedBrowsers } from '../../../store/config/model';
import { IpcRenderer } from 'electron';

@Injectable({
  providedIn: 'root',
})
export class DbConfigService {

  private ipc: IpcRenderer;

  constructor() {
    this.ipc = window.ipc;
  }

  get(): Config {
    return window.electron.config.load() as Config;
  }

  save(payload: Config): void {
    window.electron.config.save(payload);
  }
}
