import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SalesforceService } from '../../core/services';
import { OrgHelper, org_model } from '../../store/orgs/model';

@Component({
  selector: 'app-list-profiles',
  templateUrl: './list-profiles.component.html',
  styleUrls: ['./list-profiles.component.scss']
})
export class ListProfilesComponent implements OnInit {

  @Input() org: org_model;

  profiles: any[];

  constructor(private sfdc: SalesforceService, private store: Store) { }

  ngOnInit(): void {
    console.log(this.org);

    const default_pwd = this.store
      .selectSnapshot<string>(state => state.config.defaultPassword);

    this.sfdc.getDbUsers(OrgHelper.getAdmin(this.org))
      .then(profiles => {

        profiles.forEach(element => element.pwd = default_pwd);

        this.profiles = profiles.filter(e =>
          !this.org.profiles.some((profile) => profile.login == e.Username)
        );

        console.log(this.profiles[0]);
      });
  }
}
