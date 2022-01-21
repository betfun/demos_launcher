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
import { timer } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {

  public version = version;
  constructor(
    private spinner: NgxSpinnerService,
    private store: Store,
    private dialog: MatDialog
  ) {
    this.store.dispatch(new GetConfig());
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
}
