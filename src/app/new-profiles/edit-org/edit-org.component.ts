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

  public getOrg() : org_model{
    const result = this.profileForm.value;

    const org = new org_model(this.org);

    const admin = OrgHelper.getAdmin(this.org);
    admin.name = result.main_user.name;
    admin.login = result.main_user.login;
    admin.pwd = result.main_user.pwd;
    // if(admin.innerName === '') {
    //   admin.innerName = admin.name;
    // }

    org.name = result.name;
    // org.admin = result.main_user.innerName;
    // org.profiles.find(p => p.innerName === result.main_user.name){
    //   org.profiles[admin.innerName] = admin;
    // }
    // else{

    // }

    return org;
  }

  profileForm: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {

    const admin_profil = OrgHelper.getAdmin(this.org);

    this.profileForm = this.fb.group({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      name: [this.org.name, Validators.required],
      main_user: this.fb.group({
        name: admin_profil.name,
        login: admin_profil.login,
        pwd: admin_profil.pwd
      })
    });
  }
}
