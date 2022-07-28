import { Injectable } from '@angular/core';
import * as lowdb from 'lowdb';
import { org_model } from '../../../store/orgs/model';
import * as fs from 'fs';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  db: any;
  fs: typeof fs;

  constructor() {

    this.fs = window.require('fs');

    const ipc = (<any>window).require('electron').ipcRenderer;
    const dir: string = ipc.sendSync('getHomeDir');
    if (!this.fs.existsSync(dir)) {
      this.fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) {throw err;}
      });
    }

    const FileSync = window.require('lowdb/adapters/FileSync');
    const adapter = new FileSync(`${dir}/db.json`);

    this.db = lowdb(adapter);
  }

  getOrgs(): org_model[] {
    return this.db.get('orgs').value();
  }

  save(orgs: org_model[]): void {
    this.db.set('orgs', orgs).write();
  }
}
