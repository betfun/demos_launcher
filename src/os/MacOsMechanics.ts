import { OsMechanics } from './OsMechanics';

export class MacOsMechanics extends OsMechanics {

  killall(): void {
    try {
      this.launchRaw(`pkill -f Canary`);
    }
    catch (err) {
      // Ignore error
    }
  }
}
