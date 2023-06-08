/* eslint-disable no-bitwise */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { GetConfig, SaveConfig } from './store/config/actions';
import { ConfigComponent } from './config/config.component';
import { Config } from '../app/store/config/model';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IpcRenderer } from 'electron';
import { LogUserActivity } from './store/auth/auth.actions';
import { SalesforceService } from './core/services';
import { OrgsStateModel, ProfileModel } from './store/orgs/model';
import { LoginType } from './store/orgs/model';
import { UpdateOrgInfos } from './store/orgs/actions';
import packageInfo from '../../package.json';
import { GenericMessage } from './store/chrome/actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public version = packageInfo.version;

  public spinnerMessage = '';

  private ipc: IpcRenderer;

  private readonly apiUrl = 'https://api.github.com/repos/davideappiano/demos_launcher/releases';

  constructor(
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar,
    private store: Store,
    private http: HttpClient,
    private dialog: MatDialog,
    private sf: SalesforceService,
  ) {
    this.store.dispatch(new GetConfig());
    this.ipc = window.ipc;
  }

  ngOnInit(): void {
    const userName = this.ipc.sendSync('getUserInfo');

    this.store.dispatch(new LogUserActivity(userName, this.version));

    this.store.select(state => state.tasks.loadingMessage).subscribe(loadingMessage => {
      this.spinnerMessage = loadingMessage;
      if (loadingMessage !== '') {
        this.spinner.show();
      }
      else {
        this.spinner.hide();
      }
    });

    this.http.get(this.apiUrl).subscribe(result => {

      const latestVersion = result[0];

      if (this.isNewerVersion(this.version, latestVersion.tag_name.substring(1))) {
        this.snackBar.open('New release available', 'OK');
      }
    });
  }

  runCheck(): void {
    const orgs = this.store.selectSnapshot<OrgsStateModel>(state => state.orgs).orgs;

    this.store.dispatch(new GenericMessage('Verification'));

    const tasks$: Promise<any>[] = [];
    for (const element of orgs) {

      if (!element.administrator?.login) {
        this.store.dispatch(new UpdateOrgInfos(element.id, { status: 'NOT ADMIN', expiryDate: '' }));
        continue;
      }

      const p: ProfileModel = {
        name: '',
        login: element.administrator.login,
        pwd: element.administrator.pwd,
        loginType: LoginType.standard
      };

      tasks$.push(
        this.sf.connect(p).then(conn =>
          this.store.dispatch(
            new UpdateOrgInfos(element.id, {
              status: conn.connected.toString(),
              expiryDate: conn.expiryDate
            })
          )));
    }

    Promise.all(tasks$)
      .finally(() => this.store.dispatch(new GenericMessage('')));
  }

  async openConfig(): Promise<void> {

    const dialogRef = this.dialog.open(ConfigComponent, {
      width: '500px',
      data: this.store.snapshot().config,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== null) {
        const config: Config = {
          browser: result.browser,
          defaultPassword: result.pwd
        };

        this.store.dispatch(new SaveConfig(config));
      }
    });
  }

  private isNewerVersion(oldVer: string, newVer: string): boolean {
    const oldParts = oldVer.split('.');
    const newParts = newVer.split('.');
    for (let i = 0; i < newParts.length; i++) {
      const a = ~~newParts[i]; // parse int
      const b = ~~oldParts[i]; // parse int
      if (a > b) { return true; }
      if (a < b) { return false; }
    }
    return false;
  }
}
