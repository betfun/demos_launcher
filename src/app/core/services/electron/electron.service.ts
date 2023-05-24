import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { IpcRenderer } from 'electron';
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

  constructor(private store: Store, private sf: SalesforceService) {
    this.ipc = window.ipc;
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

    const login = isNonStandardLogin ? admin.login : opts.profile.login;
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
    // const command = `rm -rf ${config.base}/${config.name}`;

    const dir = `${config.base}/${config.name}`;

    this.ipc.send('removeDir', dir);
    // this.ipc.send('launch', command);
  }

  kill(org: string): void {
    const orgChrome = org.replace(/\s/g, '');

    try {
      this.ipc.sendSync('launch', `pkill -f '${orgChrome}'`);
    }
    catch (err) {
      // No need to take care of the error
    }
  }

  async install(org: OrgModel, hard: boolean = false): Promise<void> {

    this.kill(org.name);

    await sleep(2000);

    const config = this.localConfig(org.name);

    if (true) {
      const dir = `${config.base}/${config.name}`;

      try {
        this.ipc.sendSync('removeDir', dir);
      }
      catch { }
    }

    const fn = `${config.base}/${config.name}/Chrome/Local State`;

    // create file
    /* eslint-disable @typescript-eslint/naming-convention */
    const obj = {
      profile: {
        info_cache:
        {
          Admin:
          {
            active_time: 1684100630.045999,
            avatar_icon: 'chrome://theme/IDR_PROFILE_AVATAR_26',
            background_apps: false,
            force_signin_profile_locked: false,
            gaia_given_name: '',
            gaia_id: '',
            gaia_name: '',
            hosted_domain: '',
            is_consented_primary_account: false,
            is_ephemeral: false,
            is_using_default_avatar: true,
            is_using_default_name: false,
            managed_user_id: '',
            metrics_bucket_index: 2,
            name: 'Admin',
            'signin.with_credential_provider': false,
            user_name: ''
          }
        },
      }
    };

    try {
      const infoCache = obj.profile.info_cache;

      const referenceProfile = infoCache.Admin;

      for (const profile of [...org.profiles]) {
        infoCache[profile.name] = {};
        Object.assign(infoCache[profile.name], referenceProfile);
        infoCache[profile.name].name = profile.name;
      }

      console.log(infoCache);

      this.ipc.sendSync('file:write', obj, fn);
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
