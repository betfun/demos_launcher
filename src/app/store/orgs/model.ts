export interface profile_model {
  name: string;
  innerName: string;
  login: string;
  pwd: string
}

export interface org_model {
  name: string;
  description: string;
  domain: string;
  admin: string;
  profiles: profile_model[];
}

export class OrgHelper {
  static getAdmin(org : org_model): profile_model {
    return org.profiles.find(p => p.name === org.admin);
  }
}

export interface OrgsStateModel {
  // version: number,
  orgs: org_model[];
}
