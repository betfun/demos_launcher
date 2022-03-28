import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngxs/store";
import { GetConfig, SaveConfig } from "./store/config/actions";
import { ConfigComponent } from "./config/config.component";
import { Config } from "../app/store/config/model";
import { OrgSave } from './store/orgs/actions';
import { NewProfilesComponent } from "./new-profiles/new-profiles.component";
import { NgxSpinnerService } from "ngx-spinner";
import { version } from '../../package.json';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IpcRenderer } from 'electron';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  private ipc: IpcRenderer;

  private readonly relasesUrl = 'https://github.com/davideappiano/demos_launcher/releases';
  private readonly apiUrl = 'https://api.github.com/repos/davideappiano/demos_launcher/releases';
  private readonly scUrl = 'https://solutionscentral.io/posts/5de95f70-72e7-11ec-9e6d-f1bf609be4ef/managing-personas-for-demos/';

  public version = version;

  constructor(
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar,
    private store: Store,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    this.store.dispatch(new GetConfig());
    this.ipc = (<any>window).require('electron').ipcRenderer;
  }

  private isNewerVersion(oldVer, newVer): boolean {
    const oldParts = oldVer.split('.');
    const newParts = newVer.split('.');
    for (let i = 0; i < newParts.length; i++) {
      const a = ~~newParts[i]; // parse int
      const b = ~~oldParts[i]; // parse int
      if (a > b) return true;
      if (a < b) return false;
    }
    return false;
  }

  ngOnInit(): void {
    this.store.select(state => state.orgs.loading).subscribe(isLoading => {
      if (isLoading) {
        this.spinner.show();
      }
      else {
        this.spinner.hide();
      }
    });

    this.http.get(this.apiUrl).subscribe(result => {

      const latest_version = result[0];

      if (this.isNewerVersion(this.version, latest_version.tag_name.substring(1))) {
        this.snackBar.open('New release available', 'OK');
      }
    });
  }

  open_config(): void {
    const dialogRef = this.dialog.open(ConfigComponent, {
      width: "500px",
      data: this.store.snapshot().config,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== null) {
        const config: Config = {
          browser: result.browser,
          defaultPassword: result.pwd,
          useMiddleware: result.useMiddleware
        };

        this.store.dispatch(new SaveConfig(config));
      }
    });
  }

  add_new_org(): void {
    const dialogRef = this.dialog.open(NewProfilesComponent, {
      width: "500px",
      data: null
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === undefined || result === null) return;

      this.store.dispatch(new OrgSave(result));
    });
  }

  open_github() : void {
    this.ipc.send('open_ext', [this.relasesUrl]);
  }

  open_solution_central() : void {
    this.ipc.send('open_ext', [this.scUrl]);
  }
}
