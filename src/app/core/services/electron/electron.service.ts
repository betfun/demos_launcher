import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Config } from '../../../store/config/model';
import { OrgExtensions, OrgModel, ProfileModel } from '../../../store/orgs/model';

export interface LaunchOptions {
  profile: ProfileModel | null;
  useHomepage: boolean | true;
}

const sleep = (waitTimeInMs: number) =>
  new Promise((resolve) => setTimeout(resolve, waitTimeInMs));

@Injectable({
  providedIn: 'root',
})
export class ElectronService {

  constructor(private store: Store) { }

  async launch(org: OrgModel, opts: LaunchOptions): Promise<void> {

    const globalConfig = this.store.selectSnapshot<Config>(state => state.config);

    const admin: ProfileModel = OrgExtensions.getAdminUser(org);
    opts.profile = opts.profile ?? admin;

    // const config = this.localConfig(org);

    // if(!window.electron.chrome.installed(config.dir)){
    //   console.log('Installing');
    //   await this.install(org);
    // }

    // const browserPath =
    //   globalConfig.browser === SupportedBrowsers.chromium
    //     ? '/Applications/Google Chrome Canary.app'
    //     : '/Applications/Google Chrome.app';

    // const loginPage = globalConfig.useMiddleware ?
    //   'https://clicktologin.herokuapp.com/' :
    //   'https://login.salesforce.com/login.jsp';


    window.electron.chrome.launch(org, globalConfig.browser,
      globalConfig.useMiddleware, opts.profile, opts.useHomepage);

    // this.ipc.send('launch', command);
  }

  delete(orgName: OrgModel) {
    window.electron.chrome.delete(orgName);
  }

  kill(org: string): void {
    // const orgChrome = org.replace(/\s/g, '');
    window.electron.chrome.kill(org);
  }

  // async install(org: OrgModel, hard: boolean = false): Promise<void> {

  //   this.kill(org.name);

  //   await sleep(2000);

  //   const config = this.localConfig(org);

  //   if (true) {
  //     // const dir = `${config.base}/${config.name}`;

  //     try {
  //       this.ipc.sendSync('removeDir', config.dir);
  //     }
  //     catch { }
  //   }

  //   const fn = `${config.dir}/Local State`;

  //   // create file
  //   /* eslint-disable @typescript-eslint/naming-convention */
  //   const obj = {
  //     profile: {
  //       info_cache:
  //       {
  //         Admin:
  //         {
  //           active_time: 1684100630.045999,
  //           avatar_icon: 'chrome://theme/IDR_PROFILE_AVATAR_26',
  //           background_apps: false,
  //           force_signin_profile_locked: false,
  //           gaia_given_name: '',
  //           gaia_id: '',
  //           gaia_name: '',
  //           hosted_domain: '',
  //           is_consented_primary_account: false,
  //           is_ephemeral: false,
  //           is_using_default_avatar: true,
  //           is_using_default_name: false,
  //           managed_user_id: '',
  //           metrics_bucket_index: 2,
  //           name: 'Admin',
  //           'signin.with_credential_provider': false,
  //           user_name: ''
  //         }
  //       },
  //     }
  //   };

  //   try {
  //     const infoCache = obj.profile.info_cache;

  //     const referenceProfile = infoCache.Admin;

  //     for (const profile of [...org.profiles]) {
  //       infoCache[profile.name] = {};
  //       Object.assign(infoCache[profile.name], referenceProfile);
  //       infoCache[profile.name].name = profile.name;
  //     }

  //     this.ipc.sendSync('file:write', obj, fn);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
}
