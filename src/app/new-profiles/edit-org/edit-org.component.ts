import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { OrgHelper, org_model } from '../../store/orgs/model';

@Component({
  selector: 'app-edit-org',
  templateUrl: './edit-org.component.html',
  styleUrls: ['./edit-org.component.scss']
})
export class EditOrgComponent implements OnInit {

  @Input() org: org_model;

  profileForm: FormGroup;

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

  constructor(private fb: FormBuilder) { }
}
