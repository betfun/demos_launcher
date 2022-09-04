import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OrgExtensions, org_model, profile_model } from '../store/orgs/model';
import { EditOrgComponent } from './edit-org/edit-org.component';
import { ListProfilesComponent } from './list-profiles/list-profiles.component';
import { FinalReviewComponent } from './final-review/final-review.component';
import { SalesforceService } from '../core/services';

@Component({
  selector: 'app-new-profiles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './new-profiles.component.html',
  styleUrls: ['./new-profiles.component.scss'],
})
export class NewProfilesComponent {
  @ViewChild('editOrg') private orgEditor: EditOrgComponent;
  @ViewChild('newProfiles') private newProfilesEditor: ListProfilesComponent;
  @ViewChild('orgReview') private orgReview: FinalReviewComponent;

  public org: org_model;

  constructor(@Inject(MAT_DIALOG_DATA) public referenceOrg: org_model, private sfService: SalesforceService) {
    this.org = referenceOrg !== null ?
      new org_model(referenceOrg) :
      new org_model({});
  }

  changeSelection(event: any): void {
    const previousIndex: number = event.previouslySelectedIndex;

    if (previousIndex === 0) {
      this.org = this.orgEditor.getOrg();

      this.newProfilesEditor.org = this.org;

      // this.sfService.getDomain(OrgHelper.getAdmin(this.org)).then(domain => this.org.domain = domain);

    }

    if (previousIndex === 1) {
      const newProfiles: profile_model[] = this.newProfilesEditor.selectedProfiles;
      this.org.profiles.push(...newProfiles);

      // this.sfService.getCommunities(OrgExtensions.getAdminUser(this.org))
      //   .then(communities => {
      //     this.orgReview.setAvailableCommunities(communities);
      //     this.orgReview.org = this.org;
      //   });
    }
  }
}
