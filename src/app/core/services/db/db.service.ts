import { Injectable } from '@angular/core';
import { LoginType, OrgModel, ProfileModel } from '../../../store/orgs/model';
import { Guid } from 'guid-typescript';


@Injectable({
  providedIn: 'root',
})
export class DbService {

  public static getOrgs(): OrgModel[] {

    const ipc = window.ipc;
    const fn = `db.json`;

    const orgs: OrgModel[] = ipc.sendSync('db:read', fn, 'orgs');
    const version: string = ipc.sendSync('db:read', fn, 'version');

    // Latest versiodow.ipc
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
        domain: org.domain
      };
    });
  }

  public static save(orgs: OrgModel[]): void {
    window.ipc.sendSync('db:write', orgs, 'db.json', 'orgs');
    window.ipc.sendSync('db:write', 2, 'db.json', 'version');
  }
}
