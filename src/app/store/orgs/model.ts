export enum LoginType {
  standard = 'Standard'
}

export interface profile_model {
  name: string;
  login: string;
  pwd: string;
  loginType: string;
}

export interface org_model {
  id: string;
  name: string;
  description: string;
  domain: string;
  administrator: { login: string; pwd: string };
  profiles: profile_model[];
}

export class OrgExtensions
{
  static getAdminUser(org: org_model): profile_model {
    return {
      login: org.administrator.login,
      pwd: org.administrator.pwd,
      name: 'Admin',
      loginType: LoginType.standard
    };
  }
}

export interface OrgsStateModel {
  version: number;
  orgs: org_model[];
  loadingMessage: string;
}

