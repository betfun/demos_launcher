import { OrgModel } from './model';

export class OrgsReorder {
  public static readonly type = '[Orgs] Reorder';
  constructor(public updatedList: OrgModel[]) { }
}

export class OrgSave {
  public static readonly type = '[Orgs] Save Org in db';
  constructor(public payload: OrgModel) { }
}

export class UpdateOrgInfos {
  public static readonly type = '[Orgs] Update Org in db';
  constructor(public id: string, public info: {status: string; expiryDate: string}) { }
}

export class OrgsLoadAll {
  public static readonly type = '[Orgs] Load all';
  constructor() { }
}

export class OrgDelete {
  public static readonly type = '[Orgs] Delete org';
  constructor(public org: OrgModel) { }
}
