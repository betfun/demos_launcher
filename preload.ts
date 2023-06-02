const { contextBridge, ipcRenderer } = require('electron');
import * as jsForce from 'jsforce';
import { OrgModel, ProfileModel } from './src/app/store/orgs/model';
import { SupportedBrowsers } from './src/app/store/config/model';

contextBridge.exposeInMainWorld(
  'electron', {
  config:
  {
    load: () => ipcRenderer.sendSync('db:read', 'config.json', 'config'),
    save: (payload: any) => ipcRenderer.sendSync('db:write', payload, 'config.json', 'config')
  },
  chrome: {
    installed: (dir: string) => ipcRenderer.sendSync('dirExixts', dir),
    launch(org: OrgModel, browser: SupportedBrowsers, useMiddleware: boolean, profile: ProfileModel, useHomepage: boolean): any {
      return ipcRenderer.send('runChrome', org, browser, useMiddleware, profile, useHomepage);
    },
    delete: (org: OrgModel) => ipcRenderer.send('removeDir', org),
    kill: (orgId: string) => ipcRenderer.send('kill', orgId)
  },
  database: {
    load: () => {
      const fn = `db.json`;
      const orgs: any[] = ipcRenderer.sendSync('db:read', fn, 'orgs');
      const version: string = ipcRenderer.sendSync('db:read', fn, 'version');

      return { orgs, version };
    },
    save: (orgs: OrgModel[]) => {
      ipcRenderer.sendSync('db:write', orgs, 'db.json', 'orgs');
      ipcRenderer.sendSync('db:write', 2, 'db.json', 'version');
    }
  },
  salesforce:
  {
    connect: async (login: string, pwd: string) => {
      const connection = new jsForce.Connection({});

      try {
        await connection.login(login, pwd);

        const res = await connection.identity();

        const users = (await connection.query('SELECT Id, Username, Name FROM User')).records;
        const communities = (await connection.query('SELECT Id, UrlPathPrefix, Name FROM Network')).records;

        return {
          connected: true,
          name: res.display_name,
          users,
          communities
        };
      }
      catch (err) {
        return {
          connected: false
        };
      }
    }
  }
});

contextBridge.exposeInMainWorld('ipc', ipcRenderer);

console.log('**** Preload ****');
