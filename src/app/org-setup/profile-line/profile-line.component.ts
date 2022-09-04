import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { profile_model } from '../../store/orgs/model';

@Component({
  selector: 'app-profile-line',
  templateUrl: './profile-line.component.html',
  styleUrls: ['./profile-line.component.scss'],
})
export class ProfileLineComponent implements OnInit {

  @Input() formGroup: FormGroup;
  @Input() options: { name: string; login: string }[];
  @Input() comms: any[];

  filteredOptions: Observable<any[]>;

  ngOnInit() {
    this.filteredOptions = this.formGroup.controls.login.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value || '')));
  }

  private filter(value: string): { name: string; login: string }[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }
}
