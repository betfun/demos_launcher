import { OsMechanics } from './OsMechanics';
import * as childProcess from 'child_process';


export class MacOsMechanics extends OsMechanics {

  killall(): void {
    try {
      childProcess.execSync(`pkill -f Canary`, { stdio: 'ignore' });
    }
    catch (err) {
      // Ignore error
    }
  }

  launchRaw(command: string): void {
    try {
      childProcess.execSync(command);
    }
    catch (err) {

    }
  }
}
