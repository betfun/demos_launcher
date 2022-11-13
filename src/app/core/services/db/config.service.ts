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
    return this.ipc.sendSync('db:read', 'config.json', 'config');
  }

  save(payload: Config): void {
    this.ipc.sendSync('db:write', payload, 'config.json', 'config');
  }
}
