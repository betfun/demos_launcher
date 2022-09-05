import { org_model, profile_model } from '../orgs/model';

export class OrgsInstallChrome {
  public static readonly type = '[Orgs] Install Chrome';
  constructor(public org: org_model, public hardReset: boolean) { }
}

export class OrgLaunchChrome {
  public static readonly type = '[Orgs] Launch Chrome';
  constructor(public org: org_model, public profile: profile_model) { }
}

export class OrgKillChrome {
  public static readonly type = '[Orgs] Kill Chrome';
  constructor(public org: org_model) { }
}
