import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { IpcRenderer } from 'electron';
import * as fs from 'fs';
import { Config, SupportedBrowsers } from '../../../store/config/model';
import { LoginType, OrgExtensions, OrgsStateModel, OrgModel, ProfileModel } from '../../../store/orgs/model';
import { SalesforceService } from '../sfdc/salesforce.service';

export interface LaunchOptions {
  profile: ProfileModel | null;
  headless: boolean | false;
  useHomepage: boolean | true;
}

const sleep = (waitTimeInMs: number) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  private ipc: IpcRenderer;
  private fs: typeof fs;

  constructor(private store: Store, private sf: SalesforceService) {
    this.ipc = (window as any).require('electron').ipcRenderer;
    this.fs = window.require('fs');
  }

  launch(org: string, opts: LaunchOptions): void {

    const store = this.store.selectSnapshot<OrgsStateModel>(state => state.orgs);
    const globalConfig = this.store.selectSnapshot<Config>(state => state.config);
    const orgObj = store.orgs.find(o => o.name === org);

    const admin: ProfileModel = OrgExtensions.getAdminUser(orgObj);
    opts.profile = opts.profile ?? admin;

    const config = this.localConfig(org);

    const innerName = opts.profile.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const browserPath =
      globalConfig.browser === SupportedBrowsers.chromium
        ? '/Applications/Google Chrome Canary.app'
        : '/Applications/Google Chrome.app';

    const loginPage = globalConfig.useMiddleware ?
      'https://clicktologin.herokuapp.com/' :
      'https://login.salesforce.com/login.jsp';

    const siteUser = opts.profile.login.toString();

    const isNonStandardLogin =
      opts.profile.login !== undefined &&
      opts.profile.loginType !== LoginType.standard.toString() &&
      opts.profile.loginType !== LoginType.none.toString();

    const login =  isNonStandardLogin ? admin.login : opts.profile.login;
    const pwd = isNonStandardLogin ? admin.pwd : opts.profile.pwd;
    const site = isNonStandardLogin ? `&siteuser=${siteUser}&site=${opts.profile.loginType}` : '';

    const homepage = `${loginPage}?un=${login}&pw=${pwd}${site}`;

    const headless = opts.headless ? '-gj' : '';

    const path = `open ${headless} -n -a "${browserPath}" \
      --args --user-data-dir=${config.base}/${config.name}/Chrome \
      --profile-directory="${innerName}" \
      --no-first-run \
      --no-default-browser-check`;

    opts.useHomepage = opts.useHomepage && opts.profile.loginType !== LoginType.none.toString();
    const command = path +
      (opts.useHomepage ? ` '${homepage}'` : '');

    this.ipc.send('launch', command);
  }

  delete(orgName: string) {
    const config = this.localConfig(orgName);
    const command = `rm -rf ${config.base}/${config.name}`;

    this.ipc.send('launch', command);
  }

  kill(org: string): void {
    const orgChrome = org.replace(/\s/g, '');

    try {
      this.ipc.send('launch', `pkill -f '${orgChrome}'`);
    }
    catch (err) {
      // No need to take care of the error
    }
  }

  async install(org: OrgModel, hard: boolean = false): Promise<void> {
    this.kill(org.name);

    await sleep(2000);

    const config = this.localConfig(org.name);

    if (hard) {
      const dir = `${config.base}/${config.name}`;

      try {
        this.fs.rmdirSync(dir, { recursive: true });
      }
      catch { }
    }

    // Install first Chrome profile (Admin)
    const adminProfile: ProfileModel = OrgExtensions.getAdminUser(org);
    this.launch(org.name, {
      profile: adminProfile,
      headless: false,
      useHomepage: false
    });

    await sleep(5000);
    this.kill(org.name);
    await sleep(3000);

    const fn = `${config.base}/${config.name}/Chrome/Local State`;

    try {
      const obj = JSON.parse(this.fs.readFileSync(fn, 'utf8'));
      const infoCache = obj.profile.info_cache;

      const referenceProfile = infoCache[adminProfile.name];

      const newInfoCache = {};

      for (const profile of [adminProfile, ...org.profiles]) {
        newInfoCache[profile.name] = {};
        Object.assign(newInfoCache[profile.name], referenceProfile);
        newInfoCache[profile.name].name = profile.name;
      }

      obj.profile.info_cache = newInfoCache;

      await sleep(3000);

      this.fs.writeFileSync(fn, JSON.stringify(obj), 'utf8');
    } catch (err) {
      console.log(err);
    }
  }


  private localConfig(org: string): { base: string; name: string } {
    const orgChrome = org.replace(/\s/g, '');

    const dir: string = this.ipc.sendSync('getHomeDir');

    const config = {
      base: `${dir}/Orgs`,
      name: orgChrome,
    };

    return config;
  }
}
