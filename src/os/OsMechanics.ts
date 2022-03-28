import { shell } from 'electron';


export abstract class OsMechanics {
  abstract killall(): void;

  openExternal(url: string): void {
    shell.openExternal(url);
  }
}
