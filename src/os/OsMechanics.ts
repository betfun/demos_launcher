import { shell } from 'electron';
import * as lowdb from 'lowdb';
import * as fs from 'fs';
import * as fileSync from 'lowdb/adapters/FileSync';

export abstract class OsMechanics {

  openExternal(url: string): void {
    shell.openExternal(url);
  }

  getUserDir(): string {
    return `${process.env.HOME}/.demos_launcher`;
  }

  readFile(fn: string){
    return JSON.parse(fs.readFileSync(fn, 'utf8'));
  }

  writeFile(obj: any, fn: string){
    fs.writeFileSync(fn, JSON.stringify(obj), 'utf8');
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

  abstract killall(): void;
  abstract launchRaw(command: string): void;
}
