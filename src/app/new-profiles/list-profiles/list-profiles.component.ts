import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { SalesforceService } from '../../core/services';
import { OrgHelper, org_model, profile_model } from '../../store/orgs/model';

@Component({
  selector: 'app-list-profiles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-profiles.component.html',
  styleUrls: ['./list-profiles.component.scss']
})
export class ListProfilesComponent implements OnInit {

  public error = '';
  public loading$ = new BehaviorSubject<boolean>(true);

  profiles: any[];

  @ViewChild('list') private list: MatSelectionList;

  constructor(private sfdc: SalesforceService, private store: Store) { }

  set org(theOrg: org_model) {
    this.profiles = [];
    this.loading$.next(true);
    this.error = "";

    const default_pwd = this.store
      .selectSnapshot<string>(state => state.config.defaultPassword);

    console.log("Loading...");

    this.sfdc.getDbUsers(OrgHelper.getAdmin(theOrg))
      .then(profiles => {

        profiles = profiles.sort((a, b) => a.Name >= b.Name  ? 1 : -1);

        profiles.forEach(element => element.pwd = default_pwd);

        this.profiles = profiles.filter(e =>
          !theOrg.profiles.some((profile) => profile.login === e.Username)
        );
      }).catch(err => {
        this.error = err;
      }).finally(() =>
      {
        this.loading$.next(false);
      });
  }

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
