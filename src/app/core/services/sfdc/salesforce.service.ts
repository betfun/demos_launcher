import { Injectable } from "@angular/core";
import * as jsforce from "jsforce";
// const { PassThrough } = require("stream");

@Injectable({
  providedIn: "root",
})
export class SalesforceService {
  jsforce: typeof jsforce;

  constructor() {
    this.jsforce = window.require("jsforce");
  }

  // async getPicture(url: string) {
  //   const response = await this.maxios({
  //     url,
  //     method: "GET",
  //     responseType: "stream",
  //     headers: { Authorization: "Bearer " + this._conn.accessToken },
  //   });

  //   const chunks = response.data.pipe(new PassThrough({ encoding: "base64" }));

  //   // then we use an async generator to read the chunks
  //   let str = "";
  //   for await (let chunk of chunks) {
  //     str += chunk;
  //   }

  //   const data = "data:" + response.headers["content-type"] + ";base64," + str;
  //   return data;
  // }

  async getDbUsers(adminProfile: { login: string; pwd: string }): Promise<any> {
    const conn = new this.jsforce.Connection({});
    await conn.login(adminProfile.login, adminProfile.pwd);

    return conn
      .sobject("User")
      .find(
        // conditions in JSON object
        { Key_User__c: true }
      )
      .execute({}, function (err, records) {
        if (err) {
          return console.error(err);
        }
        return records;
      });
  }

  // async getUsers(): Promise<any[]> {
  //     let cont = true;
  //     let page = 0;

  //     var users = [];
  //     while (cont) {
  //         let result = <any>(await this._conn.chatter.resource('/users', { page: page }));

  //         users.push(...result.users);
  //         cont = result.nextPageUrl !== null;

  //         page++;
  //     }

  //     return users;
  // }
}
