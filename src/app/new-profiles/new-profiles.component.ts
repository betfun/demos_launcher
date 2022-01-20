import { ChangeDetectionStrategy, Component, Inject, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { org_model, profile_model } from "../store/orgs/model";
import { EditOrgComponent } from "./edit-org/edit-org.component";
import { ListProfilesComponent } from "./list-profiles/list-profiles.component";
import { FinalReviewComponent } from "./final-review/final-review.component";

@Component({
  selector: "app-new-profiles",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./new-profiles.component.html",
  styleUrls: ["./new-profiles.component.scss"],
})
export class NewProfilesComponent {
  profiles: any[];

  public org: org_model;

  @ViewChild('editOrg') private orgEditor: EditOrgComponent;
  @ViewChild('newProfiles') private newProfilesEditor: ListProfilesComponent;
  @ViewChild('orgReview') private orgReview: FinalReviewComponent;

  constructor(@Inject(MAT_DIALOG_DATA) public referenceOrg: org_model) {
    this.org = referenceOrg !== null ?
      new org_model(referenceOrg):
      new org_model({});
  }

  changeSelection(event: any): void {
    const previousIndex: number = event.previouslySelectedIndex;

    if (previousIndex == 0) {
      this.org = this.orgEditor.getOrg();
      this.newProfilesEditor.org = this.org;
    }

    if(previousIndex == 1){
      const new_profiles : profile_model[] = this.newProfilesEditor.selectedProfiles;
      this.org.profiles.push(...new_profiles);
      this.orgReview.org = this.org;
    }
  }
}
