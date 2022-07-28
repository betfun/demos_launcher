import { Component, Input, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { OrgHelper, org_model } from '../../store/orgs/model';

@Component({
  selector: 'app-edit-org',
  templateUrl: './edit-org.component.html',
  styleUrls: ['./edit-org.component.scss']
})
export class EditOrgComponent implements OnInit {

  @Input()
  public org: org_model;

  profileForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  public getOrg(): org_model {
    const result = this.profileForm.value;

    const org = new org_model(this.org);

    const admin = OrgHelper.getAdmin(this.org);
    admin.name = result.main_user.name;
    admin.login = result.main_user.login;
    admin.pwd = result.main_user.pwd;
    org.name = result.name;

    return org;
  }

  ngOnInit(): void {

    const adminProfile = OrgHelper.getAdmin(this.org);

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
