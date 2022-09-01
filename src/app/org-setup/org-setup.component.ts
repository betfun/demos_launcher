import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { OrgsStateModel } from '../store/orgs/model';

@Component({
  templateUrl: './org-setup.component.html',
  styleUrls: ['./org-setup.component.scss']
})
export class OrgSetupComponent implements OnInit {

  profileForm: FormGroup<{
    name: FormControl<string | null>;
    mainUser: FormGroup<{
      name: FormControl<string | null>;
      login: FormControl<string | null>;
      pwd: FormControl<string | null>;
    }>;
  }>;

  constructor(private route: ActivatedRoute,
     private fb: FormBuilder,
     private store: Store) { }

  ngOnInit(): void {
    const orgId = this.route.snapshot.paramMap.get('id');

    const org = this.store.selectSnapshot<OrgsStateModel>(state => state.orgs).orgs.find(o => o.id === orgId);
    this.profileForm = this.fb.group({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      name: [org.name, Validators.required],
      mainUser: this.fb.group({
        name: '',
        login: '',
        pwd: ''
      })
    });
  }
}
