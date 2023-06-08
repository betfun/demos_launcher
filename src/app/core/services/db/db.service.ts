import { Injectable } from '@angular/core';
import { LoginType, OrgModel, ProfileModel } from '../../../store/orgs/model';
import { Guid } from 'guid-typescript';

@Injectable({
  providedIn: 'root',
})
export class DbService {

  public static getOrgs(): OrgModel[] {
    const {version, orgsDTO} = window.electron.database.load();

    const orgs = orgsDTO ? orgsDTO.map(o => {
      const org: OrgModel = {
        administrator: {
          login: o.administrator?.login,
          pwd: o.administrator?.pwd
        },
        description: '',
        id: o.id,
        name: o.name,
        profiles: [],
        domain: '',
        info: {
          status: '',
          expiryDate: ''
        }
      };

      Object.assign(org.profiles, o.profiles);
      return org;
    }) : [];

    // Version check
    if (version !== undefined) {
      return orgs;
    }

    // Migration
    return orgs.map(org => {

      const adminProfile = org.profiles.find(p => (p as any).innerName === (org as any).admin ||
        p.name === (org as any).admin);

      if (adminProfile !== undefined) {
        org.profiles = org.profiles.filter(p => (p as any).innerName !== (org as any).admin &&
          p.name !== (org as any).admin);

        org.administrator = {
          login: adminProfile.login,
          pwd: adminProfile.pwd
        };
      }

      return {
        profiles: org.profiles.map(prof => ({
          name: prof.name,
          login: prof.login,
          pwd: prof.pwd,
          loginType: prof.loginType ?? LoginType.standard
        })),

        id: (org.id === null || org.id === undefined) ? Guid.create().toString() : org.id,
        description: org.description,
        name: org.name,
        administrator: org.administrator,
        domain: org.domain,
        info: {
          status: '',
          expiryDate: null
        }
      };
    });
  }

  public static save(orgs: OrgModel[]): void {
    window.electron.database.save(orgs);
  }
}
