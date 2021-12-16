import { Injectable } from "@angular/core";
import * as lowdb from "lowdb";
import { Config, SupportedBrowsers } from "../../../store/config/model";

@Injectable({
  providedIn: "root",
})
export class DbConfigService {
  db: any;

  constructor() {
    const FileSync = window.require("lowdb/adapters/FileSync");
    const adapter = new FileSync(
      process.env["HOME"] + "/.demos_launcher/config.json"
    );

    this.db = lowdb(adapter);
    this.db.defaults = {
      defaultPassword: "",
      browser: SupportedBrowsers.Chrome,
    };

    // };
  }

  get(): Config {
    return this.db.get('config').value();
  }

  save(payload: Config): void {
    this.db.set('config', payload).write();
  }
}
