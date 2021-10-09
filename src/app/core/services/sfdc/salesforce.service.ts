import { ipcMain } from 'electron';
import { Injectable } from '@angular/core';
import * as jsforce from 'jsforce';
const axios = require('axios');
const { PassThrough } = require("stream");

@Injectable({
    providedIn: 'root'
})
export class SalesforceService {
    _conn: jsforce.Connection;
    jsforce: typeof jsforce;
    maxios: typeof axios;

    constructor() {
        this.jsforce = window.require('jsforce');
        this.maxios = window.require('axios');
        this._conn = new this.jsforce.Connection({});
    }

    async create(adminProfile: { login: string; pwd: string; }) {
        // 'jverbecque@dassaultaviation2018.demo', 'Salesforce1'
        console.log(adminProfile);
        return this._conn.login(adminProfile.login, adminProfile.pwd);
    }

    async getPicture(url: string) {

        const response = await this.maxios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: { 'Authorization': 'Bearer ' + this._conn.accessToken }
        });

        const chunks = response.data
            .pipe(new PassThrough({ encoding: 'base64' }));

        // then we use an async generator to read the chunks
        let str = '';
        for await (let chunk of chunks) {
            str += chunk;
        }

        const data = "data:" + response.headers["content-type"] + ";base64," + str;
        return data;
    }

    async getDbUsers(): Promise<any> {
        console.log(this._conn.instanceUrl);
        const vm = this;
        return this._conn.sobject("User")
            .find(
                // conditions in JSON object
                { Key_User__c: false })
            .execute({}, function (err, records) {
                if (err) { return console.error(err); }
                console.log("fetched : " + records.length);

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