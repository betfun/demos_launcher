import { Component, OnInit } from '@angular/core';
import { org_model } from '../../store/orgs/model';

@Component({
  selector: 'app-final-review',
  templateUrl: './final-review.component.html',
  styleUrls: ['./final-review.component.scss']
})
export class FinalReviewComponent {

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

    for (const element of this.org.profiles) {
        if(element.loginType === undefined) {element.loginType = 'Standard';}
    }
  }

  public setAvailableCommunities(communities: any[]): void {
    console.log(communities);
    this.communities = communities;
  }
}

