import { Injectable } from '@angular/core';
import * as lowdb from 'lowdb';
import { org_model, profile_model } from '../../../store/orgs/model';
import * as fs from 'fs';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  db: any;
  fs: typeof fs;

  constructor() {

    this.fs = window.require('fs');

    const ipc = window.require('electron').ipcRenderer;
    const dir: string = ipc.sendSync('getHomeDir');
    if (!this.fs.existsSync(dir)) {
      this.fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) { throw err; }
      });
    }

    const FileSync = window.require('lowdb/adapters/FileSync');
    const adapter = new FileSync(`${dir}/db.json`);

    this.db = lowdb(adapter);
  }

  getOrgs(): org_model[] {
    const version = this.db.get('version').value();

    const orgs = this.db.get('orgs').value() as org_model[];

    // Migration
    if (version === undefined) {
      for (const org of orgs) {
        const adminProfile = org.profiles.find(p => (p as any).innerName === (org as any).admin ||
          p.name === (org as any).admin);

        if (adminProfile !== undefined) {
          org.profiles = org.profiles.filter(p => (p as any).innerName !== (org as any).admin &&
            p.name !== (org as any).admin);

          org.administrator = {
            login: adminProfile.login,
            pwd: adminProfile.pwd
          };
        }

        // remove innername
        org.profiles =  org.profiles.map(prof => {
          const copy: profile_model = {
            name: prof.name,
            login: prof.login,
            pwd: prof.pwd,
            loginType: prof.loginType ?? 'Standard'
          };
          return copy;
        });

        if (org.id === null || org.id === undefined) {
          org.id = Guid.create().toString();
        }

        // remove old Admin data
        delete (org as any).admin;
      }

      this.save(orgs);
    }

    return orgs;
  }

  save(orgs: org_model[]): void {
    this.db.set('version', 2).write();
    this.db.set('orgs', orgs).write();
  }
}
