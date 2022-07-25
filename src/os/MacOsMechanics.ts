import { OsMechanics } from "./OsMechanics";
import * as childProcess from "child_process";


export class MacOsMechanics extends OsMechanics {

  killall(): void {
    try {
      childProcess.execSync(`pkill -f Canary`, { stdio: 'ignore' });
    }
    catch (err) {
      // Ignore error
    }
  }

  launchRaw(launch_command : string) : void {
    childProcess.execSync(launch_command);
  }
}
