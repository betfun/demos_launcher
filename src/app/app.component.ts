import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { NewOrgComponent } from "./new-org/new-org.component";
import { Store } from "@ngxs/store";
import { GetConfig, SaveConfig } from "./store/config/actions";
import { ConfigComponent } from "./config/config.component";
import { Config } from "../app/store/config/model";
import { OrgSave } from './store/orgs/actions';
import { org_model } from "./store/orgs/model";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  constructor(
    private store: Store,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang("en");
    this.store.dispatch(new GetConfig());
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
    const dialogRef = this.dialog.open(NewOrgComponent, {
      width: "500px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === undefined || result === null) return;

      // TODO : Da rifare
      const neworg : org_model = {
        name: result.name,
        description: "",
        domain: "",
        admin: result.main_user.name,
        profiles: [
          {
            name: result.main_user.name,
            innerName: result.main_user.name,
            login: result.main_user.login,
            pwd: result.main_user.pwd,
          },
        ]
      };

      this.store.dispatch(new OrgSave(neworg));
    });
  }
}
