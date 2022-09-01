export interface profile_model {
  name: string;
  login: string;
  pwd: string;
  loginType: string;
}

export class org_model {
  id: string;
  name: string;
  description: string;
  domain: string;
  administrator: { login: string; pwd: string };
  profiles: profile_model[];

  constructor(ref: Partial<org_model>) {
    this.profiles = [];

    this.id = ref.id;
    this.name = ref.name;

    for (const profile in ref.profiles) {
      if (Object.prototype.hasOwnProperty.call(ref.profiles, profile)) {
        const element = ref.profiles[profile];
        this.profiles.push(element);
      }
    }
    // Object.assign(this, ref);
  }
}

export class OrgExtensions // OrgHelper.getAdminUser(org : org_model){
  {
    static getAdminUser(org: org_model): profile_model {
      return {
        login:org.administrator.login,
        pwd: org.administrator.pwd,
        name: 'Admin',
        loginType: 'Standard'
      };
    }
}

export interface OrgsStateModel {
  version: number;
  orgs: org_model[];
  loading: boolean;
}

