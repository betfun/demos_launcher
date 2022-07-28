import { Injectable } from '@angular/core';
import * as lowdb from 'lowdb';
import * as fs from 'fs';
import { Config, SupportedBrowsers } from '../../../store/config/model';
import { IpcRenderer } from 'electron';
@Injectable({
  providedIn: 'root',
})
export class DbConfigService {
  db: any;
  fs: typeof fs;
  adapter: any;

  private ipc: IpcRenderer;

  constructor() {

    this.ipc = window.require('electron').ipcRenderer;
    this.fs = window.require('fs');

    const dir: string = this.ipc.sendSync('getHomeDir');
    if (!this.fs.existsSync(dir)) {
      this.fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {throw err;}
      });
    }

    const fileSync = window.require('lowdb/adapters/FileSync');
    this.adapter = new fileSync(`${dir}/config.json`);

    this.db = lowdb(this.adapter);
    this.db.defaults = {
      defaultPassword: '',
      browser: SupportedBrowsers.chrome,
      useMiddleware: true
    };
  }

  get(): Config {
    return this.db.get('config').value();
  }

  save(payload: Config): void {
    this.db.set('config', payload).write();
  }
}
