import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SalesforceService } from '../core/services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-new-profiles',
  templateUrl: './new-profiles.component.html',
  styleUrls: ['./new-profiles.component.scss']
})
export class NewProfilesComponent implements OnInit {

  profiles: any[];

  constructor(
    private sfdc: SalesforceService,
    private _DomSanitizationService: DomSanitizer,
    public dialogRef: MatDialogRef<NewProfilesComponent>,
    @Inject(MAT_DIALOG_DATA) public org: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() : void {
    this.sfdc.create(this.org.profiles[0]).then( () => {
      this.sfdc.getDbUsers().then(profiles => {


        // for (let i = 0; i < profiles.length; i++∏) {
        //   console.log('Loading... ' + i)
        //   const x = <string>(await this.sfdc.getPicture((<any>(profiles[i])).SmallPhotoUrl));
        //   profiles[i]['img'] = this._DomSanitizationService.bypassSecurityTrustUrl(x);
        //   console.log('Loaded... ' + i)
        //   // vm.imageTo64((<any>(records[i])).FullPhotoUrl, (path64) => records[i]['img'] = path64);
        // }
        this.profiles = profiles;
        console.log(profiles);
      });
    });
  }
}
