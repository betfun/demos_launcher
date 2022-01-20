import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
import { Select, Store } from "@ngxs/store";
import { GetConfig, SaveConfig } from "./store/config/actions";
import { ConfigComponent } from "./config/config.component";
import { Config } from "../app/store/config/model";
import { OrgSave, OrgsInstallChrome } from './store/orgs/actions';
import { NewProfilesComponent } from "./new-profiles/new-profiles.component";
import { Observable } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {

  @Select(state => state.orgs.loading) isLoading$: Observable<boolean>;

  constructor(
    private store: Store,
    public dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang("en");
    this.store.dispatch(new GetConfig());
    // this.store.select(state => state.orgs.loading)
    //   .subscribe(isLoading => {
    //     this.isLoading = isLoading;
    //   });
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
