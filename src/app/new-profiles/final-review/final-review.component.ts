import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LoginType, org_model, profile_model } from '../../store/orgs/model';

@Component({
  selector: 'app-final-review',
  templateUrl: './final-review.component.html',
  styleUrls: ['./final-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class FinalReviewComponent {

  profiles: profile_model[];

  displayedColumns: string[] = ['name', 'pwd', 'login'];
  communities: any[];

  private innerOrg: org_model;

  constructor() {
    this.org = new org_model({});
  }

  public get org(): org_model  {
    return this.innerOrg;
  }

  public set org(value: org_model) {
    this.innerOrg  = value;

    this.profiles = this.org.profiles.map(item => ({...item}));
    for (const element of this.profiles) {
         if(element.loginType === undefined) {element.loginType = LoginType.standard;}
    }
  }

  public setAvailableCommunities(communities: any[]): void {
    console.log(communities);
    this.communities = communities;
  }
}

