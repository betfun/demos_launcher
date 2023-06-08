import { shell } from 'electron';
import * as lowdb from 'lowdb';
import * as fs from 'fs';
import * as fileSync from 'lowdb/adapters/FileSync';
import * as childProcess from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { LoginType, OrgModel } from '../app/store/orgs/model';
import { ProfileModel } from '../app/store/orgs/model';
import { SupportedBrowsers } from '../app/store/config/model';

export abstract class OsMechanics {

  openExternal(url: string): void {
    shell.openExternal(url);
  }

  getUserName(): string {
    return process.env.username ?? process.env.user ?? os?.userInfo?.()?.username;
  }

  getUserDir(): string {
    return `${process.env.HOME}/.demos_launcher`;
  }

  writeDb(obj: any, fn: string, what: string): void {
    const dir = this.getUserDir();
    const adapter = new fileSync(`${dir}/${fn}`);

    const db = lowdb(adapter);

    db.set(what, obj).write();
  }

  readDb(fn: string, what: string, fullPath: boolean = false): any {
    const dir = this.getUserDir();

    if (!fs.existsSync(dir)) {
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) { throw err; }
      });
    }

    const filePath = fullPath ? fn : `${dir}/${fn}`;
    const adapter = new fileSync(filePath);

    const db = lowdb(adapter);

    return db.get(what).value();
  }

  async runChrome(org: OrgModel,
    browser: SupportedBrowsers,
    profile: ProfileModel,
    useHomepage: boolean): Promise<void> {

    const udir: string = this.getUserDir();
    const dir = `${udir}/Orgs/${org.id}`;

    // TODO: Remove and put "install" when saving the Org
    await this.install(org);

    const innerName = profile.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const loginPage = 'https://clicktologin.herokuapp.com/';

    const siteUser = profile.login.toString();

    const isNonStandardLogin =
      profile.login !== undefined &&
      profile.loginType !== LoginType.standard.toString() &&
      profile.loginType !== LoginType.none.toString();

    const admin = {
      login: org?.administrator?.login ?? '',
      pwd: org?.administrator.pwd ?? ''
    };

    const login = isNonStandardLogin ? admin.login : profile.login;
    const pwd = isNonStandardLogin ? admin.pwd : profile.pwd;
    const site = isNonStandardLogin ? `&siteuser=${siteUser}&site=${profile.loginType}` : '';

    const homepage = `${loginPage}?un=${login}&pw=${pwd}${site}`;

    const browserPath =
      browser === SupportedBrowsers.chromium
        ? '/Applications/Google Chrome Canary.app'
        : '/Applications/Google Chrome.app';

    const runPath = `open -n -a "${browserPath}" \
      --args --user-data-dir=${dir} \
      --profile-directory="${innerName}" \
      --no-first-run \
      --no-default-browser-check`;

    const hp = useHomepage && profile.loginType !== LoginType.none.toString();
    const command = runPath +
      (hp ? ` '${homepage}'` : '');

    this.launchRaw(command);
  }

  async install(org: OrgModel): Promise<void> {

    const userDir: string = this.getUserDir();
    const orgChrome = org.name.replace(/\s/g, '');
    const oldDir = `${userDir}/Orgs/${orgChrome}`;
    const dir = `${userDir}/Orgs/${org.id}`;

    if (fs.existsSync(oldDir)) {
      this.renameDir(oldDir, dir);
    }

    const fn = `${dir}/Local State`;

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
        const profileInnerName = profile.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();

        infoCache[profileInnerName] = {};
        Object.assign(infoCache[profileInnerName], referenceProfile);
        infoCache[profileInnerName].name = profile.name;
      }

      this.writeFile(obj, fn);
    } catch (err) {
      console.log(err);
    }
  }

  deleteOrg(org: OrgModel) {

    const dir = `${this.getUserDir()}/Orgs/${org.id}`;

    try {
      fs.rmdirSync(dir, { recursive: true });
    }
    catch (err) {
      return false;
    }

    return true;
  }

  private launchRaw(command: string): boolean {
    try {
      childProcess.execSync(command, { stdio: 'ignore' });
    }
    catch (err) {
      return false;
    }

    return true;
  }

  private renameDir(oldDir: string, newDir: string): void {
    try {
      fs.renameSync(oldDir, newDir);
    }
    catch (err) {
    }
  }

  private writeFile(obj: any, fn: string): boolean {
    try {
      const dir = path.dirname(fn);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fn, JSON.stringify(obj), 'utf8');
    }
    catch {
      return false;
    }

    return true;
  }

  abstract killall(): void;
  abstract kill(orgId: string): void;
}
