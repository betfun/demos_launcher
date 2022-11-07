export enum LoginType {
  standard = 'Standard',
  none = 'None'
}

export interface ProfileModel {
  name: string;
  login: string;
  pwd: string;
  loginType: string;
}

export interface OrgModel {
  id: string;
  name: string;
  description: string;
  domain: string;
  administrator: { login: string; pwd: string };
  profiles: ProfileModel[];
}

export class OrgExtensions
{
  static getAdminUser(org: OrgModel): ProfileModel {
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
  orgs: OrgModel[];
  loadingMessage: string;
}

