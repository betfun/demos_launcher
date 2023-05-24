import { shell } from 'electron';
import * as lowdb from 'lowdb';
import * as fs from 'fs';
import * as fileSync from 'lowdb/adapters/FileSync';
import * as childProcess from 'child_process';
import * as os from 'os';
import * as path from 'path';

export abstract class OsMechanics {

  openExternal(url: string): void {
    shell.openExternal(url);
  }

  getUserName(): string {
    return process.env.username ?? process.env.user ?? os?.userInfo?.()?.username;
  }

  getUserDir(): string {
    return `${process.env.HOME}/.demos_launcher`;
  }

  readFile(fn: string) {
    return JSON.parse(fs.readFileSync(fn, 'utf8'));
  }

  writeFile(obj: any, fn: string): boolean {
    try {
      const dir = path.dirname(fn);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(fn, JSON.stringify(obj), 'utf8');
    }
    catch {
      return false;
    }

    return true;
  }

  writeDb(obj: any, fn: string, what: string): void {
    const dir = this.getUserDir();
    const adapter = new fileSync(`${dir}/${fn}`);

    const db = lowdb(adapter);

    db.set(what, obj).write();
  }

  readDb(fn: string, what: string): any {
    const dir = this.getUserDir();

    if (!fs.existsSync(dir)) {
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) { throw err; }
      });
    }

    const adapter = new fileSync(`${dir}/${fn}`);

    const db = lowdb(adapter);

    return db.get(what).value();
  }

  launchRaw(command: string): boolean {
    try {
      childProcess.execSync(command, { stdio: 'ignore' });
    }
    catch (err) {
      return false;
    }

    return true;
  }

  deleteDir(dir: string): boolean {
    try {
      fs.rmdirSync(dir, { recursive: true });
    }
    catch (err) {
      return false;
    }

    return true;
  }

  abstract killall(): void;
}
