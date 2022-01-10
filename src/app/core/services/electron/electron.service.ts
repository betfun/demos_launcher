import { Injectable } from "@angular/core";
import { Store } from "@ngxs/store";
import * as childProcess from "child_process";
import * as fs from "fs";
import * as fse from "fs-extra";
import { Config, SupportedBrowsers } from "../../../store/config/model";
import { OrgsStateModel, profile_model } from "../../../store/orgs/model";

export interface launch_options {
  profile: profile_model | null,
  headless: boolean | false,
  use_homepage: boolean | true
}

const sleep = (waitTimeInMs: number) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

@Injectable({
  providedIn: "root",
})
export class ElectronService {
  childProcess: typeof childProcess;
  fs: typeof fs;
  fse: typeof fse;

  constructor(private store: Store) {
    this.childProcess = window.require("child_process");
    this.fs = window.require("fs");
    this.fse = window.require("fs-extra");
  }

  private local_config(org: string): { orgs_base: string; org_name: string; } {
    const org_chrome = org.replace(/\s/g, "");

    const config = {
      orgs_base: process.env["HOME"] + "/.demos_launcher/Orgs",
      org_name: org_chrome,
    };

    return config;
  }

  // = { profile : null, headless: false, use_homepage: false}
  launch(org: string, opts?: launch_options): void {

    const store = this.store.selectSnapshot<OrgsStateModel>(state => state.orgs);
    const global_config = this.store.selectSnapshot<Config>(state => state.config);
    const org_obj = store.orgs.find(o => o.name === org);

    const admin = org_obj.profiles.find(p => p.name === org_obj.admin);

    opts = opts ?? {
      profile: admin,
      use_homepage: true,
      headless: false,
    };

    const config = this.local_config(org);

    opts.profile.innerName = opts.profile.innerName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const browser_path =
      global_config.browser == SupportedBrowsers.Chromium
        ? "/Applications/Google Chrome Canary.app"
        : "/Applications/Google Chrome.app";

    const homepage = `https://login.salesforce.com/login.jsp?un=${opts.profile.login}&pw=${opts.profile.pwd}`;

    const launch_path = `open -n "${browser_path}" \
      --args --user-data-dir=${config.orgs_base}/${config.org_name}/Chrome \
      --profile-directory="${opts.profile.innerName}" \
      --no-first-run \
      --no-default-browser-check \
      --start-fullscreen`;

    const launch_command =
      launch_path +
      (opts.use_homepage ? ` '${homepage}'` : "") +
      (opts.headless ? " --headless --disable-gpu" : "");

    this.childProcess.execSync(launch_command);
  }

  async kill(org: string): Promise<void> {
    const org_chrome = org.replace(/\s/g, "");

    try {
      this.childProcess.execSync(`pkill -f '${org_chrome}'`, { stdio: 'ignore' });
    }
    catch (err) {
      // No need to take care of the error
    }

    await sleep(2000);
  }

  async install(org: string, profiles: profile_model[]): Promise<void> {
    await this.kill(org);

    const config = this.local_config(org);
    const fn = `${config.orgs_base}/${config.org_name}/Chrome/Local State`;

    for (let i = 1; i < profiles.length; i++) {

      await sleep(5000);

      const profile = profiles[i];

      console.log("install profile: " + profile.name);

      this.launch(org, {
        profile: profile,
        headless: true,
        use_homepage: false
      });

      await sleep(5000);
      await this.kill(org);
    }

    try {
      const obj = JSON.parse(this.fs.readFileSync(fn, "utf8"));
      const infoCache = obj.profile.info_cache;

      for (let i = 1; i < profiles.length; i++) {

        const profile = profiles[i];

        infoCache[profile.innerName] = JSON.parse(
          JSON.stringify(infoCache[profile.innerName])
        );
        infoCache[profile.innerName].name = profile.name;
      }

      this.fs.writeFileSync(fn, JSON.stringify(obj), "utf8");
    } catch (err) {
      console.log(err);
    }
  }

  // async install(org: string, profiles: profile_model[]): Promise<void> {

  //   await this.kill(org);

  //   profiles.forEach(profile =>
  //     this.launch(org, {
  //       profile: profile,
  //       headless: true,
  //       use_homepage: false
  //     })
  //   );

  //   console.log("sleep " + (5 * profiles.length).toString());
  //   await sleep(5000 * profiles.length);

  //   await this.kill(org);

  //   const config = this.local_config(org);
  //   const fn = `${config.orgs_base}/${config.org_name}/Chrome/Local State`;
  //   try {
  //     const obj = JSON.parse(this.fs.readFileSync(fn, "utf8"));
  //     const infoCache = obj.profile.info_cache;

  //     for (let i = 0; i < profiles.length; i++) {
  //       const profile = profiles[i];

  //       infoCache[profile.innerName] = JSON.parse(
  //         JSON.stringify(infoCache[profile.innerName])
  //       );
  //       infoCache[profile.innerName].name = profile.name;
  //     }

  //     this.fs.writeFileSync(fn, JSON.stringify(obj), "utf8");
  //   } catch (err) {
  //     console.error(err);
  //   }

  //   await sleep(2000);
  // }
}
