import { AfterContentInit, AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

export type ProfileFormGroup = FormGroup<{
  name: FormControl<string | null>;
  login: FormControl<string | null>;
  pwd: FormControl<string | null>;
  loginType: FormControl<string | null>;
}>;

@Component({
  selector: 'app-profile-line',
  templateUrl: './profile-line.component.html',
  styleUrls: ['./profile-line.component.scss'],
})
export class ProfileLineComponent implements OnInit, AfterViewInit {

  @ViewChild('name') nameElement: ElementRef;

  @Input() formGroup: ProfileFormGroup;
  @Input() options: { name: string; login: string }[];
  @Input() comms: { name: string; url: string }[];

  filteredOptions: Observable<any[]>;

  ngOnInit() {
    this.filteredOptions = this.formGroup.controls.login.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value || '')));
  }

  ngAfterViewInit(): void {
    if (this.formGroup.value.name === '') {
      setTimeout(() => {
        this.nameElement.nativeElement.focus();
      });
    }
  }

  private filter(value: string): { name: string; login: string }[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.name.toLowerCase().includes(filterValue));
  }
}
