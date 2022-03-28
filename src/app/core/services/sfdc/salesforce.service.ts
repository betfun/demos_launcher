import { UrlResolver } from "@angular/compiler";
import { Injectable } from "@angular/core";
import { constants } from "buffer";
import * as jsforce from "jsforce";
import { stringify } from "querystring";
import { profile_model } from "../../../store/orgs/model";
// const { PassThrough } = require("stream");

@Injectable({
  providedIn: "root",
})
export class SalesforceService {
  jsforce: typeof jsforce;

  constructor() {
    this.jsforce = window.require("jsforce");
  }

  async getDomain(adminProfile: profile_model): Promise<any> {
    const conn = new this.jsforce.Connection({});
    await conn.login(adminProfile.login, adminProfile.pwd);

    return await conn.sobject('Domain').find().execute()
      .then((domain: any[]) => domain[0].Domain);
  }

  async getCommunities(adminProfile: profile_model): Promise<any> {
    const conn = new this.jsforce.Connection({});
    await conn.login(adminProfile.login, adminProfile.pwd);

    return conn.sobject('Network')
      .find()
      .execute();
  }

  async getDbUsers(adminProfile: profile_model): Promise<any> {
    const conn = new this.jsforce.Connection({});
    await conn.login(adminProfile.login, adminProfile.pwd);

    const md = (await conn.metadata.read("CustomObject", ['User'])) as any;

    const conditions = md.fields.some(x => x.fullName === 'Key_User__c') ?
      { Key_User__c: true } : {};

    return conn
      .sobject("User")
      .find(
        // conditions in JSON object
        conditions
      )
      .execute({}, function (err, records) {
        if (err) {
          return console.error(err);
        }
        return records;
      });
  }
}
