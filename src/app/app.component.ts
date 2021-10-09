import { Component } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { NewOrgComponent } from './new-org/new-org.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    public dialog: MatDialog,   
    private electronService: ElectronService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }


  add_new_org(): void {
    const dialogRef = this.dialog.open(NewOrgComponent, {
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      // const new_profiles = result.map(res => res.value).map(p => {
      //   return {
      //     name: p.Name,
      //     login: p.Username,
      //     pwd: "Salesforce1"
      //   };
      // });

      // this.dbService.newProfiles(org.name, new_profiles);

      console.log('The dialog was closed');
    });
    // this.electronService.install(element.name, element.profiles[0])
  }
}
