import { Injectable } from '@angular/core';
import { ProfileModel } from '../../../store/orgs/model';
import jsforce, { Connection } from 'jsforce';

export class SalesforceConnection {

  connected: boolean;
  userInfo: { name: string } = null;

  private connection: Connection;
  private admin: ProfileModel;
  private jsforce: typeof jsforce;

  constructor(adminProfile: ProfileModel) {
    this.jsforce = window.jsForce;
    this.admin = adminProfile;
  }

  async connect(): Promise<void> {
    this.connection = new this.jsforce.Connection({});
    try {
      const userInfo = await this.connection.login(this.admin.login, this.admin.pwd);

      this.connected = true;

      const res = await this.connection.identity();
      this.userInfo = { name: res.display_name };
    }
    catch {
      this.userInfo = null;
      this.connected = false;
      return null;
    }
  }

  async getDbUsers(): Promise<any> {

    const records = (await this.connection.query('SELECT Id, Username, Name FROM User')).records;
    // const records = await this.connection
    //   .sobject('User')
    //   .find();

    console.log(records);

    return records;
  }

  async getCommunities(): Promise<any> {

    return (await this.connection.query('SELECT Id, UrlPathPrefix, Name FROM Network')).records;
    // return this.connection.sobject('Network')
    //   .find()
    //   .execute();
  }
}

@Injectable({
  providedIn: 'root',
})
export class SalesforceService {

  async connection(adminProfile: ProfileModel): Promise<SalesforceConnection> {
    const sfConnection = new SalesforceConnection(adminProfile);
    await sfConnection.connect();

    return sfConnection;
  }

  // async getDomain(adminProfile: profile_model): Promise<any> {
  //   const conn = new this.jsforce.Connection({});
  //   await conn.login(adminProfile.login, adminProfile.pwd);

  //   return await conn.sobject('Domain').find().execute()
  //     .then((domain: any[]) => domain[0].Domain);
  // }
}
