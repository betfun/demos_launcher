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
  info: {
    status: string;
    expiryDate: string;
  };
}

export class OrgModelDTO {
  id: string;
  name: string;
  administrator: { login: string; pwd: string };
  profiles: ProfileModel[];

  static fromModelView(org: OrgModel): OrgModelDTO {
    console.log(org);
    const dto = new OrgModelDTO();
    dto.administrator = {
      login: org.administrator?.login ?? '',
      pwd: org.administrator?.pwd ?? ''
    };
    dto.profiles = [];
    Object.assign(dto.profiles, org.profiles);
    dto.id = org.id;
    dto.name = org.name;

    return dto;
  }
}

export class OrgExtensions
{
  static getAdminUser(org: OrgModel | undefined): ProfileModel {
    return {
      login: org?.administrator?.login ?? '',
      pwd: org?.administrator.pwd ?? '',
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

