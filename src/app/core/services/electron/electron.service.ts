import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { IpcRenderer } from 'electron';
import * as fs from 'fs';
import { Config, SupportedBrowsers } from '../../../store/config/model';
import { OrgExtensions, OrgsStateModel, profile_model } from '../../../store/orgs/model';

export interface LaunchOptions {
  profile: profile_model | null;
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

  constructor(private store: Store) {
    this.ipc = (window as any).require('electron').ipcRenderer;
    this.fs = window.require('fs');
  }

  launch(org: string, opts?: LaunchOptions): void {

    const store = this.store.selectSnapshot<OrgsStateModel>(state => state.orgs);
    const globalConfig = this.store.selectSnapshot<Config>(state => state.config);
    const orgObj = store.orgs.find(o => o.name === org);

    const admin: profile_model = OrgExtensions.getAdminUser(orgObj);

    opts = opts ?? {
      profile: admin,
      useHomepage: true,
      headless: false,
    };

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


    // // TODO : Repoace with community
    // if(opts.profile.login !== undefined && opts.profile.loginType !== 'Standard') {
    //   loginPage  = org_obj.domain + '/' + opts.profile.loginType;
    // }

    const siteUser = opts.profile.login.toString();

    let login = opts.profile.login;
    let pwd = opts.profile.pwd;

    if (opts.profile.login !== undefined && opts.profile.loginType !== 'Standard') {
      login = admin.login;
      pwd = admin.pwd;
    }
    const site = (opts.profile.login !== undefined && opts.profile.loginType !== 'Standard') ?
      `&siteuser=${siteUser}&site=${opts.profile.loginType}` : '';

    const homepage = `${loginPage}?un=${login}&pw=${pwd}`;

    const path = `open -j -n "${browserPath}" \
      --args --user-data-dir=${config.base}/${config.name}/Chrome \
      --profile-directory="${innerName}" \
      --no-first-run \
      --no-default-browser-check`;

    const command = path +
      (opts.useHomepage ? ` '${homepage}'` : '') +
      (opts.headless ? '  --window-position=0,0 --window-size=1,1' : '');

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

  async install(org: string, profiles: profile_model[]): Promise<void> {
    this.kill(org);

    await sleep(2000);

    const config = this.localConfig(org);
    const dir = `${config.base}/${config.name}`;
    this.fs.rmdirSync(dir, { recursive: true });

    // Install first Chrome profile
    const adminProfile = profiles[0];

    console.log('install profile: ' + adminProfile.name);

    this.launch(org, {
      profile: adminProfile,
      headless: false,
      useHomepage: false
    });

    await sleep(5000);

    this.kill(org);

    await sleep(3000);

    const fn = `${config.base}/${config.name}/Chrome/Local State`;

    try {
      const obj = JSON.parse(this.fs.readFileSync(fn, 'utf8'));
      const infoCache = obj.profile.info_cache;

      const referenceProfile = infoCache[profiles[0].name];

      const newInfoCache = {};

      for (const profile of profiles) {
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
      base: `${dir}/.demos_launcher/Orgs`,
      name: orgChrome,
    };

    return config;
  }
}
