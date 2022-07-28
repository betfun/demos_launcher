import { shell } from 'electron';

export abstract class OsMechanics {

  openExternal(url: string): void {
    shell.openExternal(url);
  }

  getUserDir(): string {
    return `${process.env.HOME}/.demos_launcher`;
  }

  abstract killall(): void;
  abstract launchRaw(command: string): void;
}
