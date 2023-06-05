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
import packageInfo from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public version = packageInfo.version;

  public spinnerMessage = '';

  private ipc: IpcRenderer;

  private readonly relasesUrl = 'https://github.com/davideappiano/demos_launcher/releases';
  private readonly apiUrl = 'https://api.github.com/repos/davideappiano/demos_launcher/releases';
  private readonly scUrl = 'https://solutionscentral.io/posts/5de95f70-72e7-11ec-9e6d-f1bf609be4ef/managing-personas-for-demos/';

  constructor(
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar,
    private store: Store,
    private http: HttpClient,
    private dialog: MatDialog,
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

  openConfig(): void {
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

  openGithub(): void {
    window.ipc.send('open_ext', [this.relasesUrl]);
  }

  openSolutionCentral(): void {
    window.ipc.send('open_ext', [this.scUrl]);
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
