import { Injectable } from "@angular/core";
import { profile } from "console";
import * as lowdb from "lowdb";

@Injectable({
  providedIn: "root",
})
export class DbService {

  db: any;

  constructor() {
    const FileSync = window.require("lowdb/adapters/FileSync");
    const adapter = new FileSync(process.env['HOME'] + '/db.json');

    this.db = lowdb(adapter);
  }

  async getAdmin(org: string): Promise<any> {
    return await this.db
      .get("orgs")
      .find({ name: org })
      .get("profiles")
      .find({ name: "Admin" })
      .value();
  }

  getOrgs(): any[] {
    return this.db.get("orgs").value();
  }

  async newProfile(org: string, profile: any): Promise<void> {
    // Add a post
    await this.db
      .get("orgs")
      .find({ name: org })
      .get("profiles")
      .push(profile)
      .write();
  }

  async newProfiles(org_name: any, profiles: any[]): Promise<void> {
    // Add a post
    let org = this.db.get("orgs").find({ name: org_name }).get("profiles");

    profiles.forEach((p) => (org = org.push(p)));

    await org.write();
  }

  async delete(org_name: any, profile: any): Promise<void> {
    // Add a post
    await this.db
      .get("orgs")
      .find({ name: org_name })
      .get("profiles")
      .pull(profile)
      .write();
  }
}
