export interface profile_model {
  name: string;
  innerName: string;
  login: string;
  pwd: string;
  loginType: string;
}

export class org_model {
  id: string;
  name: string;
  description: string;
  domain: string;
  admin: string;
  profiles: profile_model[];

  constructor(ref: Partial<org_model>) {
    this.profiles = [];
    Object.assign(this, ref);
  }
}

export class OrgHelper {
  static getAdmin(org: org_model): profile_model {
    const empty = {
      name: '',
      innerName: 'admin',
      login: '',
      pwd: '',
      loginType: 'Standard'
    };

    if(org.admin === undefined){
      org.admin = 'admin';
    }

    try{
      const profile = org.profiles.find(p => p.innerName === org.admin);
      if(profile === undefined){
        org.profiles.unshift(empty);
        return empty;
      }
      return profile;
    }
    catch{
      return empty;
    }
  }
}

export interface OrgsStateModel {
  version: number;
  orgs: org_model[];
  loading: boolean;
}
