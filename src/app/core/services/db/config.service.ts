import { Injectable } from "@angular/core";
import * as lowdb from "lowdb";
import * as fs from "fs";
import { Config, SupportedBrowsers } from "../../../store/config/model";

@Injectable({
  providedIn: "root",
})
export class DbConfigService {
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

    const FileSync = window.require("lowdb/adapters/FileSync");
    const adapter = new FileSync(
      dir + "/config.json"
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
