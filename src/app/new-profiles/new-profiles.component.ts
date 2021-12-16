import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SalesforceService } from "../core/services";
import { Store } from "@ngxs/store";
import { OrgHelper, org_model } from "../store/orgs/model";

@Component({
  selector: "app-new-profiles",
  templateUrl: "./new-profiles.component.html",
  styleUrls: ["./new-profiles.component.scss"],
})
export class NewProfilesComponent implements OnInit {
  profiles: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public org: org_model
  ) { }

  ngOnInit(): void {
  }
}
