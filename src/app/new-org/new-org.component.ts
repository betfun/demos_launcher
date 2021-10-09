import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-org',
  templateUrl: './new-org.component.html',
  styleUrls: ['./new-org.component.scss']
})
export class NewOrgComponent implements OnInit {

  profileForm = this.fb.group({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    name: ['', Validators.required],
    main_user: this.fb.group({
      name: [''],
      login: [''],
      pwd: ['']
    })
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

}
