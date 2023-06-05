import { OrgModel } from '../app/store/orgs/model';
import { OsMechanics } from './OsMechanics';
import * as childProcess from 'child_process';

export class MacOsMechanics extends OsMechanics {

  killall(): void {
    const fn = `db.json`;
    const orgs: OrgModel[] = this.readDb(fn, 'orgs');

    orgs.forEach(org => this.kill(org.id));
  }

  kill(orgId: string): void {
    childProcess.exec(`pkill -f '${orgId}'`);
  }
}
