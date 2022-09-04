import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { SalesforceService } from '../../core/services';
import { LoginType, OrgExtensions, org_model, profile_model } from '../../store/orgs/model';

@Component({
  selector: 'app-list-profiles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-profiles.component.html',
  styleUrls: ['./list-profiles.component.scss']
})
export class ListProfilesComponent {
  @ViewChild('list') private list: MatSelectionList;

  public error = '';
  public loading$ = new BehaviorSubject<boolean>(true);

  profiles: any[];

  constructor(private sfdc: SalesforceService, private store: Store) { }

  get selectedProfiles(): any[] {
    const newProfiles: profile_model[] = this.list.selectedOptions.selected
      .map(res => res.value)
      .map(p => ({
          name: p.Name,
          login: p.Username,
          pwd: p.pwd,
          loginType: LoginType.standard
        }));

    return newProfiles;
  }

  set org(theOrg: org_model) {
    this.profiles = [];
    this.loading$.next(true);
    this.error = '';

    const defaultPassword = this.store
      .selectSnapshot<string>(state => state.config.defaultPassword);

    console.log('Loading...');

  //   this.sfdc.getDbUsers(OrgExtensions.getAdminUser(theOrg))
  //     .then(profiles => {

  //       profiles = profiles.sort((a, b) => a.Name >= b.Name  ? 1 : -1);

  //       profiles.forEach(element => element.pwd = defaultPassword);

  //       this.profiles = profiles.filter(e =>
  //         !theOrg.profiles.some((profile) => profile.login === e.Username)
  //       );
  //     }).catch(err => {
  //       this.error = err;
  //     }).finally(() =>
  //     {
  //       this.loading$.next(false);
  //     });
   }
}
