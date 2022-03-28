import { Component, OnInit } from '@angular/core';
import { org_model } from '../../store/orgs/model';

@Component({
  selector: 'app-final-review',
  templateUrl: './final-review.component.html',
  styleUrls: ['./final-review.component.scss']
})
export class FinalReviewComponent implements OnInit {

  displayedColumns: string[] = ["name", "pwd", "login"];
  communities: any[];

  private _org : org_model;

  public get org() : org_model  {
    return this._org;
  }

  public set org(value: org_model) {
    this._org  = value;
    for (let index = 0; index < this._org.profiles.length; index++) {
      const element = this._org.profiles[index];
      if(element.loginType === undefined) element.loginType = 'Standard';
    }
  }

  public setAvailableCommunities(communities : any[]) : void {
    console.log(communities);
    this.communities = communities;
  }

  constructor() {
    this.org = new org_model({});
  }

  async ngOnInit(): Promise<void> {

  }
}

