import { shell } from 'electron';


export abstract class OsMechanics {

  abstract killall(): void;
  abstract launchRaw(launch_command : string) : void;

  openExternal(url: string): void {
    shell.openExternal(url);
  }
}
