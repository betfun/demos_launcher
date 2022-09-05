import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Guid } from 'guid-typescript';
import { NgxSpinnerService } from 'ngx-spinner';
import { SalesforceService } from '../core/services';
import { OrgSave } from '../store/orgs/actions';
import { LoginType, OrgsStateModel, OrgModel, ProfileModel } from '../store/orgs/model';
import { Config } from '../store/config/model';
import { ProfileFormGroup } from './profile-line/profile-line.component';
import { ConfirmDialogService } from '../core/componentes/confirm-dialog/confirm-dialog.service';
import { OrgsInstallChrome } from '../store/chrome/actions';

type OrgFormGroup = FormGroup<{
  name: FormControl<string | null>;
  mainUser: FormGroup<{
    login: FormControl<string | null>;
    pwd: FormControl<string | null>;
  }>;
  profiles: FormArray<ProfileFormGroup>;
}>;

@Component({
  templateUrl: './org-setup.component.html',
  styleUrls: ['./org-setup.component.scss'],
})
export class OrgSetupComponent implements OnInit {
  sfUsers: { name: string; login: string }[] = [];
  comms: { name: string; url: string }[] = [];
  connection = '';
  user: string;

  profileForm: OrgFormGroup;

  private orgId: string;

  constructor(private route: ActivatedRoute,
    private dialog: ConfirmDialogService,
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
  }

  reinstall(): void {

    this.dialog.open({
      title: 'Save & Install',
      message: 'This action will reinstall all your Chrome profiles.\
      \n\nAll already available Profiles will be reset (bookmarks, extensions). \n\nAre you sure?',
      cancelText: 'Cancel',
      confirmText: 'OK'
    }).then(response => {

      if (!response) { return; }

      const org = this.formToOrg();

      this.store.dispatch([
        new OrgSave(org),
        new OrgsInstallChrome(org, true)
      ]);
    });
  }

  onSubmit(): void {

    this.dialog.open({
      title: 'Save & Install',
      message: 'Save your org and install the Chrome profiles?',
      cancelText: 'Cancel',
      confirmText: 'OK'
    }).then(response => {

      if (!response) { return; }

      const org = this.formToOrg();

      this.store.dispatch([
        new OrgSave(org),
        new OrgsInstallChrome(org, false)
      ]);

      this.router.navigate(['/home']);
    });
  }

  async verify(): Promise<void> {
    this.connection = '';
    this.spinner.show();

    const val = this.profileForm.value.mainUser;

    const admin: ProfileModel = {
      login: val.login,
      pwd: val.pwd,
      name: 'Admin',
      loginType: LoginType.standard
    };

    const conn = await this.sf.connection(admin);

    if (conn.connected) {
      this.user = conn.userInfo.name;

      await conn.getDbUsers().then(users => {
        const sfUsers = users
          .map(user => ({ name: user.Name, login: user.Username }))
          .sort((a, b) => a.name.localeCompare(b.name));

        this.sfUsers = [...sfUsers];
      });

      conn.getCommunities().then(comms => {
        this.comms = comms
          .map(site => ({ name: site.Name, url: site.UrlPathPrefix}))
          .sort((a: any, b: any) => a.name.localeCompare(b));
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

    const newProfile: ProfileModel = {
      name: '',
      login: profile.login,
      pwd: profile.pwd,
      loginType: profile.loginType
    };

    const formElement = this.profileToForm(newProfile);
    this.profileForm.controls.profiles.push(formElement);
  }

  addProfile(): void {
    const cfg = this.store.selectSnapshot<Config>(state => state.config);

    const newProfile: ProfileModel = {
      name: '',
      login: '',
      pwd: cfg.defaultPassword,
      loginType: LoginType.standard
    };

    const formElement = this.profileToForm(newProfile);
    this.profileForm.controls.profiles.push(formElement);
  }

  private profileToForm(p: ProfileModel): ProfileFormGroup {
    return this.fb.group({
      name: [p.name, Validators.required],
      login: [p.login, Validators.email],
      pwd: [p.pwd, Validators.required],
      loginType: [p.loginType, Validators.required],
    });
  }

  private formToOrg(): OrgModel {
    const formValue = this.profileForm.value;

    const org: OrgModel = {
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

    return org;
  }
}

