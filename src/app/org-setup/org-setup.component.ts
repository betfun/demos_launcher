import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Guid } from 'guid-typescript';
import { NgxSpinnerService } from 'ngx-spinner';
import { SalesforceService } from '../core/services';
import { OrgSave } from '../store/orgs/actions';
import { LoginType, OrgsStateModel, org_model, profile_model } from '../store/orgs/model';

type ProfileFormGroup = FormGroup<{
  name: FormControl<string | null>;
  login: FormControl<string | null>;
  pwd: FormControl<string | null>;
  loginType: FormControl<string | null>;
}>;

@Component({
  templateUrl: './org-setup.component.html',
  styleUrls: ['./org-setup.component.scss'],
})
export class OrgSetupComponent implements OnInit {
  sfUsers: { name: string; login: string }[] = [];
  comms: string[] = [];
  connection = '';

  profileForm: FormGroup<{
    name: FormControl<string | null>;
    mainUser: FormGroup<{
      login: FormControl<string | null>;
      pwd: FormControl<string | null>;
    }>;
    profiles: FormArray<ProfileFormGroup>;
  }>;

  private orgId: string;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private sf: SalesforceService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private store: Store) { }

  get profiles() {
    return this.profileForm.controls.profiles as FormArray;
  }

  get mainUser() {
    return this.profileForm.controls.mainUser;
  }

  getProfile(i: number): ProfileFormGroup {
    return this.profiles.controls[i] as ProfileFormGroup;
  }

  ngOnInit(): void {
    this.orgId = this.route.snapshot.paramMap.get('id');

    const org = this.store.selectSnapshot<OrgsStateModel>(state => state.orgs).orgs.find(o => o.id === this.orgId);

    const profiles = org?.profiles;
    this.profileForm = this.fb.group({
      name: [org?.name, Validators.required],
      mainUser: this.fb.group({
        login: [org?.administrator?.login, [Validators.email]],
        pwd: [org?.administrator?.pwd, Validators.required]
      }),
      profiles: this.fb.array(profiles.map(p => this.profileToForm(p)))
    });

    this.mainUser.valueChanges.subscribe(() => this.connection = '');
  }

  onSubmit(): void {
    const formValue = this.profileForm.value;

    const org: org_model = {
      id: this.orgId ?? Guid.create().toString(),
      domain: '',
      description: '',
      name: formValue.name,
      administrator: {
        login: formValue.mainUser.login,
        pwd: formValue.mainUser.pwd
      },
      profiles: formValue.profiles.map(formProfile => ({
        name: formProfile.name,
        login: formProfile.login,
        pwd: formProfile.pwd,
        loginType: formProfile.loginType
      }))
    };

    this.store.dispatch(new OrgSave(org));

    this.router.navigate(['/home']);
  }

  async verify(): Promise<void> {

    // this.store.snapshot().orgs.loadingMessage = 'dwdq';
    this.spinner.show();

    const val = this.profileForm.value.mainUser;

    const admin: profile_model = {
      login: val.login,
      pwd: val.pwd,
      name: 'Admin',
      loginType: LoginType.standard
    };

    const conn = await this.sf.connection(admin);

    if (conn.connected) {
      await conn.getDbUsers().then(users => {
        const sfUsers = users
          .map(user => ({ name: user.Name, login: user.Username }))
          .sort((a, b) => a.name.localeCompare(b.name));

        this.sfUsers = [...sfUsers];
      });

      conn.getCommunities().then(comms => {
        this.comms = comms
          .map(site => site.Name)
          .sort((a: string, b: string) => a.localeCompare(b));
      });
      this.connection = 'Connected';
    }
    else {
      this.connection = 'Error';
    }

    this.spinner.hide();
  }

  deleteProfile(index: number): void {
    this.profiles.removeAt(index);
  }

  duplicateProfile(index: number): void {
    const profile = this.getProfile(index).value;

    const newProfile: profile_model = {
      name: profile.name,
      login: profile.login,
      pwd: profile.pwd,
      loginType: profile.loginType
    };

    const formElement = this.profileToForm(newProfile);
    this.profileForm.controls.profiles.push(formElement);
  }

  addProfile(): void {
    const newProfile: profile_model = {
      name: '',
      login: '',
      pwd: '',
      loginType: LoginType.standard
    };

    const formElement = this.profileToForm(newProfile);
    this.profileForm.controls.profiles.push(formElement);
  }

  private profileToForm(p: profile_model):
    FormGroup<{ name: FormControl<string>; login: FormControl<string>; pwd: FormControl<string>; loginType: FormControl<string> }> {
    return this.fb.group({
      name: [p.name, Validators.required],
      login: [p.login, Validators.email],
      pwd: [p.pwd, Validators.required],
      loginType: [p.loginType, Validators.required],
    });
  }
}
