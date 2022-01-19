import { org_model } from "./model";

export class OrgLaunchChrome {
  public static readonly type = "[Orgs] Launch Chrome";
  constructor(public payload: any) { }
}

export class OrgSave {
  public static readonly type = "[Orgs] Save Org in db";
  constructor(public payload: org_model) { }
}


export class OrgsLoadAll {
  public static readonly type = "[Orgs] Load all";
  constructor() { }
}

export class OrgDelete {
  public static readonly type = "[Orgs] Delete org";
  constructor(public name: string) { }
}

export class OrgDeleteProfile {
  public static readonly type = "[Orgs] Delete profile";
  constructor(public name: string, public profile : any) { }
}
