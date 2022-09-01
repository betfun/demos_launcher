import { Component, Input, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { OrgExtensions, org_model } from '../../store/orgs/model';

@Component({
  selector: 'app-edit-org',
  templateUrl: './edit-org.component.html',
  styleUrls: ['./edit-org.component.scss']
})
export class EditOrgComponent implements OnInit {

  @Input()
  public org: org_model;

  profileForm: FormGroup<{
    name: FormControl<string | null>;
    mainUser: FormGroup<{
      name: FormControl<string | null>;
      login: FormControl<string | null>;
      pwd: FormControl<string | null>;
    }>;
  }>;

  constructor(private fb: FormBuilder) { }

  public getOrg(): org_model {
    const result = this.profileForm.value;

    const org = new org_model(this.org);

    const admin = OrgExtensions.getAdminUser(org);
    admin.name = result.mainUser.name;
    admin.login = result.mainUser.login;
    admin.pwd = result.mainUser.pwd;
    org.name = result.name;

    return org;
  }

  ngOnInit(): void {

    const adminProfile = OrgExtensions.getAdminUser(this.org);

    this.profileForm = this.fb.group({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      name: [this.org.name, Validators.required],
      mainUser: this.fb.group({
        name: adminProfile.name,
        login: adminProfile.login,
        pwd: adminProfile.pwd
      })
    });
  }
}
