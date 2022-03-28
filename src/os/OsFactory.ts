import { MacOsMechanics } from "./MacOsMechanics";
import { OsMechanics } from "./OsMechanics";


export class OsFactory {
  public static Create(): OsMechanics {
    if (process.platform === 'darwin') {
      return new MacOsMechanics();
    }

    throw new Error("UnSupported OS");
  }
}
