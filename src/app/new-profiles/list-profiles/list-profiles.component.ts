import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { Store } from '@ngxs/store';
import { SalesforceService } from '../../core/services';
import { OrgHelper, org_model, profile_model } from '../../store/orgs/model';

@Component({
  selector: 'app-list-profiles',
  templateUrl: './list-profiles.component.html',
  styleUrls: ['./list-profiles.component.scss']
})
export class ListProfilesComponent implements OnInit {

  public error = '';
  public loading = true;

  @ViewChild('list') private list: MatSelectionList;

  set org(theOrg: org_model) {
    const default_pwd = this.store
      .selectSnapshot<string>(state => state.config.defaultPassword);

    console.log("Loading...");
    this.sfdc.getDbUsers(OrgHelper.getAdmin(theOrg))
      .then(profiles => {

        profiles.forEach(element => element.pwd = default_pwd);

        this.profiles = profiles.filter(e =>
          !theOrg.profiles.some((profile) => profile.login == e.Username)
        );

        this.loading = false;
      }).catch(err => {
        this.error = err;
      }).finally(() => this.loading = false);
  }

  profiles: any[];

  constructor(private sfdc: SalesforceService, private store: Store) { }

  get selectedProfiles(): any[] {
    const new_profiles: profile_model[] = this.list.selectedOptions.selected
      .map(res => res.value)
      .map(p => {
        return {
          name: p.Name,
          innerName: p.Name,
          login: p.Username,
          pwd: p.pwd,
        };
      });

    return new_profiles;
  }

  ngOnInit(): void {

  }
}
