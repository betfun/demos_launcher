import { contextBridge, ipcRenderer } from 'electron';
import { Connection } from 'jsforce';
import { OrgModel, OrgModelDTO, ProfileModel } from './src/app/store/orgs/model';
import { SupportedBrowsers } from './src/app/store/config/model';

contextBridge.exposeInMainWorld('electron', {
  config:
  {
    load: () => ipcRenderer.sendSync('db:read', 'config.json', 'config'),
    save: (payload: any) => ipcRenderer.sendSync('db:write', payload, 'config.json', 'config')
  },
  chrome: {
    installed: (dir: string) => ipcRenderer.sendSync('dirExixts', dir),
    launch(org: OrgModel, browser: SupportedBrowsers, profile: ProfileModel, useHomepage: boolean): any {
      return ipcRenderer.send('runChrome', org, browser, profile, useHomepage);
    },
    delete: (org: OrgModel) => ipcRenderer.send('removeDir', org),
    kill: (orgId: string) => ipcRenderer.send('kill', orgId)
  },
  database: {
    load: () => {
      const fn = `db.json`;
      const orgs: OrgModelDTO[] = ipcRenderer.sendSync('db:read', fn, 'orgs');
      const version: string = ipcRenderer.sendSync('db:read', fn, 'version');

      return { orgsDTO: orgs, version };
    },
    save: (orgs: OrgModel[]) => {
      const dtos = orgs.map(o => OrgModelDTO.fromModelView(o));

      ipcRenderer.sendSync('db:write', dtos, 'db.json', 'orgs');
      ipcRenderer.sendSync('db:write', 2, 'db.json', 'version');
    }
  },
  salesforce:
  {
    connect: async (login: string, pwd: string) => {
      const connection = new Connection({});

      const retValue = {
        connected: false,
        name: '',
        users: [],
        communities: [],
        expiryDate: ''
      };

      try {
        const log = await connection.login(login, pwd);

        Promise.race([
          await Promise.all([
            connection.identity()
              .then(result => retValue.name = result.display_name)
              .catch(_err => {}),

            Promise.race(
              [connection.query('SELECT Id, Username, Name FROM User')
                .then(result => retValue.users = result.records)
                .catch(_err => {}),

              setTimeout(null, 50000)]),

            Promise.race(
              [connection.query('SELECT Id, UrlPathPrefix, Name FROM Network')
                .then(result => retValue.communities = result.records)
                .catch(_err => {}),

              setTimeout(null, 50000)]),

            Promise.race(
              [connection.query('Select TrialExpirationDate from Organization')
                .then(result => retValue.expiryDate = (result.records[0] as any).TrialExpirationDate)
                .catch(_err => {}),

              setTimeout(null, 50000)]),

          ]), setTimeout(null, 5 * 60 * 1000)]);

        retValue.connected = true;
      } catch { }

      return retValue;
    }
  }
});

contextBridge.exposeInMainWorld('ipc', ipcRenderer);

console.log('**** Preload ****');
