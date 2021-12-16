import { Injectable } from "@angular/core";
import * as lowdb from "lowdb";
import { org_model, profile_model } from "../../../store/orgs/model";

@Injectable({
  providedIn: "root",
})
export class DbService {
  db: any;

  constructor() {
    const FileSync = window.require("lowdb/adapters/FileSync");
    const adapter = new FileSync(process.env["HOME"] + "/db.json");

    this.db = lowdb(adapter);

    this.migrate();
  }

  migrate(): void {
    const version = this.db.get("version").value();
    console.log(version);

    if (version == "1") {
      const orgs = this.db.get("orgs").value();

      for (let i = 0; i < orgs.length; i++) {
        const c_org = orgs[i];
        const profiles = c_org.profiles;
        for (let j = 0; j < profiles.length; j++) {
          profiles[j].innerName = profiles[j].name;
        }
      }

      this.db.set("orgs", orgs).set("version", 2).write();
      console.log(orgs);
    }
  }

  newOrg(neworg: org_model): any {
    return this.db.get("orgs").unshift(neworg).write();
  }

  getAdmin(org: string): any {
    return this.db
      .get("orgs")
      .find({ name: org })
      .get("profiles")
      .find({ name: "Admin" })
      .value();
  }

  getOrgs(): any[] {
    return this.db.get("orgs").value();
  }


  newProfiles(org_name: string, profiles: profile_model[]): void {
    let org = this.db
      .get("orgs")
      .find({ name: org_name })
      .get("profiles");

    profiles.forEach((p) => (org = org.push(p)));

    org.write();
  }

  delete(org_name: string, profile: any): void {
    // Add a post
    this.db
      .get("orgs")
      .find({ name: org_name })
      .get("profiles")
      .pull(profile)
      .write();
  }

  delete_org(org_name: string) : any {
    return this.db
      .get("orgs")
      .remove({ name: org_name })
      .write();
  }
}
