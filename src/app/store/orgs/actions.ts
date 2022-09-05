import { org_model } from './model';

export class OrgsReorder {
  public static readonly type = '[Orgs] Reorder';
  constructor(public updatedList: org_model[]) { }
}

export class OrgSave {
  public static readonly type = '[Orgs] Save Org in db';
  constructor(public payload: org_model) { }
}


export class OrgsLoadAll {
  public static readonly type = '[Orgs] Load all';
  constructor() { }
}

export class OrgDelete {
  public static readonly type = '[Orgs] Delete org';
  constructor(public name: string) { }
}
