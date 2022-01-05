export interface profile_model {
  name: string;
  innerName: string;
  login: string;
  pwd: string
}

export class org_model {
  name: string;
  description: string;
  domain: string;
  admin: string;
  profiles: profile_model[];

  constructor(ref: Partial<org_model>) {
    Object.assign(this, ref);
  }
}

export class OrgHelper {
  static getAdmin(org: org_model): profile_model {
    try{    return org.profiles.find(p => p.name === org.admin);
    }
    catch{
      return {
        name: '',
        innerName: '',
        login: '',
        pwd: ''
      };
    }
  }
}

export interface OrgsStateModel {
  // version: number,
  orgs: org_model[];
}
