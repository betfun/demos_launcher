import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import { DbService } from '..';

const sleep = (waitTimeInMs: number) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));


@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  fse: typeof fse;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor(private dbService: DbService) {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;

      // If you wan to use remote object, pleanse set enableRemoteModule to true in main.ts
      // this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
      this.fse = window.require('fs-extra');
    }
  }
  
  async launch(org: string, profile?: {name: string, login: string, pwd: string})  : Promise<void>{
    // const org = "Dassault Peer Cert";

    if(profile === undefined){
      profile = await this.dbService.getAdmin(org);
    }
    const org_chrome = org.replace(/\s/g, "");

    const config = {
      orgs_base: '/Users/dappiano/Devs/Orgs',
      org_name: org_chrome,
    };
    profile.name = profile.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // const profile = "Admin";

    // open -n /Applications/chromium.app --args --user-data-dir=/Users/dappiano/Devs/Orgs/Dassault/Chrome --profile-directory="Admin"  --no-first-run --load-extension="/Users/dappiano/Devs/chrome_ext"
    const homepage = `https://login.salesforce.com/login.jsp?un=${profile.login}&pw=${profile.pwd}`;

    // const path_ext = `${config.orgs_base}/${config.org_name}/Profiles/${profile.name}`;
    // const launch_path = `open -n "/Applications/Google Chrome Canary.app" --args --user-data-dir=${config.orgs_base}/${config.org_name}/Chrome --profile-directory="${profile}" --no-first-run --no-default-browser-check --load-extension="${path_ext}"`;
    const launch_path = `open -n "/Applications/Google Chrome Canary.app" --args --user-data-dir=${config.orgs_base}/${config.org_name}/Chrome --profile-directory="${profile.name}" --no-first-run --no-default-browser-check '${homepage}'`;

    console.log(launch_path);

    this.childProcess.execSync(launch_path);
  }

  async start_chromium(org: string, profile: string, withExt = true) : Promise<void>{
    const org_chrome = org.replace(/\s/g, "");

    const config = {
      orgs_base: '/Users/dappiano/Devs/Orgs',
      org_name: org_chrome,
    };

    const path_ext = `${config.orgs_base}/${config.org_name}/Profiles/${profile}`;
    const launch_path = `open -n "/Applications/Google Chrome Canary.app" --args --user-data-dir=${config.orgs_base}/${config.org_name}/Chrome --profile-directory="${profile}" --no-first-run --no-default-browser-check`;

    console.log(launch_path);

    const launch_command = launch_path + (withExt ? ` --load-extension="${path_ext}"` : "");
    this.childProcess.execSync(launch_command);

    await sleep(1000);
  }

  async install(org: string, profiles: {name: string}[]) : Promise<void>{

    const org_chrome = org.replace(/\s/g, "");

    const config = {
      orgs_base: '/Users/dappiano/Devs/Orgs',
      org_name: org_chrome,
    };

    const fn = `${config.orgs_base}/${config.org_name}/Chrome/Local State`;

    // Start all Chromium instances to create profiles
    for (let i = 0; i < profiles.length; i++) {

      const profile = profiles[i];
      profile.name = profile.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      this.start_chromium(org, profile.name, false);

      await sleep(2000);

      this.kill_all_chromium();
    }

    await sleep(2000);

    try {
      const obj = JSON.parse(this.fs.readFileSync(fn, 'utf8'));
      const infoCache = obj.profile.info_cache;

      for (let i = 0; i < profiles.length; i++) {

        const profile = profiles[i];

        // Install ext s
        // console.log("Install ExT");
        // const path_base = "/Users/dappiano/Devs/chrome_ext";
        // const path_dest = `${config.orgs_base}/${config.org_name}/Profiles/${profile.name}`;
        // this.fse.copySync(path_base, path_dest);

        // const manifest_file = path_dest + '/manifest.json';
        // var ext_setup = JSON.parse(this.fs.readFileSync(manifest_file, 'utf8'));
        // const homepage = `https://login.salesforce.com/login.jsp?un=${profile.login}&pw=${profile.pwd}`;
        // ext_setup.name = "Davide Extension - " + profile.name;
        // ext_setup.chrome_settings_overrides.homepage = homepage;
        // ext_setup.chrome_settings_overrides.startup_pages = [homepage];
        // this.fs.writeFileSync(manifest_file, JSON.stringify(ext_setup), 'utf8');

        infoCache[profile.name] = JSON.parse(JSON.stringify(infoCache[profile.name]));
        infoCache[profile.name].name = profile.name;
      }

      await sleep(2000);

      this.fs.writeFileSync(fn, JSON.stringify(obj), 'utf8');
      console.log("JSON data is saved.");
    } catch (err) {
      console.error(err);
    }

    await sleep(2000);
  }

  async kill_all_chromium(): Promise<void> {
    try {
      this.childProcess.execSync("killall \"Google Chrome Canary\"", { stdio: 'ignore' });
    } finally {
      await sleep(1000);
    }
  }

}
