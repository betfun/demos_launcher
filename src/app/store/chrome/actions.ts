import { OrgModel, ProfileModel } from '../orgs/model';

export class OrgsInstallChrome {
  public static readonly type = '[Orgs] Install Chrome';
  constructor(public org: OrgModel, public hardReset: boolean) { }
}

export class OrgLaunchChrome {
  public static readonly type = '[Orgs] Launch Chrome';
  constructor(public org: OrgModel, public profile: ProfileModel | null) { }
}

export class OrgKillChrome {
  public static readonly type = '[Orgs] Kill Chrome';
  constructor(public org: OrgModel) { }
}
