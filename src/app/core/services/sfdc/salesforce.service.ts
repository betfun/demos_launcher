import { Injectable } from '@angular/core';
import { ProfileModel } from '../../../store/orgs/model';

@Injectable({
  providedIn: 'root',
})
export class SalesforceService {
  async connect(admin: ProfileModel){
    return await window.electron.salesforce.connect(admin.login, admin.pwd);
  }
}
