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
    this.profiles = [];
    Object.assign(this, ref);
  }
}

export class OrgHelper {
  static getAdmin(org: org_model): profile_model {
    const empty_profile = {
      name: '',
      innerName: 'admin',
      login: '',
      pwd: ''
    };

    if(org.admin === undefined){
      org.admin = 'admin';
    }

    try{
      const p = org.profiles.find(p => p.innerName === org.admin);
      if(p === undefined){
        org.profiles.unshift(empty_profile);
        return empty_profile;
      }
      return p;
    }
    catch{
      return empty_profile;
    }
  }
}

export interface OrgsStateModel {
  version: number,
  orgs: org_model[];
  loading: boolean
}
