import { Injectable } from '@angular/core';
import * as lowdb from 'lowdb';
import { org_model, profile_model } from '../../../store/orgs/model';
import * as fs from "fs";

@Injectable({
  providedIn: 'root',
})
export class DbService {
  db: any;
  fs: typeof fs;

  constructor() {

    this.fs = window.require("fs");

    const dir = process.env["HOME"] + "/.demos_launcher";
    if (!this.fs.existsSync(dir)) {
      this.fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) throw err;
      });
    }

    const FileSync = window.require('lowdb/adapters/FileSync');
    const adapter = new FileSync(dir + '/db.json');

    this.db = lowdb(adapter);
  }

  newOrg(neworg: org_model): any {
    return this.db.get('orgs').unshift(neworg).write();
  }

  getAdmin(org: string): any {
    return this.db
      .get('orgs')
      .find({ name: org })
      .get('profiles')
      .find({ name: 'Admin' })
      .value();
  }

  getOrgs(): org_model[] {
    return this.db.get('orgs').value();
  }


  newProfiles(org_name: string, profiles: profile_model[]): void {
    let org = this.db
      .get('orgs')
      .find({ name: org_name })
      .get('profiles');

    profiles.forEach((p) => (org = org.push(p)));

    org.write();
  }

  delete(org_name: string, profile: any): void {
    // Add a post
    this.db
      .get('orgs')
      .find({ name: org_name })
      .get('profiles')
      .pull(profile)
      .write();
  }

  delete_org(org_name: string) : any {
    return this.db
      .get('orgs')
      .remove({ name: org_name })
      .write();
  }
}
